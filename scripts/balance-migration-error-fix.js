const hre = require("hardhat");
const connection = require('../db/connection.js');
const BalanceSchema = require('../db/core/Balance.js');
const BigNumber = require('bignumber.js');
var Web3 = require('web3');
const addressHash = new Map();

async function main() {
    const senderAddress = (await ethers.getSigners())[0];
    let startTime = new Date();
    console.log("Start time: ", startTime.toUTCString());

    const musicoinFactory = await ethers.getContractFactory("Music");
    const musicoinContract = await musicoinFactory.attach(process.env.MUSICOIN_ADDRESS);

    //DB Models
    const dbBalance = connection.model('Balance', BalanceSchema); // Artist

    //Get balances from DB which are not migrated yet but started and failed.
    const balances = await dbBalance.find({ balance: { $exists: true, $ne: null, $ne: 0 } })
        .where({ $and: [{ migrating: true, migrated: { $ne: true }, skipMigration: { $ne: true } }] })
        .exec();

    let i = 0;
    console.log("Fixing count: ", balances.length);
    for (let ele of balances) {
        let startingBalance = await musicoinContract.balanceOf(ele.addr);
        if (startingBalance.isZero()) {
            console.log("No balance:", startingBalance);
            ele.migrating = false;  // Flag that a transfer has started to ensure we can find records which the transfer was done but the flag ele.migrated didnt get set to true due to a failure after transfers
        } else {
            console.log("Has balance:", startingBalance);
            ele.migrated = true;  // Flag that a transfer has started to ensure we can find records which the transfer was done but the flag ele.migrated didnt get set to true due to a failure after transfers
        }
        await ele.save();
    }

    let endTime = new Date();
    console.log("End time: ", endTime.toUTCString(), " Elapsed minutes: ", (endTime.getTime() - startTime.getTime()) / (1000 * 60), " Records processed: ", balances.length);

    // ***** Need a delay here before exiting to capture the final block write callbacks.  Proper delay callback wasn't working, but this hack does
    console.log("Migration status:");
    console.log("Total records:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).exec());
    console.log("Migrated:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).where({ $and: [{ migrated: true, skipMigration: { $ne: true } }] }).exec());
    console.log("Need resolving:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).where({ $and: [{ migrating: true, migrated: { $ne: true }, skipMigration: { $ne: true } }] }).exec());
    console.log("Remaining:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).where({ $and: [{ migrating: { $ne: true }, migrated: { $ne: true }, skipMigration: { $ne: true } }] }).exec());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
