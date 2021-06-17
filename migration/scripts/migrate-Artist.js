const hre = require("hardhat");
const connection =  require('../db/connection.js'),
      UserSchema = require('../db/core/User.js');



async function main() {

    
    const Artist = await hre.ethers.getContractFactory("Artist");
       //   

    //DB Models
    const User = connection.model('User', UserSchema);
       //   Release = connection.model('Release', ReleaseSchema);     
    
    //Get artists from DB which are not deployed yet, 10 artist at a time
    //will modify limit according to passed variable    
    const artists = await User.find({ profileAddress: { $exists: true, $ne: null } })
          .where({ mostRecentReleaseDate: { $exists: true, $ne: null }, migrated: { $exists: false } }).limit(100).exec();
   
    let deployedArtists = [];      

    for (let ele of artists )
    {
      deployedArtists.push( await Artist.deploy(ele.profileAddress,
      ele.draftProfile.artistName,
      ele.draftProfile.ipfsImageUrl,
      ele.twitter.url || "https://twitter.com",
      ele.facebook.url || "https://fb.com" ) )
    }

    //Success !! contracts depolyed but not yet mined will do check later
    //will use attach method of factory
    //more at ---> https://docs.ethers.io/v5/api/contract/contract-factory/

    for ( let i =0; i < deployedArtists.length; i++ )
    {
     await User.updateOne({ profileAddress: artists[i].profileAddress }, {
            contractAddress: deployedArtists[i].address,
            migrated: true
          });
    }

    console.log("All Artists have been deployed!!!")

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
