const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
    publicRepos: Number
	},
  isJoin: Number      // 0 is false, 1 is ture
});


const Pub = new Schema({
  pubname: String,
  image_url: String,
	url: String,
  city: String,
	quantity: Number,
  participants: [User]
});


module.exports = mongoose.model('Pub', Pub);
