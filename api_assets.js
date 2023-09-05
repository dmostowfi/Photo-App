//
// app.get('/assets', async (req, res) => {...});
//
// Return all the assets from the database:
//
const dbConnection = require('./database.js')

exports.get_assets = async (req, res) => {

  console.log("call to /assets...");

  try {

    //
    // TODO: remember we did an example similar to this in class with
    // movielens database (lecture 05 on Thursday 04-13)
    //
    // MySQL in JS:
    //   https://expressjs.com/en/guide/database-integration.html#mysql
    //   https://github.com/mysqljs/mysql
    //

    //
    // calling RDS to get assets 
    //

    var rds_response = new Promise((resolve, reject) => {

      console.log("/assets: calling RDS...");

      var sql = 
        `select * from assets
        order by assetid;`;

      dbConnection.query(sql, (err, results, _) => {
        if (err) {
          reject(err);
          return;
        }

        console.log("/assets query done");
        resolve(results);
      });
    });

    //
    // asynchronously wait for the promises to resolve / reject:
    //
    rds_response.then(result => {

      console.log("/assets done, sending response...");

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
    

  }//try
  catch (err) {
    res.status(400).json({
      "message": err.message,
      "data": []
    });
  }//catch

}//get


