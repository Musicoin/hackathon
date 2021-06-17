const hre = require("hardhat"),
      connection =  require('../db/connection.js'),
      UserSchema = require('../db/core/User.js'),
      ReleaseSchema =  require('../db/core/Release.js');

async function main() {  
   const PayPerPlay = await hre.ethers.getContractFactory("PayPerPlay"),
         Release = connection.model('Release', ReleaseSchema),
         User = connection.model('User', UserSchema) ;
  
  let aMigratedArtistAddress = await User.find({ profileAddress: { $exists: true, $ne: null } }, "profileAddress" )
         .where({ mostRecentReleaseDate: { $exists: true, $ne: null }, migrated: true }).limit(100).exec();
  
      aMigratedArtistAddress = aMigratedArtistAddress.map(ele => ele.profileAddress );    
         
  const releases = await Release.find({ artistAddress: { $in : aMigratedArtistAddress  }, migrated : {  $exists : false } }).limit(100).exec();

  let  deployRel;

  for (let ele of releases )
  {
  
        deployRel =  await PayPerPlay.deploy(
        ele.artistAddress,
        ele.title || "",
        ele.artistName || "",
        ele.artistAddress ,
        1000000,
        ele.resourceUrl || "",
        ethers.utils.formatBytes32String( ele.contentType || "audio/mp3" ) ,
        ele.imageUrl || "",
        ele.resourceUrl || "",
        [],
        []
    ) 
    
    ele.contractAddress = deployRel.address;
    ele.migrated = true;
    

   await ele.save();
          
  }

console.log(`Releases of Artist with following address has been deployed.
${aMigratedArtistAddress.join("\n")}
`);

}    

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
