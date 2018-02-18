const express = require('express');
const router = express.Router();
const Pub = require('../models/pubs');

const yelp = require('yelp-fusion');

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'dK5Wn9Updm23II7yWpqbfWJkWNMZQLzGV2Aqha-u86VVOqNCiyXiqrMzFopTRV5sEPdSrLUkQBZyg6PzgWQo0t07626nPiHUGGan8ifW87yY8prr4cAx7F9xvnWFWnYx';
const client = yelp.client(apiKey);



// Get a list of clubs around the user.
router.get('/:location/:userId',function(req,res,next){
 // console.log(req.params.location);    // hongkong
  const searchRequest = {
    term:'Four Barrel Coffee',
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

     Pub.findOne({"participants.github.username": req.params.userId}, function(err,user){
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
    term:'Four Barrel Coffee',
    location: req.params.location//'san francisco, ca'
  };
  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
    const prettyJson = JSON.stringify(firstResult, null, 4);

    Pub.find({}).then(function(){
      res.send(prettyJson);
    });

  })
});

// Upload pubs if the city was not registered in DB.
router.post('/:location',function(req,res,next){

  const searchRequest = {
    term:'Four Barrel Coffee',
    location: req.params.location//'san francisco, ca'
  };
  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
    const update = response.jsonBody.businesses.slice(0,10);
    // const city = req.params.location.split(',')[0];
    const newpubs = []
    for(var i=0; i<10; i++){
      newpubs.push({
        pubname: update[i].name,
        city: update[i].location.city,
        image_url: update[i].url
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

    const query = {"city" : update[0].location.city};
// If there is  city in DB, do nothing; if no city, add to DB.
     Pub.findOne(query).then(function(result){
       if(result){
         console.log('The city is registered in DB.');
         res.send('The city is registered in DB.');
        } else {
// If there is no city in DB, insert many to DB.
          Pub.insertMany(newpubs).then(function(){
            Pub.findOne(query).then(function(result){
              res.send(result);
            })
          }).catch(next);
        }
   }) // End of findInsert DB function;


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
