//
// app.get('/download/:assetid', async (req, res) => {...});
//
// downloads an asset from S3 bucket and sends it back to the
// client as a base64-encoded string.
//
const dbConnection = require('./database.js') 
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_download = async (req, res) => {

  console.log("call to /download...");

  try {

    //
    // TODO
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/getobjectcommand.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //
    
    //first, extract the parameter from the URL
    assetid = req.params.assetid;
    //console.log(assetid) pulls the parameter from the URL

   // calling RDS to get asset information with assetid. turn the DB call with callback into a PROMISE
    var rds_response = new Promise((resolve, reject) => {

      console.log("/download: calling RDS...");
      console.log(assetid) //for testing on client side

      var sql = `
      Select * from assets 
      where assetid = ?;
     `;

      var params = [assetid];

      dbConnection.query(sql, params, (err, results, _) => {
        if (err) {
          reject(err);
          return;
        }
        console.log("/download query done");
        resolve(results);
      });
    });
    //console.log(rds_response)// at this point, promise still pending

    //execute the await for rds_response
    var rds_result = await rds_response //await: will not execute until rds_response is fulfilled. Then reads sequentially down 
    if (rds_result.length==0) {
          res.json({
          "message": "no such asset...",
          "user_id": -1,
          "asset_name": "?",
          "bucket_key": "?",
          "data": []
          });
          return  
        }
    console.log("/download: inserting into S3...");
    
    //extract bucketkey from rds and insert object into S3 input
    var bucketkey = rds_result[0]["bucketkey"]
    //console.log(bucketkey)

    const input = { // GetObjectRequest
        Bucket: s3_bucket_name, // required
        Key: bucketkey //required
        };

    // calling S3 to download bucketkey
    console.log("/download: calling S3...");
    const command = new GetObjectCommand(input);
    var s3_response = await s3.send(command);
    //var s3_result = await s3_response
    //console.log(s3_result)
    
    //transform body of string into base64-encoded string 
    var datastr = await s3_response.Body.transformToString("base64");

    // done, respond:
    //
    console.log("/download done, sending response..."); 

    res.json({
      "message": "success",
      "user_id": rds_result[0]["userid"],
      "asset_name": rds_result[0]["assetname"],
      "bucket_key": bucketkey,
      "data": datastr
    });

  }//try
  catch (err) {
    //
    // generally we end up here if we made a 
    // programming error, like undefined variable
    // or function:
    //
    res.status(400).json({
      "message": err.message,
      "user_id": -1,
      "asset_name": "?",
      "bucket_key": "?",
      "data": []
    });
  }//catch

}//get
  

