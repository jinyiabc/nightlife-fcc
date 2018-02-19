const express = require('express');
const router = express.Router();
const Pub = require('../models/pubs');
const async = require('async');
const yelp = require('yelp-fusion');
// import concat from 'async/concat';
// const concat = require('async/concat')

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'dK5Wn9Updm23II7yWpqbfWJkWNMZQLzGV2Aqha-u86VVOqNCiyXiqrMzFopTRV5sEPdSrLUkQBZyg6PzgWQo0t07626nPiHUGGan8ifW87yY8prr4cAx7F9xvnWFWnYx';
const client = yelp.client(apiKey);



// Get a list of clubs around the user.
router.get('/:location/:userId',function(req,res,next){
 // console.log(req.params.location);    // hongkong
  const searchRequest = {
    term:'bar',
    location: req.params.location//'san francisco, ca'
  };
  client.search(searchRequest).then(response => {
    // const firstResult = response.jsonBody.businesses[0];
    // const prettyJson = JSON.stringify(firstResult, null, 4);
    //
    // const query = {'participants.github.username':req.params.userId};
    // Pub.find({}).then(function(){
    //   res.send(prettyJson);
    // });

    const city = response.jsonBody.businesses[0].location.city;  // "San Francisco"
    console.log(city);
    console.log(JSON.stringify(req.user,null,4));


  const body = {"github" : {
                              "id" : req.user.id,
                              "displayName" : req.user.displayName,
                              "username" : req.user.username,
                              "publicRepos" : req.user.publicRepos
                          }
               }

    const query = {"city" : city}
                   // "participants.github.username" : "jinyiabc" };   //{"city":city};
                   // If array.object.object exists, it works fine.
                   // if array.object.object do not exists, odd err:"array is not objects"
    const postPubs =
                     {
                       $push: {
                         "participants":{
                           $each:  [body] ,
                           $sort: { score: -1 }
                         }
                       }

                     }

     Pub.findOne({"city": req.params.location}, function(err,user){
       if(err){return err;}
       if(user){
         console.log('The user is registered');
         console.log(JSON.stringify(user,null,4));
         res.send(user);
       } else {  // Insertmany if the user is not registered
         console.log('The user is not registered');
         Pub.updateMany(query,postPubs,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.
           Pub.findOne(query).then(function(result){
             res.send(result);
           })
         });

       } // end of if.

     });

  })
});

// Get a list of clubs around the location without authorization.
router.get('/:location',function(req,res,next){
// console.log(req.params.location.split(',')[0]);    // city
// console.log(req.params.location.split(',')[1]);    // state

  const searchRequest = {
    term:'bar',
    location: req.params.location//'san francisco, ca'
  };
  client.search(searchRequest).then(response => {
    const ten = response.jsonBody.businesses.slice(10);
    const prettyJson = JSON.stringify(ten, null, 4);
    res.send(prettyJson);


  })
});

// Upload pubs if the city was not registered in DB.
router.post('/:location',function(req,res,next){

  const searchRequest = {
    term:'bar',
    location: req.params.location//'san francisco, ca'
  };
  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
    const update = response.jsonBody.businesses.slice(10);
    // const city = req.params.location.split(',')[0];
    const newpubs = []
    for(var i=0; i<10; i++){
      newpubs.push({
        pubname: update[i].name,
        city: update[i].location.city,
        image_url: update[i].image_url,
        url:update[i].url
        // participants: [{
        //   github:{
        //     id: '1234',
        //     displayName: 'ABC',
        //     username:'ABC',
        //     publicRepos: 18
        //   }
        // }]
      })

    }


// const newarr= []
// const itemprocess = 0
// newpubs.forEach(function(pub){
//         // console.log(JSON.stringify(pub,null,4));
//         // { pubname: 'Andaz Tokyo Rooftop Bar',
//         //   city: 'Minato',
//         //   image_url: 'https://s3-media4.fl.yelpcdn.com/bphoto/8e7GTpz6Nmmn-3zNlf5V-A/o.jpg',
//         //   url: 'https://www.yelp.com/biz/andaz-tokyo-rooftop-bar-%E6%B8%AF%E5%8C%BA?adjust_creative=9RlztibObCgwU0ZsfIZUFg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=9RlztibObCgwU0ZsfIZUFg' }
// const query = {"pubname":pub.pubname};
// Pub.findOne(query).then(function(result){
//   itemprocess++;
//   if(result){
//     console.log(pub.pubname,'has already registered');
//   } else{
//       console.log(pub.pubname,'is registering');
//       newarr.push(pub);
//       console.log(newarr);
//       if(itemprocess === 10) {
//         Pub.insertMany(newarr).then(function(){
//           res.send(newpubs).catch(next);
//         });
//       }
//   }
//
// });
// });

// async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
//     db.findById(userId, function(err, user) {
//         if (err) return callback(err);
//         return callback(null, user.age);
//     });
// }, function(err, result) {
//     // result is object containing the userIds grouped by age
//     // e.g. { 30: ['userId1', 'userId3'], 42: ['userId2']};
// });

async.groupBy(newpubs, function(pub,cb){
  Pub.findOne({"pubname":pub.pubname}, function(err,pub){
    if(err) return cb(err);
    return cb(null,pub)
  });
}, function(err,result){
      // console.log(JSON.stringify(result,null,4));
      if( typeof result.null == "undefined"){
        console.log('All pubs has been registered');
        res.send(newpubs)
      } else {
        console.log('Registering new pubs...');
      Pub.insertMany(result.null).then(function(){
          res.send(newpubs);
      }).catch(next);
      }

});




    // const query = {"pubname" : update[0].location.city};
// If there is  city in DB, do nothing; if no city, add to DB.
     // Pub.findOne(query).then(function(result){
       // if(result){
       //   console.log('The city is registered in DB.');
       //   res.send('The city is registered in DB.');
       //  } else {
// If there is no city in DB, insert many to DB.
          // Pub.insertMany(newarr).then(function(){
          // // //   // Pub.findOne(query).then(function(result){
          //     res.send(newpubs);
          // // //   // })
          // }).catch(next);
        // } // End if.
   // }) // End of findInsert DB function;


 }) //End of yelp api.
});


// Update participants for Authorized user.

router.put('/:location/:userId',function(req,res,next){


const city = req.params.location.split(',')[0];
console.log(city);
const query = {"city" : "San Francisco",
               "participants.github.username" : "ABC" };   //{"city":city};
const postPubs =
                 { $set:{'participants.$.github.username': req.params.userId}};
// If there is  city in DB, do nothing; if no city, add to DB.
 // City.findOne(query).then(function(result){
 //   if(result){
 //     console.log('The city is registered in DB.');
 //     res.send('The city is registered in DB.');
 //    } else {

      Pub.updateMany(query,postPubs,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.
        Pub.findOne(query).then(function(result){
          res.send(result);
        })
      }).catch(next);

    // }

// })  // Client Search

});



module.exports = router;
