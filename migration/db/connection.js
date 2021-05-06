import mongoose from 'mongoose';

const connection = mongoose.createConnection(
    process.env.MONGO_URL + "/musicoin-org",
    {
      useNewUrlParser: true,
      bufferMaxEntries: 0,
      useUnifiedTopology: true,
    },
);

export default connection;
