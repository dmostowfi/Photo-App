//
// app.get('/users', async (req, res) => {...});
//
// Return all the users from the database:
//
const dbConnection = require('./database.js')


exports.get_users = async (req, res) => {

  console.log("call to /users...");

  try {
    //
    // TODO: remember we did an example similar to this in class with
    // movielens database (lecture 05 on Thursday 04-13)
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    //
    // calling RDS to get users 
    //

    var rds_response = new Promise((resolve, reject) => {

      console.log("/users: calling RDS...");

      var sql = 
        `select * from users
        order by userid;`;

      dbConnection.query(sql, (err, results, _) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("/users query done");
        resolve(results);
      });
    });

    //
    // asynchronously wait for the promise to resolve / reject:
    //
    rds_response.then(result => {

      console.log("/users done, sending response...");

      res.json({
        "message": "success",
        "data": result
      });

    }).catch(err => { 
      //
      // we get here if calls to S3 or RDS failed, or we
      // failed to process the results properly:
      //
      res.status(400).json({
        "message": err.message,
        "data": [],
      });
    });
    

  }//try ends
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get
