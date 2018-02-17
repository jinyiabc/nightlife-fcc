const express = require('express');
const router = express.Router();
const City = require('../models/cities');

const yelp = require('yelp-fusion');

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const apiKey = 'dK5Wn9Updm23II7yWpqbfWJkWNMZQLzGV2Aqha-u86VVOqNCiyXiqrMzFopTRV5sEPdSrLUkQBZyg6PzgWQo0t07626nPiHUGGan8ifW87yY8prr4cAx7F9xvnWFWnYx';
const client = yelp.client(apiKey);



// Get a list of clubs around the user.
router.get('/:location/:userId',function(req,res,next){

  const searchRequest = {
    term:'Four Barrel Coffee',
    location: req.params.location//'san francisco, ca'
  };
  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
    const prettyJson = JSON.stringify(firstResult, null, 4);

    const query = {'participants.github.username':req.params.userId};
    City.find({}).then(function(){
      res.send(prettyJson);
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

    City.find({}).then(function(){
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
    const city = req.params.location.split(',')[0];
    const newpubs = []
    for(var i=0; i<10; i++){
      newpubs.push({
        pubname: update[i].name,
        image_url: update[i].url,
        participants: [{
          github:{
            id: '1234',
            displayName: 'ABC',
            username:'ABC',
            publicRepos: 18
          }
        }]
      })

    }


    // github: {
    //   id: String,
    //   displayName: String,
    //   username: String,
    //   publicRepos: Number
    // }
    // res.send(newpubs);

    const query = {"city":city};
    const postPubs =
                     {$push:
                       {pubs:
                         {$each:
                           newpubs}
                         }
                       };
// If there is  city in DB, do nothing; if no city, add to DB.
     City.findOne(query).then(function(result){
       if(result){
         console.log('The city is registered in DB.');
         res.send('The city is registered in DB.');
        } else {

          City.updateOne(query,postPubs,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.
            City.findOne(query).then(function(result){
              res.send(result);
            })
          }).catch(next);

        }

   })


  })
});


// Update participants for Authorized user.

router.put('/:location/:userId',function(req,res,next){

//   const searchRequest = {
//     term:'Four Barrel Coffee',
//     location: req.params.location//'san francisco, ca'
//   };
//   client.search(searchRequest).then(response => {
//     const firstResult = response.jsonBody.businesses[0];
//     const update = response.jsonBody.businesses.slice(0,10);
//     const city = req.params.location.split(',')[0];
//     const newpubs = []
//     for(var i=0; i<10; i++){
//       newpubs.push({
//         pubname: update[i].name,
//         image_url: update[i].url,
//         city: update[i].location.city
//       })
//     }
// // New data structure for City schema created.
//   })
// $set:{'polls.$.options':req.body.options},

const city = req.params.location.split(',')[0];
const query = {"city":city};
const postPubs =
                 { $set:{'pubs.$.participants.$.github.username': req.params.userId}};
                 // {$push:
                 //   {pubs:
                 //     {$each:
                 //       newpubs}
                 //     }
                 //   };
// If there is  city in DB, do nothing; if no city, add to DB.
 // City.findOne(query).then(function(result){
 //   if(result){
 //     console.log('The city is registered in DB.');
 //     res.send('The city is registered in DB.');
 //    } else {

      City.updateOne(query,postPubs,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.
        City.findOne(query).then(function(result){
          res.send(result);
        })
      }).catch(next);

    // }

// })  // Client Search

});



module.exports = router;
