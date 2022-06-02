const mongoose = require('mongoose');
// create the model for users and expose it to our app
module.exports = mongoose.Schema({
  tx: String,
  state: {
    type: String,
    enum: ['pending', 'published', 'error', 'deleted'],
    default: 'pending',
    index: true
  },
  resourceUrl: String,
  contentType: String,
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  artistName: String,
  artistAddress: String,
  description: String,
  title: String,
  imageUrl: String,
  genres: [String],
  languages: [String],
  moods: [String],
  regions: [String],
  canReceiveFunds: Boolean,
  directPlayCount: Number,
  directTipCount: Number,
  releaseDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  contractAddress: String,
  errorMessage: String,
  markedAsAbuse: Boolean,
  pendingUpdateTxs: Object,
  votes: Object,
  //for migration
  migrated: Boolean,
  contractAddress_2018Chain: String
});
//# sourceMappingURL=release.js.map
