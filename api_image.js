//
// app.post('/image/:userid', async (req, res) => {...});
//
// Uploads an image to the bucket and updates the database,
// returning the asset id assigned to this image.
//
const dbConnection = require('./database.js')
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

const uuid = require('uuid');

exports.post_image = async (req, res) => {

  console.log("call to /image...");

  try {

    var data = req.body;  // data => JS object
    var assetname = data.assetname;
    var S = data.data;

    //first, extract the parameter from the URL
    userid = req.params.userid;
    console.log(userid) //for testing on client side

    var rds_response = new Promise((resolve, reject) => {

      console.log("/image: calling RDS...");

      var sql = `
      Select * from users 
      where userid = ?;
     `;

      var params = [userid];

      dbConnection.query(sql, params, (err, results, _) => {
        if (err) {
          reject(err);
          return;
        }
        console.log("/image query done");
        resolve(results);
      });
    });
    
    var rds_result = await rds_response
    console.log(rds_result)

    //if userid does not exist: 
    if (rds_result.length==0) {
          res.json({
          "message": "no such user...",
          "assetid": -1,
          });
          return  
        }

    //if user does exist, image is uploaded to S3
    else {
    
    console.log("/image: uploading to S3...");

    //find user's unique bucket folder 
    bucketfolder = rds_result[0]["bucketfolder"]
    //console.log(bucketfolder)
    var bytes = Buffer.from(S, 'base64')
    var name = uuid.v4();
    var bucketkey = bucketfolder + "/" + name + ".jpg"
    
    var command = new PutObjectCommand({
      Bucket: s3_bucket_name,
      Key: bucketkey,
      Body: bytes,
      ACL: "public-read",
    });

    var s3_response = await s3.send(command);
    //console.log(s3_response)

    console.log("/image: inserting into assets table...");

    //insert a new row in the assets table          
    row = [userid, assetname, bucketkey]
      
    var sql = `
        insert into assets (userid, assetname, bucketkey)
        values(?, ?, ?);`;

    dbConnection.query(sql, row, (err, results, _) => {
        if (err) {
          throw err;
        }
        console.log(results.affectedRows == 1) //should be true
        res.json({
          "message": "success",
          "assetid": results.insertId,
          });
        })

    }//else
    //throw new Error("TODO: /image");
    

  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "assetid": -1
    });
  }//catch

}//post
