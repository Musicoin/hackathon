const { expect, assert } = require('chai');
const { ethers } = require("hardhat");

//                    //
//  MUSIC_Schain.sol  //
//                    //

describe("MUSIC_Schain.sol", function () {
    let musicoinToken;
    let owner;
    let addr1;
    let addr2;
    this.timeout(500000);

    beforeEach(async function () {
        musicoinContract = await ethers.getContractFactory("Music");
        musicoinFactoryContract = await ethers.getContractFactory("MusicFactory");

        [owner, addr1, addr2] = await ethers.getSigners();

        musicoinToken = await musicoinContract.deploy(owner.address);
        await musicoinToken.deployed();
        mcFactory = await musicoinFactoryContract.deploy(musicoinToken.address);
        await mcFactory.deployed();
    });

    describe("Deployment", async function () {

        it("should deploy Musicoin Token", async function () {
            expect(await musicoinToken.symbol()).to.equal("MUSIC");
        });

        it("should show that the Initial totalSupply of Tokens is 10000000 on deployment", async function () {
            let x = 10000000;
            expect(await musicoinToken.totalSupply()).to.equal(x);
        });

        // there is no owner stored in the contract.  This is the only way of checking the owner of Musicoin by initial token balance
        it("should show the owner/deployer balance of the token", async function () {
            let balance = await musicoinToken.balanceOf(owner.address);
            assert.equal(balance, 10000000);
        });

    });

    describe("MUSIC_Schain transfer functions", function () {

        it("should transfer 20 tokens to addr1", async function () {
            let trxMC = await musicoinToken.connect(owner).transfer(addr1.address, 20);
            await trxMC.wait();

            let balance = await musicoinToken.balanceOf(addr1.address);
            expect(balance).to.equal(20);
        });
        
        it("should transfer 10 tokens from addr1 to addr2", async function () {
            let trx1 = await musicoinToken.connect(owner).transfer(addr1.address, 20);
            let trx2 = await musicoinToken.connect(addr1).transfer(addr2.address, 10);
            trx1.wait();
            trx2.wait();
            
            let balance = await musicoinToken.balanceOf(addr2.address);
            expect(balance).to.equal(10);
            assert.equal(await musicoinToken.balanceOf(addr1.address), 10);
        });
        
        it("FAIL: addr1 transferring to self from addr2 without approval", async function () {
            let trxn = await musicoinToken.connect(addr2).transferFrom(addr2.address, addr1.address, 10);
            await expect(trxn.wait()).to.be.reverted;
            let balance = await musicoinToken.balanceOf(addr2.address);
            expect(balance).to.equal(0);
            assert.equal(await musicoinToken.balanceOf(addr1.address), 0);
        });
        
       it("It should approve setting an allowance from addr1 to addr2", async function () {
            let trx1 = await musicoinToken.connect(owner).transfer(addr1.address, 1000);
            trx1.wait();
	        await musicoinToken.connect(addr1).approve(addr2.address, 100);
	        let approved = await musicoinToken.allowance(addr1.address, addr2.address);
            expect(approved).to.equal(100);
        });
        
        it("It should approve setting an allowance from addr1 to mcFactory, a contract", async function () {
            let trx1 = await musicoinToken.connect(owner).transfer(addr1.address, 1000);
            trx1.wait();
	        await musicoinToken.connect(addr1).approve(mcFactory.address, 100);
	        let approved = await musicoinToken.allowance(addr1.address, mcFactory.address);
            expect(approved).to.equal(100);
        });
       
        it("It should allow sending coin from addr1 by owner to addr2", async function () {
            let trx1 = await musicoinToken.connect(owner).transfer(addr1.address, 1000);
            trx1.wait();
	        await musicoinToken.connect(addr1).approve(owner.address, 100);
            await musicoinToken.connect(owner).transferFrom(addr1.address, addr2.address, 50);
            let balance = await musicoinToken.balanceOf(addr1.address);
            expect(balance).to.equal(950);
            balance = await musicoinToken.balanceOf(addr2.address);
            expect(balance).to.equal(50);
	        let approved = await musicoinToken.allowance(addr1.address, owner.address);
            expect(approved).to.equal(50);
        });

        it("It should not transfer anything if there is not enough balance to complete the transaction", async function () {
            let trx1 = await musicoinToken.connect(owner).transfer(addr1.address, 1000);
            trx1.wait();
	        await musicoinToken.connect(addr1).approve(owner.address, 100);
            let trx2 = await musicoinToken.connect(owner).transferFrom(addr1.address, addr2.address, 500);
            await expect(trx2.wait()).to.be.reverted; // With("VM Exception while processing transaction: reverted with reason string 'Music::transferFrom: transfer amount exceeds spender allowance");
            let balance = await musicoinToken.balanceOf(addr1.address);
            expect(balance).to.equal(1000);
            balance = await musicoinToken.balanceOf(addr2.address);
            expect(balance).to.equal(0);
	        let approved = await musicoinToken.allowance(addr1.address, owner.address);
            expect(approved).to.equal(100);
        });
       
        it("It should not transfer anything if there is not enough balance to complete the transaction", async function () {
            let trx1 = await musicoinToken.connect(owner).transfer(addr1.address, 90000000);
            await expect(trx1.wait()).to.be.reverted; // With("VM Exception while processing transaction: reverted with reason string 'Music::_transferTokens: transfer amount exceeds balance'");;
            balance = await musicoinToken.balanceOf(owner.address);
            expect(balance).to.equal(10000000);
        });
        
    });
    

    // Delegates, Votes, Transfer tokens, Mint, Burn
    
});

