const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../models/users');
const Pub = require('../models/pubs');

const githubAuth = {
		clientID: process.env.GITHUB_KEY,
		clientSecret: process.env.GITHUB_SECRET,
		callbackURL: process.env.APP_URL+'auth/github/callback'
	};

	// APP_URL=http://localhost:3000/
console.log(process.env.GITHUB_KEY);
console.log(process.env.GITHUB_SECRET);
console.log(process.env.APP_URL);

passport.use(new GitHubStrategy(githubAuth,
	function (token, refreshToken, profile, done) {
		// console.log(profile);
		process.nextTick(function () {

// If the user is registered in city of pubs, goto next step
// If the user is not registered, register in that city of pubs first.
// Note: User are allowed to login after searching city which step create records in DB alreay.
// Problem: If the user search another city after login, then may failed to register himself. Need to check ***
// Solution: Every time GET /:location/:userId , user need to check if registered or not. *** Resolved***

      Pub.findOne({"participants.github.id": profile.id},function(err,user){
         if(err){ return done(err);}
				 if(user){
					 console.log('The user is registered');
					 const test = profile.id, length = user.participants.length;
					 for( let i = 0; i<length; i++){
						 if(user.participants[i].github.id === test){
							 const newUser = user.participants[i];
							 console.log("registered user is:",JSON.stringify(newUser,null,4));
							 return done(null, newUser);
						 }
					 }

					 // return done(null,user);
				 } else {
           console.log('The user is not registered');
					 const newUser = {"github" : {
					                             "id" : profile.id,
					                             "displayName" : profile.displayName,
					                             "username" : profile.username,
					                             "publicRepos" : profile._json.public_repos
					                         }
					              }

					   const query = {"city" : "San Francisco"}
					                  // "participants.github.username" : "jinyiabc" };   //{"city":city};
					                  // If array.object.object exists, it works fine.
					                  // if array.object.object do not exists, odd err:"array is not objects"
					   const postPubs =
					                    {
					                      $push: {
					                        "participants":{
					                          $each:  [newUser] ,
					                          $sort: { score: -1 }
					                        }
					                      }

					                    }

					         Pub.updateMany(query,postPubs,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.
					           // Pub.findOne(query).then(function(result){
					           //   res.send(result);
					           // })
										 return done(null, newUser);
					         });

				 } // End of if.


			});






		});
		// return done(null, profile);

	}));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.

passport.serializeUser(function (user, done) {
	// console.log(user);
	done(null, user.github);
});

passport.deserializeUser(function (id, done) {
	// User.findById(id, function (err, user) {
		done(null, id);
	// });
});

// The fetched object is attached to the request object as req.user ater desrialization.

module.exports  = passport;
