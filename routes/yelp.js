const express = require('express');
// const router = express.Router();
const Pub = require('../models/pubs');
const async = require('async');
const yelp = require('yelp-fusion');
var path = process.cwd();

// import concat from 'async/concat';
// const concat = require('async/concat')

// Place holder for Yelp Fusion's API Key. Grab them
// from https://www.yelp.com/developers/v3/manage_app

module.exports = function(app, passport){

  function homeAuthenticate(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/auth/github')
  }

  app.get('/' ,function(req, res) {
    res.sendFile(path + '/public/index.html');
  });

  app.use('/home', function(req,res,next){
    res.render('home',{user: req.user})
  });
  app.use('/login',function(req,res,next){
    res.render('login')
  });
  app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
      res.render('profile', { user: req.user });
  });





const apiKey = 'dK5Wn9Updm23II7yWpqbfWJkWNMZQLzGV2Aqha-u86VVOqNCiyXiqrMzFopTRV5sEPdSrLUkQBZyg6PzgWQo0t07626nPiHUGGan8ifW87yY8prr4cAx7F9xvnWFWnYx';
const client = yelp.client(apiKey);



// Get a list of clubs around the user.
app.route('/yelp/:location/:userId')
   .get(function(req,res,next){
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
         console.log('The user is registered..');
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
app.route('/yelp/:location')
   .get(function(req,res,next){
// console.log(req.params.location.split(',')[0]);    // city
// console.log(req.params.location.split(',')[1]);    // state

  const searchRequest = {
    term:'bar',
    location: req.params.location//'san francisco, ca'
  };
client.search(searchRequest).then(response => {
const update = response.jsonBody.businesses.slice(10);
const newpubs = []
for(var i=0; i<10; i++){
    newpubs.push({
    pubname: update[i].name,
    city: update[i].location.city,
    image_url: update[i].image_url,
    url:update[i].url,
    quantity: 0
})
}  // end of for loop.
// async.groupBy(newpubs, function(pub,cb){
//   Pub.findOne({"pubname":pub.pubname}, function(err,pub){
//     if(err) return cb(err);
//     return cb(null,pub)
//   });
// }, function(err,result){
//       // console.log(JSON.stringify(result,null,4));
//       res.send(result);
//
// });

async.map(newpubs,function(pub,callback){
  Pub.findOne({"pubname":pub.pubname},function(err,pubInDB){
  if(err) return console.err(err);
  callback(null,pubInDB);
});
},function(err,results){
  console.log(JSON.stringify(results,null,4));
  res.send(results);
});






}) // end of yelp.
});

// Upload pubs if the city was not registered in DB.
app.route('/yelp/:location').post(function(req,res,next){

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
        url:update[i].url,
        quantity: 0
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


        // { pubname: 'Andaz Tokyo Rooftop Bar',
        //   city: 'Minato',
        //   image_url: 'https://s3-media4.fl.yelpcdn.com/bphoto/8e7GTpz6Nmmn-3zNlf5V-A/o.jpg',
        //   url: 'https://www.yelp.com/biz/andaz-tokyo-rooftop-bar-%E6%B8%AF%E5%8C%BA?adjust_creative=9RlztibObCgwU0ZsfIZUFg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=9RlztibObCgwU0ZsfIZUFg' }

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
      console.log(JSON.stringify(result,null,4));
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


 }) //End of yelp api.
});


// Update participants for Authorized user.

app.route('/yelp/:location/:userId').put(function(req,res,next){


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


// update registered user participation.
app.route('/yelp/:location').put(homeAuthenticate,function(req,res,next){
const pubname = req.body.pubname;
const participants = req.body.participants;
const username = req.user.username;
let newValue;
let newQty = 0;
console.log('pubname',pubname);   //Corner Stop Bar
console.log('sessioned user:',username);
/*sessioned user: { id: '33644601',
  displayName: 'Alex J.Y.',
  username: 'jinyiabc',
  publicRepos: 22 }*/

for(let i=0; i <participants.length;i++){
  newQty = newQty + participants[i].isJoin;
}
console.log('old quantity:',newQty);
for(let i=0; i <participants.length;i++){
  if (participants[i].github.username == username){
    const isJoin = participants[i].isJoin;
    console.log('old value:',isJoin);
    if(isJoin == 0) {
      newValue = 1 ;
      newQty = newQty +1;
    } else {
      newValue = 0;
      newQty = newQty -1;
    }
  }
}

console.log('new value:',newValue);
console.log('new quantity:',newQty);


const query = {"pubname":pubname,"participants.github.username":username};
const update = {$set:{'participants.$.isJoin': newValue,'quantity':newQty}
                // $set:{'quantity':newQty}
              }


Pub.updateOne(query,update,{upsert:true}).then(function(){
  Pub.findOne(query).then(function(pub){
    console.log(JSON.stringify(pub,null,4));
    res.send(pub)
  }).catch(next);
});

});


app.route('/auth/github')
  .get(passport.authenticate('github'));

app.route('/auth/github/callback')
  .get(passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));



};

// module.exports = router;
