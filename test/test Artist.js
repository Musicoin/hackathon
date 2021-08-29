const { expect, assert } = require('chai');
const { ethers } = require("hardhat");

//                    //
//     Artist.sol     //
//                    //

describe("Artist.sol", function () {
    let musicoinToken;
    let mcFactory;
    let artist1;
    let artist2;
    let owner;
    let addr1;
    let addr2;

    this.timeout(500000);

    beforeEach(async function () {
        artistContract = await ethers.getContractFactory("Artist"); 
        musicoinContract = await ethers.getContractFactory("Music");
        musicoinFactoryContract = await ethers.getContractFactory("MusicFactory");
        [owner, addr1, addr2] = await ethers.getSigners();

        // Create and distribute Musicoin for testing
        musicoinToken = await musicoinContract.deploy(owner.address);
        await musicoinToken.deployed();
        mcFactory = await musicoinFactoryContract.deploy(musicoinToken.address);
        await mcFactory.deployed();
        await musicoinToken.transfer(addr1.address, 100);
        await musicoinToken.transfer(addr2.address, 100);

		// Create Artists for testing
        let artistTx1 = await mcFactory.connect(addr1).createArtist(addr1.address, "Artist1", "IMG1", "DESC1", "Social1"); //Create Artist contract instances
        await artistTx1.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash
        let artistTx2 = await mcFactory.connect(addr2).createArtist(addr2.address, "Artist2", "IMG2", "DESC2", "Social2"); //Create Artist contract instances
        await artistTx2.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash


        artistList = await mcFactory.getArtistList();
        artist1 = await artistContract.attach(artistList[0]);
        artist2 = await artistContract.attach(artistList[1]);
    });

    describe("Deployment",async function () {

        // Create with the owner the same account as the msg sender (A)
        it("should deploy artist to the correct owner", async function () {
            expect(await artist1.owner()).to.equal(addr1.address);
            expect(await artist2.owner()).to.equal(addr2.address);
        });

        it("should give MusicFactory contract 100 spending allowance", async function () {
   	        await musicoinToken.connect(addr1).approve(mcFactory.address, 100);
            let allowance = await musicoinToken.allowance(addr1.address, mcFactory.address);
            assert.equal(allowance, 100);
        });

        it("All initial Artist values should be set and returned correctly after created.", async function () {
			expect(await artist1.createdBy()).to.equal(addr1.address);
			expect(await artist2.createdBy()).to.equal(addr2.address);
        });

    });

    describe("Artist.sol Basic Tests (GET & SET testing)", async function () {

        // THESE FOLLOWING TESTS ARE DONE BELOW WITH THE GET/SET TESTING
        // Check the values in each field to be the same as you set using the get functions. Also,
        //      createdBy should be the msg.sender;
        //      musicToken should be the expected token address 


        // Check the values in each field to be the same as you set using the get functions. Also,
        //      createdBy should be the msg.sender but owner is what you sent;

        // Using (A) and sending requests from the contract owner account, 
        // update the variables using the set functions and check their values 
        // with the get functions right after
        //      - setArtistName
        //      - setImageUrl
        //      - setDescriptionUrl
        //      - setSocialUrl
        //      - updateDetails
        //      - setOwner

        // Use an invalid address.  What happens?  What is stored in the owner field afterwards?
        //      Use a new, correct address

        // Using (A) and sending requests NOT from the correct contract owner account, 
        // update the variables using the set functions.  All requests should FAIL
        //      - setArtistName
        //      - setImageUrl
        //      - setDescriptionUrl
        //      - setSocialUrl
        //      - updateDetails
        //      - setOwner

        it("Get and Set tests: Artist Name", async function () {
			expect(await artist1.artistName()).to.equal('Artist1');
			await artist1.connect(addr1).setArtistName('new Artist1');
			expect(await artist1.artistName()).to.equal('new Artist1');			
			// Not the owner test
            let trx1 = await artist1.connect(addr2).setArtistName('FAIL');
            await expect(trx1.wait()).to.be.reverted; // With('VM Exception while processing transaction: revert with reason "Caller is not owner"');
        });


        it("Get and Set tests: Image URL", async function () {
			expect(await artist1.imageUrl()).to.equal('IMG1');
			await artist1.connect(addr1).setImageUrl('new IMG1');
			expect(await artist1.imageUrl()).to.equal('new IMG1');			
			// Not the owner test
            let trx1 = await artist1.connect(addr2).setImageUrl('FAIL');
            await expect(trx1.wait()).to.be.reverted; // With('VM Exception while processing transaction: revert with reason "Caller is not owner"');
        });

        it("Get and Set tests: Description URL", async function () {
			expect(await artist1.descriptionUrl()).to.equal('DESC1');
			await artist1.connect(addr1).setDescriptionUrl('new DESC1');
			expect(await artist1.descriptionUrl()).to.equal('new DESC1');			
			// Not the owner test
            let trx1 = await artist1.connect(addr2).setDescriptionUrl('FAIL');
            await expect(trx1.wait()).to.be.reverted;
        });

        it("Get and Set tests: Social URL", async function () {
			expect(await artist1.socialUrl()).to.equal('Social1');
			await artist1.connect(addr1).setSocialUrl('new Social1');
			expect(await artist1.socialUrl()).to.equal('new Social1');			
			// Not the owner test
            let trx1 = await artist1.connect(addr2).setSocialUrl('FAIL');
            await expect(trx1.wait()).to.be.reverted;
        });
 
        it("Get and Set tests: UpdateDetails", async function () {
			expect(await artist1.artistName()).to.equal('Artist1');
			expect(await artist1.imageUrl()).to.equal('IMG1');
			expect(await artist1.descriptionUrl()).to.equal('DESC1');
			expect(await artist1.socialUrl()).to.equal('Social1');

			let trx1 = await artist1.connect(addr1).updateDetails('new Artist1', 'new IMG1', 'new DESC1','new Social1');
            trx1.wait();
			expect(await artist1.artistName()).to.equal('new Artist1');			
			expect(await artist1.imageUrl()).to.equal('new IMG1');			
			expect(await artist1.descriptionUrl()).to.equal('new DESC1');			
			expect(await artist1.socialUrl()).to.equal('new Social1');			
			// Not the owner test
            trx1 = await artist1.connect(addr2).updateDetails('FAIL','FAIL','FAIL','FAIL');
            await expect(trx1.wait()).to.be.reverted;
        });
       
        it("Get and Set tests: owner", async function () {
            expect(await artist1.owner()).to.equal(addr1.address);
			await artist1.connect(addr1).setOwner(addr2.address);
            expect(await artist1.owner()).to.equal(addr2.address);
			// Not the owner test
            let trx1 = await artist1.connect(addr1).setSocialUrl('FAIL');
            await expect(trx1.wait()).to.be.reverted;
        });

     });


    describe("Artist.sol Interactive Tests", async function () {

        describe("Testing FOLLOWING functions", async function () {

            it("Test following", async function () {
            	// Call follow().  The caller should now be true in the "following" array
                await artist1.connect(owner).follow()
                let followers = await artist1.followers();
                assert.equal(followers, 1);
                expect(await artist1.following(owner.address)).to.equal(true);
                expect(await artist1.following(addr1.address)).to.equal(false);

	            // Call unfollow().  The caller should be false in the "following" array
                let trx1 = await artist1.connect(owner).unfollow();
                trx1.wait();
                expect(await artist1.following(owner.address)).to.equal(false);

	            // Change accounts.  Call follow().  The caller should now be true in the "following" array.  The previous account should still be false
                trx1 = await artist1.connect(addr1).follow();
                trx1.wait();
                expect(await artist1.following(owner.address)).to.equal(false);
                expect(await artist1.following(addr1.address)).to.equal(true);
            });
        });

        describe("Testing TIPPING function", async function () {
            // Use an account that has not approved mcFactory to use their funds
            it("should fail tipping the artist", async function () {
                let trx = await artist1.connect(addr2).tip(2);
                await expect(trx.wait()).to.be.reverted; // With('Music::transferFrom: transfer amount exceeds spender allowance');
                expect(await artist1.tipTotal()).to.equal(0);
            })

            // Use an account that is the owner
            it("should tip the artist 2 Musicoin using the contract owner (no balance change)", async function () {
		        let trx = await musicoinToken.connect(addr1).approve(mcFactory.address, 100);
                trx.wait();
                trx = await artist1.connect(addr1).tip(2);
                trx.wait();
                expect(await artist1.tipTotal()).to.equal(2);
            //      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
            })

            // Use an account that is NOT the owner
            it("should tip the artist Musicoin", async function () {
        	    //      - Owner's $MUSIC balance should be increased by $MUSIC requested to send
    	        //      - TipTotal and TipCount should be incremented accordingly
	            //      - Event should be emitted with the correct information // ** HOW TO TEST THIS?
		        let tipAmount = 5;
				let initialSenderFunds = await musicoinToken.balanceOf(addr2.address);
				let initialOwnerFunds = await musicoinToken.balanceOf(await artist1.owner());
				let allowance = 100;
		        (await musicoinToken.connect(addr2).approve(mcFactory.address, allowance)).wait();
                (await artist1.connect(addr2).tip(tipAmount)).wait();
                expect(await artist1.tipTotal()).to.equal(tipAmount);
                expect(await artist1.tipCount()).to.equal(1);

				// Allowance is reduced
       	        let approved = await musicoinToken.allowance(addr2.address, mcFactory.address);
                expect(approved).to.equal(allowance-tipAmount);
	            //      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
				// Balance of sender is reduced
				let senderBalance = await musicoinToken.balanceOf(addr2.address);
                expect(senderBalance).to.equal(initialSenderFunds-tipAmount);

				// Balance of artist owner is increased
				let artistBalance = await musicoinToken.balanceOf(await artist1.owner());
				let expectedBalance = initialOwnerFunds.add(tipAmount);
                expect(artistBalance).to.equal(expectedBalance);
            })

            // Use an account that is the owner
            //      - Send tip.  Owner account balance should be unchanged
            //      - TipTotal and TipCount should be incremented accordingly.  Should sending tips from the owner be prevented to stop someone from hacking the tip statistics? Ben Gyles
            //      - Event should be emitted with the correct information
            it("tip the artist with the owner account", async function () {
		        let tipAmount = 5;
				let initialSenderFunds = await musicoinToken.balanceOf(addr1.address);
				let initialOwnerFunds = await musicoinToken.balanceOf(await artist1.owner());
				let allowance = 100;
		        (await musicoinToken.connect(addr1).approve(mcFactory.address, allowance)).wait();
                let tipTx = await artist1.connect(addr1).tip(tipAmount);
                tipTx.wait();
                expect(await artist1.tipTotal()).to.equal(tipAmount);
                expect(await artist1.tipCount()).to.equal(1);

				// Allowance is reduced
       	        let approved = await musicoinToken.allowance(addr1.address, mcFactory.address);
                expect(approved).to.equal(allowance-tipAmount);
	            //      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
				// Balance of sender is reduced
				let senderBalance = await musicoinToken.balanceOf(addr1.address);
                expect(senderBalance).to.equal(initialSenderFunds);

				// Balance of artist owner is increased
				let artistBalance = await musicoinToken.balanceOf(await artist1.owner());
                expect(artistBalance).to.equal(initialOwnerFunds);
            })
            
            // Use an account that is NOT the owner
            //      - Send tip that is more than the allowance.  Send should fail
            //      - Send tip that is more than the $MUSIC owned.  Send should fail
            // Use an account that is NOT the owner
            it("should tip the artist Musicoin", async function () {
		        let tipAmount = 9000000000;
				let initialSenderFunds = await musicoinToken.balanceOf(addr2.address);
				let initialOwnerFunds = await musicoinToken.balanceOf(await artist1.owner());
				let allowance = 1000000000;
		        (await musicoinToken.connect(addr2).approve(mcFactory.address, allowance)).wait();
                let trx = await artist1.connect(addr2).tip(tipAmount);
                await expect(trx.wait()).to.be.reverted; // With('Music::transferFrom: transfer amount exceeds spender allowance');
		        tipAmount = 1000000000;
                trx = await artist1.connect(addr2).tip(tipAmount);
                await expect(trx.wait()).to.be.reverted; // With('Music::_transferTokens: transfer amount exceeds balance');
            })
        });

       describe("Testing Payout function", async function () {
        // PAYOUT Currently there are no funds collected for payout using this contract, but maybe they are sent from other contract transfers ???

			it("should transfer 20 tokens to artist1 and payout some to an account", async function () {
				(await musicoinToken.transfer(artist1.address, 20)).wait();
				let artistBalance = await musicoinToken.balanceOf(artist1.address);
				let addr2Balance = await musicoinToken.balanceOf(addr2.address);
				let addr1Balace = await musicoinToken.balanceOf(addr1.address);
				expect(artistBalance).to.equal(20);
				let payoutAmount = 5;
				(await artist1.connect(addr1).payOut(addr2.address, payoutAmount)).wait();
				expect(await musicoinToken.balanceOf(artist1.address)).to.equal(artistBalance.sub(payoutAmount));
				expect(await musicoinToken.balanceOf(addr2.address)).to.equal(addr2Balance.add(payoutAmount));          
                
                let trx = await artist1.connect(addr1).payOut(addr2.address, 1000);
				await expect(trx.wait()).to.be.reverted; // With('Music::_transferTokens: transfer amount exceeds balance');
                trx = await artist1.connect(addr2).payOut(addr2.address, 1000);
				await expect(trx.wait()).to.be.reverted; // With('Caller is not owner');
			});

			it("should transfer 20 tokens to artist1 and payout all to the owner", async function () {
				let payoutAmount = 30;
				(await musicoinToken.transfer(artist1.address, payoutAmount)).wait();
				let artistBalance = await musicoinToken.balanceOf(artist1.address);
				let addr2Balance = await musicoinToken.balanceOf(addr2.address);
				expect(artistBalance).to.equal(payoutAmount);

				(await artist1.connect(addr1).payOutBalance(addr2.address)).wait();
				expect(await musicoinToken.balanceOf(artist1.address)).to.equal(0);
				expect(await musicoinToken.balanceOf(addr2.address)).to.equal(addr2Balance.add(payoutAmount));  
                let trx = await artist1.connect(addr2).payOutBalance(addr2.address);        
				await expect(trx.wait()).to.be.reverted; // With('Caller is not owner');
			});
        });

        describe("Kill Tests", async function () {
            it("Kill Artist contract", async function() {
                let artistAddress = artist1.address;
                let trx = await artist1.connect(addr1).kill();
                trx.wait();
                expect(await ethers.provider.getCode(artistAddress)).to.be.equal("0x");
            });
            
            it("Kill Factory contract", async function() {
                let mcFactoryAddress = mcFactory.address;
                let trx = await mcFactory.connect(owner).kill();
                trx.wait();
                expect(await ethers.provider.getCode(mcFactoryAddress)).to.be.equal("0x");
            });
            
            it("New Music Factory for Artist", async function() {
                mcFactory2 = await musicoinFactoryContract.deploy(musicoinToken.address);
                await mcFactory2.deployed();
        
                let mcFactoryAddress = await artist1.getMusicFactoryAddress();
                let trx = await mcFactory.connect(owner).kill();
                trx.wait();
                trx = await artist1.connect(addr1).updateMusicFactory(mcFactory2.address);
                trx.wait();
                expect(mcFactoryAddress).to.not.be.equal(await artist1.getMusicFactoryAddress());
                expect(mcFactory2.address).to.be.equal(await artist1.getMusicFactoryAddress());
            });
        });
    });
});


