//
// app.get('/bucket?startafter=bucketkey', async (req, res) => {...});
//
// Retrieves the contents of the S3 bucket and returns the 
// information about each asset to the client. Note that it
// returns 12 at a time, use startafter query parameter to pass
// the last bucketkey and get the next set of 12, and so on.
//
const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { s3, s3_bucket_name, s3_region_name } = require('./aws.js');

exports.get_bucket = async (req, res) => {

  console.log("call to /bucket...");

  try {
    //
    // TODO: remember, 12 at a time...  Do not try to cache them here, instead 
    // request them 12 at a time from S3
    //
    // AWS:
    //   https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/classes/listobjectsv2command.html
    //   https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/
    //
    
    bucketkey = ""
    
    if (req.query.startafter) { //if you have a query parameter called startafter
      bucketkey = req.query.startafter; //set bucketkey = to that 
    }
    //console.log(bucketkey)

    //this is s3 formatting - similar how you pass a bunch of params into a function
    const input = { // ListObjectsV2Request
      Bucket: s3_bucket_name, // required
      MaxKeys: 12,
      StartAfter: bucketkey, 
    };

    //
    // calling S3 returning a PROMISE we have to wait on eventually:
    //
    console.log("/bucket: calling S3...");

    //when you see new, we're defining a new object  
      const command = new ListObjectsV2Command(input);
      const s3_response = s3.send(command);
  
   
    // asynchronously wait for the promises to resolve / reject:
    //
     // you don't need promise.all if its just one promise
    //instead just do the promise (s3_response) .then()
    //result or results is answer of promise - what the value of s3_response would've been if we actually returned it 
    
    s3_response.then(result => {
    //
    // done, respond with bucket:
    //
    console.log("/bucket done, sending response...");

    keycount = result["KeyCount"]
    //error handling if no keys returned
    if (keycount == 0) {
      res.json({
      "message": "success",
      "data": [],
      });
      }
    else {
      res.json({
      "message": "success",
      "data": result["Contents"],
      });  
      };//end of ifelse
    
    

  }).catch(err => {
    //
    // we get here if calls to S3 failed, or we
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
      "data": [],
    });
  }//catch

}//get
