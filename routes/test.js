// Upload pubs if the city was not registered in DB.
app.route('/yelp/:location/loggedIn').post(function(req,res,next){

  req.session.location = req.params.location;
  console.log('Session location Add from POST :',req.session.location);

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
        participants: [{
          github:{
            id: req.user.github.id,
            displayName: req.user.github.displayName,
            username:req.user.github.username,
            publicRepos: req.user.github.publicRepos
          },
          isJoin: 0
        }]
      })

    }

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
