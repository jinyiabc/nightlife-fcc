const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
    publicRepos: Number
	}
});

const Pub = new Schema({
  pubname: String,
  image_url: String,
  participants: [User]
});

const City = new Schema({
  city: String,
  pubs: [Pub]
});



module.exports = mongoose.model('City', City);
