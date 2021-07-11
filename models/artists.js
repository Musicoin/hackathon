let mongoose = require('mongoose')

let artistSchema = new mongoose.Schema({
  artistName : String,
  ethAddress: String,
  contractAddress : String,
  imageUrl : String,
  descriptionUrl: String,
  socialUrl: String
})

module.exports = mongoose.model('Artist', artistSchema)