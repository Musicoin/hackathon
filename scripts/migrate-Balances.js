const hre = require("hardhat");
const connection = require('../db/connection.js');
const BalanceSchema = require('../db/core/Balance.js');
const UserSchema = require('../db/core/User.js');
const ReleaseSchema = require('../db/core/Release.js');
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
    const dbUser = connection.model('User', UserSchema); // Artist
    const dbRelease = connection.model('Release', ReleaseSchema); // PPP

    transferEventHandler(musicoinContract, dbBalance);

    // Flag the accounts which should not be receiving migrated balances
    const skipBalances = await dbBalance.find({ addr: { $in: ["0xc168062c9c958e01914c7e3885537541dbb9ed08", "0xafadc4302f07e9460eb4c31ec741c0f3e308ff3a", "0xea62a60b127efd524b6e19791bcb374a49302c71", "0x0000000000000000000000000000000000000000"] } }).exec();
    for (recordToSkip of skipBalances) {
        recordToSkip.skipMigration = true;
        await recordToSkip.save();
    }

    //Get balances from DB which are not migrated yet.  This can be limited for smaller deployment cycles and rerunning will continue to the next batch of balances not migrated.  Set to 1 for dev/test cycles    
    const balances = await dbBalance.find({ balance: { $exists: true, $ne: null, $ne: "0.000000000000000000 " } })
        .where({ $and: [{ migrating: { $ne: true }, migrated: { $ne: true }, skipMigration: { $ne: true } }] })
        //.limit(3)
        .exec(); // Check both flags and only work with records that have not initiated or completed a migration.  Any initiated but incomplete records need to be resolved manually to prevent double spend

    let deployedBalances;
    let i = 0;
    let myNonce = 0;

    for (let ele of balances) {
        let migratedArtist = false;
        let migratedPPP = false;
        // let startingBalance = await musicoinContract.balanceOf(ele.addr);  // removed for performance

        let weiBalance = Web3.utils.toWei(ele.balance.toFixed(18), 'ether'); // Use toFixed(18) to avoid scientific notation for decimals < 0.000000xxxxx
        ele.migrating = true;  // Flag that a transfer has started to ensure we can find records which the transfer was done but the flag ele.migrated didnt get set to true due to a failure after transfers
        ele.migrated = false;
        await ele.save();

        if (weiBalance === "0") { // no need to transfer zero value
            console.log("Skipping:", ele.addr, " Balance:", weiBalance);
        }
        else {
            let destinationAccount = ele.addr;

            // Check if this address was an Artist or PPP contract address that was already migrated and change to the new address
            let artistContract = await dbUser.find({ profileAddress_2018Chain: ele.addr }).limit(1).exec();

            if (artistContract.length > 0) {
                destinationAccount = await artistContract[0].profileAddress; // The new contract addresss
                migratedArtist = true;
                console.log("Matching balance address with Artist contract at: ", ele.addr, " Balance: ", ele.balance, " Transferring to: ", destinationAccount);
            } else {
                let pppContract = await dbRelease.find({ contractAddress_2018Chain: ele.addr }).limit(1).exec();
                if (pppContract.length > 0) {
                    destinationAccount = await pppContract[0].contractAddress; // The new contract addresss
                    migratedPPP = true;
                    console.log("Matching balance address with PPP contract at: ", ele.addr, " Balance: ", ele.balance, " Transferring to: ", destinationAccount);
                }
            }

            addressHash.set(destinationAccount.toLowerCase(), ele.addr.toLowerCase());
            // console.log(addressHash.get(destinationAccount).toString());
            //        
            if ((myNonce === 0) || (process.env.MULTI_TRX_HIGHSPEED_BLOCK_MODE.toLowerCase() == "false")) {
                deployedBalances = await musicoinContract.transfer(destinationAccount, weiBalance);
                myNonce = deployedBalances.nonce;
            } else {
                myNonce++;
                deployedBalances = musicoinContract.transfer(destinationAccount, weiBalance, { nonce: myNonce });
                /**
                            let transactionInfo = {
                                to: destinationAccount,
                                value: ethers.utils.parseEther(ele.balance.toString()),
                                nonce: i
                            }
                            senderAddress.sendTransaction(transactionInfo);
                        */
            }
        }
        i++;
        if (i % 100 === 0) {
            console.log("Records processed: ", i, "/", balances.length);
        }
        // Verbose, slow test logging
        /**
        const rc = await deployedBalances.wait();
        const event = rc.events.find(event => event.event === 'Transfer');
        const transferEventFrom = event.args[0]; // [from, to, amount]
        const transferEventTo = event.args[1]; // [from, to, amount]
        const transferEventAmount = event.args[2]; // [from, to, amount]
        console.log("To Address: ", destinationAccount, " | Transfer Amount: ", weiBalance, " | Starting Balance: ", startingBalance.toString(), " | Final Balance: ", (await musicoinContract.balanceOf(ele.addr)).toString(), " | was Artist contract: ", migratedArtist, " | was PPP contract", migratedPPP, " | Original address:", ele.addr);
        console.log("Event listener - To Address: ", transferEventTo, " | Transfer Amount: ", transferEventAmount.toString(), " | From Address: ", transferEventFrom);
        */

    }

    let endTime = new Date();
    console.log("End time: ", endTime.toUTCString(), " Elapsed minutes: ", (endTime.getTime() - startTime.getTime()) / (1000 * 60), " Records processed: ", balances.length);

    // ***** Need a delay here before exiting to capture the final block write callbacks.  Proper delay callback wasn't working, but this hack does
    console.log("Migration status:");
    console.log("Total records:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).exec());
    console.log("Migrated:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).where({ $and: [{ migrated: true, skipMigration: { $ne: true } }] }).exec());
    console.log("Need resolving:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).where({ $and: [{ migrating: true, migrated: { $ne: true }, skipMigration: { $ne: true } }] }).exec());
    console.log("Remaining:", await dbBalance.count({ balance: { $exists: true, $ne: null, $ne: 0 } }).where({ $and: [{ migrating: { $ne: true }, migrated: { $ne: true }, skipMigration: { $ne: true } }] }).exec());

    // force a delay for the async to finish.  5 sec needed
    const balances2 = await dbBalance.find({ balance: { $exists: true, $ne: null, $ne: 0 } })
        .where({ $and: [{ migrating: { $ne: true }, migrated: { $ne: true }, skipMigration: { $ne: true } }] })
        .exec();
}

async function transferEventHandler(_musicoinContract, _dbBalance) {
    let filter = _musicoinContract.filters.Transfer(null, null);
    _musicoinContract.on(filter, (from, to, value) => {
        console.log("To Address: ", to.toLowerCase(), " | Transfer Amount: ", value.toString());
        updateTransferStatus(to, _dbBalance);
    });
}

async function updateTransferStatus(accountAddress, _dbBalance) {
    let lookupAddress = addressHash.get(accountAddress.toLowerCase()).toString();
    let balance = await _dbBalance.find({ addr: lookupAddress }).limit(1).exec();
    //    console.log("*****", balance.length, ":", lookupAddress, ":", accountAddress);
    if (balance.length > 0) {
        balance[0].migrated = true;
        balance[0].save();
    }
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
