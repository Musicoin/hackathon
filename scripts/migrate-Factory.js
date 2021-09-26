const hre = require("hardhat");
const connection = require('../db/connection.js');
const UserSchema = require('../db/core/User.js');
const ReleaseSchema = require('../db/core/Release.js');
const BigNumber = require('bignumber.js');
var Web3 = require('web3');

async function main() {
    // const musicoinContract = await hre.ethers.getContractFactory("Music");
    // const musicoin = await musicoinContract.attach(process.env.MUSICOIN_ADDRESS);

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
        .where({ mostRecentReleaseDate: { $exists: true, $ne: null }, migrated: { $exists: false } }).limit(10).exec();

    let deployedArtists;

    for (let ele of artists) {
        // function createArtist(address _owner, string memory _artistName, string memory _imageUrl, string memory _descriptionUrl, string memory _socialUrl) public {
        deployedArtist = await musicoinFactory.createArtist(
            process.env.ARTIST_ADDRESS,  // **** UDPATE WITH THE REAL OWNER ADDRESS
            ele.draftProfile.artistName || "",
            ele.draftProfile.ipfsImageUrl || "",
            ele.twitter.url || "https://twitter.com",
            ele.facebook.url || "https://fb.com" //,
        );

        // Pickup the new Artist contract address using the event listener
        const rc = await deployedArtist.wait();
        const event = rc.events.find(event => event.event === 'newArtistCreated');
        const newArtistAddress = event.args[1]; // [info, newArtist, creator]
        const oldArtistAddress = ele.profileAddress;

        console.log("**** TODO: Set the owner values correctly based on the original contracts (Artist & PPP)");
        ele.profileAddress_2018Chain = oldArtistAddress;
        ele.profileAddress = newArtistAddress;
        ele.migrated = true;
        await ele.save();

        console.log("Artist migrated: ID: ", ele._id, " Name: ", ele.draftProfile.artistName, " From: ", oldArtistAddress, " To: ", newArtistAddress);

        /*************/
        // Migrate all the PPP contracts for the artist that was just migrated.  There will be 0 to n PPP contracts to migrate for each artist

        let releases = await dbRelease.find({ artistAddress: oldArtistAddress }).exec();
        let deployRel;
        console.log("**** TODO: Migrating PPP needs: owner, payperplay license");

        for (let eleRelease of releases) {
            // function createPayPerPlay(address payable _owner, string memory _title, string memory _artistName, address _artistProfileAddress, uint _musicPerPlay, string memory _resourceUrl, bytes32 _contentType, string memory _imageUrl, string memory _metadataUrl, address[] memory _contributors, uint[] memory _contributorShares) public {
            deployedPPP = await musicoinFactory.createPayPerPlay(
                process.env.ARTIST_ADDRESS, // **** UPDATE WITH THE REAL OWNER ADDRESS
                eleRelease.title || "",
                eleRelease.artistName || "",
                newArtistAddress, // Because these have not been updated in the "releases" table during migration, the address needs to be pulled from the "users" table following the artist ObjectId lookup on the users table
                Web3.utils.toWei('1', 'ether'), // 1 musicoin is 10^18
                eleRelease.resourceUrl || "",
                ethers.utils.formatBytes32String(eleRelease.contentType || "audio/mp3"),
                eleRelease.imageUrl || "",
                eleRelease.resourceUrl || "",
                [process.env.PPP_CONTRIBUTOR_ADDRESS_1, process.env.PPP_CONTRIBUTOR_ADDRESS_2, process.env.PPP_CONTRIBUTOR_ADDRESS_3],
                [3, 2, 5]
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
