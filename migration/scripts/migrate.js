import connection from '../db/connection.js';
import UserSchema from '../db/core/User.js';

async function Migrate() {
  const User = connection.model('User', UserSchema);

  const artists = await User.find({ profileAddress: { $exists: true, $ne: null } })
      .where({ mostRecentReleaseDate: { $exists: true, $ne: null }, migrated: {$exists: false} }).limit(10).exec();

  for (let index = 0; index < artists.length; index++) {
    //ToDo: Deploy Artist contract for each artist and update it to the db

    //ToDo: Get all releases from the Artist, loop through them and deploy them with the PPP contract
    //ToDo: update contract address in the database

    //ToDo: set migrated to true for the artist, perhaps we need this check on releases too? that way we can keep some progress if something goes wrong along the way
    console.log(artists[index]);
  }
}

Migrate();
