const hre = require("hardhat");
const BigNumber = require('bignumber.js');
var Web3 = require('web3');
const connection = require('../db/connection.js');
const gmcArtistSchema = require('../db/core/GMCArtist.js');
const gmcPPPSchema = require('../db/core/GMCPPP.js');
const UserSchema = require('../db/core/User.js');
const ReleaseSchema = require('../db/core/Release.js');
const recordsToProcess = 100;

async function main() {
    
    let startTime = new Date();
    console.log("Start time: ", startTime.toUTCString());
    // GMC Contracts
    const artistContract = await hre.ethers.getContractFactory("Artist");
    const pppContract = await hre.ethers.getContractFactory("PayPerPlay");

    // DB Models
    const dbUser = connection.model('User', UserSchema); // Artist
    const dbRelease = connection.model('Release', ReleaseSchema); // PPP
    let artistIndex = 0;
    // Get artists from DB which have not been loaded from the GMC chain yet.  This can be limited for smaller deployment cycles and rerunning will continue to the next batch of undeployed artists.  Set limit to 1 for dev/test cycles    
    const artists = await dbUser.find({ profileAddress: { $exists: true, $ne: null } })
        .where({ mostRecentReleaseDate: { $exists: true, $ne: null }, ownerAddress: { $exists: false } })
        // .limit(recordsToProcess)
        .exec();

    for (let ele of artists) {
        artistIndex++;
        console.log("** ", artistIndex, "/", artists.length, " -------------------------------------------------------------**");
        console.log("Artist: ", ele.profileAddress);

        // Get PPP from DB which have not been loaded from the GMC chain yet.  This can be limited for smaller deployment cycles and rerunning will continue to the next batch of undeployed artists.  Set limit to 1 for dev/test cycles    
        let releases = await dbRelease.find({ artistAddress: ele.profileAddress })
            .where({ contributors: { $exists: false }, contractAddress: { $ne: null }, state: { $ne: "error" } }).exec();
        if (releases.length > 0) {
            for (let eleRelease of releases) {
                //console.log("Lookup ppp: ", eleRelease.contractAddress);
                let pppObject = await pppContract.attach(eleRelease.contractAddress);
                // console.log("Name matching: DB: ", eleRelease.artistName, "Chain: ", await pppObject.artistName());
                // console.log("Total shares", (await pppObject.totalShares()).toString());
                try {
                    let contributorsArray = [];
                    let contributorSharesArray = [];
                    let shareCount = 0;
                    for (let i = 0; shareCount < await pppObject.totalShares(); i++) {
                        //console.log("Contributors: ", (await pppObject.contributors(i)).toString());
                        contributorsArray.push(await pppObject.contributors(i));
                        //console.log("ContributorShares: ", (await pppObject.contributorShares(i)).toString());
                        contributorSharesArray.push(await pppObject.contributorShares(i));
                        shareCount = shareCount + parseInt(await pppObject.contributorShares(i));
                    }


                    console.log("PPP: ", eleRelease.contractAddress, "Total Shares: ", (await pppObject.totalShares()).toString(), "| Contributors: ", contributorsArray.toString(), "| Shares: ", contributorSharesArray.toString());
                    eleRelease.contributors = contributorsArray;
                    eleRelease.contributorShares = contributorSharesArray;
                    await eleRelease.save();
                } catch (err) {
                    console.log("Failed to access PPP contract at: ", eleRelease.contractAddress);
                }
            }

            try {
                // Update this after PPP so if a process quits before completing, the Artist object won't yet be updated and will get picked up in a rerun
                let artistObject = await artistContract.attach(ele.profileAddress);
                // console.log("Name matching: DB: ", ele.draftProfile.artistName, "Chain: ", await artistObject.artistName());
                ele.ownerAddress = await artistObject.owner();
                await ele.save();
            } catch (err) {
                console.log("Failed to access Artist contract at: ", ele.profileAddress);
            }
        }
    }

    let endTime = new Date();
    console.log("End time: ", endTime.toUTCString(), " Elapsed minutes: ", (endTime.getTime() - startTime.getTime()) / (1000 * 60), " Records processed: ", artists.length);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
