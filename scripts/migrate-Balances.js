const hre = require("hardhat");
const connection = require('../db/connection.js');
const BalanceSchema = require('../db/core/Balance.js');
const BigNumber = require('bignumber.js');
var Web3 = require('web3');

async function main() {
    const musicoinContract = await hre.ethers.getContractFactory("Music");
    const musicoin = await musicoinContract.attach(process.env.MUSICOIN_ADDRESS);
    const musicoinOwner = process.env.PRIVATE_KEY;

    //DB Models
    const dbUser = connection.model('Balance', BalanceSchema); // Artist

    //Get balances from DB which are not migrated yet.  This can be limited for smaller deployment cycles and rerunning will continue to the next batch of balances not migrated.  Set to 1 for dev/test cycles    
    const balances = await dbUser.find({ balance: { $exists: true, $ne: null, $ne: 0 } })
        .where({ $and: [{ migrating: { $ne: true } }, { migrated: { $ne: true } }, { skipMigration: { $ne: true } }] }).limit(2).exec(); // Check both flags and only work with records that have not initiated or completed a migration.  Any initiated but incomplete records need to be resolved manually to prevent double spend

    let deployedBalances;

    for (let ele of balances) {
        let startingBalance = await musicoin.balanceOf(ele.addr);
        let weiBalance = Web3.utils.toWei(ele.balance.toString(), 'ether');
        //console.log("Loaded balance Address: ", ele.addr, " | Onchain balance: ", startingBalance.toString(), " | Recovering amount: ", ele.balance, " | In Wei: ", weiBalance);
        ele.migrating = true;  // Flag that a transfer has started to ensure we can find records which the transfer was done but the flag ele.migrated didnt get set to true due to a failure after transfers
        await ele.save();

        deployedBalances = await musicoin.transfer(
            ele.addr,
            weiBalance
        );

        // Pickup the new Artist contract address using the event listener
        const rc = await deployedBalances.wait();
        const event = rc.events.find(event => event.event === 'Transfer');
        const transferEventFrom = event.args[0]; // [from, to, amount]
        const transferEventTo = event.args[1]; // [from, to, amount]
        const transferEventAmount = event.args[2]; // [from, to, amount]

        console.log("To Address: ", ele.addr, " | Transfer Amount: ", weiBalance, " | Starting Balance: ", startingBalance.toString(), " | Final Balance: ", (await musicoin.balanceOf(ele.addr)).toString());
        //console.log("Event listener - To Address: ", transferEventTo, " | Transfer Amount: ", transferEventAmount.toString(), " | From Address: ", transferEventFrom);

        ele.migrated = true;
        await ele.save();
    }

    console.log("All Balances have been deployed!!!")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
