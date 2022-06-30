const hre = require("hardhat");
const connection = require('../db/connection.js');
const UserSchema = require('../db/core/User.js');
const ReleaseSchema = require('../db/core/Release.js');
const BigNumber = require('bignumber.js');
var Web3 = require('web3');

async function main() {
    // const musicoinContract = await hre.ethers.getContractFactory("Music");
    // const musicoin = await musicoinContract.attach(process.env.MUSICOIN_ADDRESS);
    let startTime = new Date();
    console.log("Start time: ", startTime.toUTCString());

    // Instantiate the MusicoinFactory from the chain or deploy a new one if there isn't one provided
    const musicoinFactoryContract = await hre.ethers.getContractFactory("MusicFactory");

    let musicoinFactory;
    if (process.env.FACTORY_ADDRESS == null || process.env.FACTORY_ADDRESS == '') {
        musicoinFactory = await musicoinFactoryContract.deploy(process.env.MUSICOIN_ADDRESS);
        console.log("MusicoinFactory deployed to: ", musicoinFactory.address);
    }
    else {
        musicoinFactory = await musicoinFactoryContract.attach(process.env.FACTORY_ADDRESS);
        console.log("MusicoinFactory loaded from: ", process.env.FACTORY_ADDRESS);
    }

    //const artistContract = await hre.ethers.getContractFactory("Artist");
    //const pppContract = await hre.ethers.getContractFactory("PayPerPlay");

    //DB Models
    const dbUser = connection.model('User', UserSchema); // Artist
    const dbRelease = connection.model('Release', ReleaseSchema); // PPP
    //Get artists from DB which are not deployed yet.  This can be limited for smaller deployment cycles and rerunning will continue to the next batch of undeployed artists.  Set to 1 for dev/test cycles    
    const artists = await dbUser.find({ profileAddress: { $exists: true, $ne: null } })
        // 2022-06-20 filter by mostRecentReleaseDate to only pickup artists that have songs for migration.  This line removed because all users are Artist accounts and need migration
        //.where({ mostRecentReleaseDate: { $exists: true, $ne: null }, migrated: { $ne: true }, ownerAddress: { $exists: true } })
        .where({migrated: { $ne: true }, ownerAddress: { $exists: true } })
    // .limit(1)
        .exec();

    let deployedArtists;
    let artistIndex = 0;
    for (let ele of artists) {
        artistIndex++;
        console.log("** ", artistIndex, "/", artists.length, " -------------------------------------------------------------**");
        let newArtistAddress;
        let oldArtistAddress;
        if ((ele.profileAddress_2018Chain == null) || (ele.profileAddress_2018Chain == "")) {
            // function createArtist(address _owner, string memory _artistName, string memory _imageUrl, string memory _descriptionUrl, string memory _socialUrl) public {
            deployedArtist = await musicoinFactory.createArtist(
                ele.ownerAddress, // process.env.ARTIST_ADDRESS,  // **** UDPATE WITH THE REAL OWNER ADDRESS
                ele.draftProfile.artistName || "",
                ele.draftProfile.ipfsImageUrl || "",
                ele.twitter.url || "https://twitter.com",
                ele.facebook.url || "https://fb.com"
            );

            // Pickup the new Artist contract address using the event listener
            const rc = await deployedArtist.wait();
            const event = rc.events.find(event => event.event === 'newArtistCreated');
            newArtistAddress = event.args[1]; // [info, newArtist, creator]
            oldArtistAddress = ele.profileAddress;

            ele.profileAddress_2018Chain = oldArtistAddress;
            ele.profileAddress = newArtistAddress;
            await ele.save();
        }
        else {
            console.log("Continuing aborted migration...")
            newArtistAddress = ele.profileAddress;
            oldArtistAddress = ele.profileAddress_2018Chain;
        }
        console.log("Artist migrating: ID: ", ele._id, " Name: ", ele.draftProfile.artistName, " From: ", oldArtistAddress, " To: ", newArtistAddress);

        /*************/
        // Migrate all the PPP contracts for the artist that was just migrated.  There will be 0 to n PPP contracts to migrate for each artist

        let releases = await dbRelease.find({ artistAddress: oldArtistAddress }).where({ migrated: { $ne: true }, state: { $ne: "error" } }).exec();
        let deployRel;

        for (let eleRelease of releases) {
            // function createPayPerPlay(address payable _owner, string memory _title, string memory _artistName, address _artistProfileAddress, uint _musicPerPlay, string memory _resourceUrl, bytes32 _contentType, string memory _imageUrl, string memory _metadataUrl, address[] memory _contributors, uint[] memory _contributorShares) public {
            deployedPPP = await musicoinFactory.createPayPerPlay(
                ele.ownerAddress, // process.env.ARTIST_ADDRESS, // **** UPDATE WITH THE REAL OWNER ADDRESS
                eleRelease.title || "",
                eleRelease.artistName || "",
                newArtistAddress, // Because these have not been updated in the "releases" table during migration, the address needs to be pulled from the "users" table following the artist ObjectId lookup on the users table
                Web3.utils.toWei('1', 'ether'), // 1 musicoin is 10^18
                eleRelease.resourceUrl || "",
                ethers.utils.formatBytes32String(eleRelease.contentType || "audio/mp3"),
                eleRelease.imageUrl || "",
                eleRelease.resourceUrl || "",
                eleRelease.contributors, // [process.env.PPP_CONTRIBUTOR_ADDRESS_1, process.env.PPP_CONTRIBUTOR_ADDRESS_2, process.env.PPP_CONTRIBUTOR_ADDRESS_3], // *** THIS IS NEEDED FOR UPDATING MIGRATION SCRIPTS
                eleRelease.contributorShares  // [3, 2, 5] // *** THIS IS NEEDED FOR UPDATING MIGRATION SCRIPTS
            )

            const oldContractAddress = eleRelease.contractAddress;
            // Pickup the new Artist contract address using the event listener
            const rc = await deployedPPP.wait();
            const event = rc.events.find(event => event.event === 'newPayPerPlayCreated');
            const newContractAddress = event.args[1];

            // **** This should be updating artistAddress to the new contract address.  migrated is not an original table field which the app uses
            eleRelease.contractAddress = newContractAddress;
            eleRelease.contractAddress_2018Chain = oldContractAddress;
            eleRelease.artistAddress = newArtistAddress;
            eleRelease.migrated = true;
            await eleRelease.save();
            console.log("PPP for the Artist has been deployed: ID: ", eleRelease._id, " Title: ", eleRelease.title, " From: ", oldContractAddress, " To: ", newContractAddress);
        }
        // If it crashes before full migration, the flag will not be saved for the Artist/User.  Some PPP may have been updated to a new contract ID and others need to be done without making a new Artist contract
        ele.migrated = true;
        await ele.save();
    }

    console.log("All Artists have been deployed!!!")
    let endTime = new Date();
    console.log("End time: ", endTime.toUTCString(), " Elapsed minutes: ", (endTime.getTime() - startTime.getTime()) / (1000 * 60), " Records processed: ", artists.length);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        let abortTime = new Date();
        console.log("Aborted timestamp: ", abortTime.toUTCString());
        console.error(error);
        process.exit(1);
    });
