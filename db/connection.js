const mongoose = require('mongoose');
require('dotenv').config();

const connection = mongoose.createConnection(
    process.env.MONGO_URL,
    {
      useNewUrlParser: true,
     // bufferMaxEntries: 0,
      useUnifiedTopology: true,
    },
);

module.exports = connection;
