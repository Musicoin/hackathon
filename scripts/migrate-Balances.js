const hre = require("hardhat");
const connection = require('../db/connection.js');
const BalanceSchema = require('../db/core/Balance.js');
const BigNumber = require('bignumber.js');
var Web3 = require('web3');

async function main() {
    let startTime = new Date();
    console.log("Start time: ", startTime.toUTCString());

    const musicoinContract = await hre.ethers.getContractFactory("Music");
    const musicoin = await musicoinContract.attach(process.env.MUSICOIN_ADDRESS);
    const musicoinOwner = process.env.PRIVATE_KEY;

    //DB Models
    const dbBalance = connection.model('Balance', BalanceSchema); // Artist
    const dbUser = connection.model('User', UserSchema); // Artist
    const dbRelease = connection.model('Release', ReleaseSchema); // PPP

    //Get balances from DB which are not migrated yet.  This can be limited for smaller deployment cycles and rerunning will continue to the next batch of balances not migrated.  Set to 1 for dev/test cycles    
    const balances = await dbBalance.find({ balance: { $exists: true, $ne: null, $ne: 0 } })
        .where({ $and: [{ migrating: { $ne: true } }, { migrated: { $ne: true } }, { skipMigration: { $ne: true } }] })
        //        .limit(2)
        .exec(); // Check both flags and only work with records that have not initiated or completed a migration.  Any initiated but incomplete records need to be resolved manually to prevent double spend

    let deployedBalances;

    for (let ele of balances) {
        let migratedArtist = false;
        let migratedPPP = false;

        let startingBalance = await musicoin.balanceOf(ele.addr);
        let weiBalance = Web3.utils.toWei(ele.balance.toString(), 'ether');
        //console.log("Loaded balance Address: ", ele.addr, " | Onchain balance: ", startingBalance.toString(), " | Recovering amount: ", ele.balance, " | In Wei: ", weiBalance);
        ele.migrating = true;  // Flag that a transfer has started to ensure we can find records which the transfer was done but the flag ele.migrated didnt get set to true due to a failure after transfers
        await ele.save();

        let destinationAccount = ele.addr;

        // Check if this address was an Artist or PPP contract address that was already migrated and change to the new address
        let artistContract = await dbUser.find({ profileAddress_2018Chain: ele.addr }).limit(1).exec();
        if (artistContract.length > 0) {
            destinationAccount = artistContract.profileAddress; // The new contract addresss
            migratedArtist = true;
            // console.log("Matching balance address with Artist contract at: ", ele.addr, " Balance: ", ele.balance, " Transferring to: ", destinationAccount);
        } else {
            let pppContract = await dbRelease.find({ contractAddress_2018Chain: ele.addr }).limit(1).exec();
            if (pppContract.length > 0) {
                destinationAccount = pppContract.contractAddress; // The new contract addresss
                migratedPPP = true;
                // console.log("Matching balance address with PPP contract at: ", ele.addr, " Balance: ", ele.balance, " Transferring to: ", destinationAccount);
            }
        }

        deployedBalances = await musicoin.transfer(
            destinationAccount,
            weiBalance
        );

        // Pickup the new Artist contract address using the event listener
        const rc = await deployedBalances.wait();
        const event = rc.events.find(event => event.event === 'Transfer');
        const transferEventFrom = event.args[0]; // [from, to, amount]
        const transferEventTo = event.args[1]; // [from, to, amount]
        const transferEventAmount = event.args[2]; // [from, to, amount]

        console.log("To Address: ", destinationAccount, " | Transfer Amount: ", weiBalance, " | Starting Balance: ", startingBalance.toString(), " | Final Balance: ", (await musicoin.balanceOf(ele.addr)).toString(), " | was Artist contract: ", migratedArtist, " | was PPP contract", migratedPPP, " | Original address:", ele.addr);
        //console.log("Event listener - To Address: ", transferEventTo, " | Transfer Amount: ", transferEventAmount.toString(), " | From Address: ", transferEventFrom);

        ele.migrated = true;
        await ele.save();
    }

    let endTime = new Date();
    console.log("End time: ", endTime.toUTCString(), " Elapsed minutes: ", (endTime.getTime() - startTime.getTime()) / (1000 * 60), " Records processed: ", balances.length);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
