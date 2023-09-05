//
// app.put('/user', async (req, res) => {...});
//
// Inserts a new user into the database, or if the
// user already exists (based on email) then the
// user's data is updated (name and bucket folder).
// Returns the user's userid in the database.
//
const dbConnection = require('./database.js')

exports.put_user = async (req, res) => {

  console.log("call to /user...");

  try {

    var data = req.body;  // data => JS object
    var email = data.email;
    var lastname = data.lastname
    var firstname = data.firstname
    var bucketfolder = data.bucketfolder

    var rds_response = new Promise((resolve, reject) => {

    console.log("/user: calling RDS...");
      
    var sqlselect = `
        select * from users
        where email = ?;`;

    var params = [email];

    dbConnection.query(sqlselect, params, (err, results, _) => {
        if (err) {
          reject(err);
          return;
        }
        console.log("/user query done");
        resolve(results);
        //console.log(results)
      });
    });//promise
    
    var rds_result = await rds_response

    //if the user doesn't exist, insert into DB
    if (rds_result.length==0) {
      
      console.log("adding new user...")
      
      new_user = [email, lastname, firstname, bucketfolder]
      
      var sqlinsert = `
        insert into users (email, lastname, firstname, bucketfolder)
        values(?, ?, ?, ?);`;

      dbConnection.query(sqlinsert, new_user, (err, results, _) => {
        if (err) {
          throw err;
          //return; / OH: do i need a Promise? 
        }
        //resolve(results);
        console.log("successful insert")
        console.log(results.affectedRows == 1)  
        res.json({
          "message": "inserted",
          "userid": results.insertId,
          });
        });
      //OH: not sending back a response in postman :(
    }

    //if user exists, update DB  
    else {
      
      console.log("updating user..")
      userid = rds_result[0]["userid"]

      //is this ugly to do it twice?
      update_user = [lastname, firstname, bucketfolder, email]
      
      var sqlupdate = `
        update users
        set lastname = ?, firstname = ?, bucketfolder = ?
        where email = ?;`;

      dbConnection.query(sqlupdate, update_user, (err, results, _) => {
        if (err) {
          throw err;
          //return; / OH: do i need a Promise? 
         }
        console.log(results.affectedRows == 1)       
        });
      
      res.json({
        "message": "updated",
        "userid": userid,
        });
    }
    
  
  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "userid": -1
    });
  }//catch

}//put
