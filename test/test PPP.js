const { expect, assert } = require('chai');
const { ethers } = require("hardhat");

//                    //
//   PayPerPlay.sol   //
//                    //

describe("PayPerPlay.sol", function () {
    let musicoinToken;
    let mcFactory;
    let artist1;
    let artist2;
    let artist3;
    let ppp1;
    let ppp2;
    let ppp3;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        pppContract = await ethers.getContractFactory("PayPerPlay"); 
        artistContract = await ethers.getContractFactory("Artist"); 
        musicoinContract = await ethers.getContractFactory("Music");
        musicoinFactoryContract = await ethers.getContractFactory("MusicFactory");
        [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

        // Create and distribute Musicoin for testing
        musicoinToken = await musicoinContract.deploy(owner.address);
        mcFactory = await musicoinFactoryContract.deploy(musicoinToken.address);
        await musicoinToken.transfer(addr1.address, 100000);
        await musicoinToken.transfer(addr2.address, 100000);
        await musicoinToken.transfer(addr3.address, 100000);
        await musicoinToken.transfer(addr4.address, 100000);
        await musicoinToken.transfer(addr5.address, 99);
        

		// Create Artists for testing
        let artistTx1 = await mcFactory.connect(addr1).createArtist(addr1.address, "Artist1", "IMG1", "DESC1", "Social1"); //Create Artist contract instances
        await artistTx1.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash
        let artistTx2 = await mcFactory.connect(addr2).createArtist(addr2.address, "Artist2", "IMG2", "DESC2", "Social2"); //Create Artist contract instances
        await artistTx2.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash
        // Create with the owner different from the msg sender (B)
        let artistTx3 = await mcFactory.connect(addr1).createArtist(addr2.address, "Artist3", "IMG3", "DESC3", "Social3"); //Create Artist contract instances
        await artistTx3.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash

        artistList = await mcFactory.getArtistList();
        artist1 = await artistContract.attach(artistList[0]);
        artist2 = await artistContract.attach(artistList[1]);
        artist3 = await artistContract.attach(artistList[2]);     
        
        // Create PPP for testing
        let contributors = [addr2.address, owner.address];
        let share = [3, 5];
 		let contentByte32 = ethers.utils.formatBytes32String("Content1"); // or use "0x6c00000000000000000000000000000000000000000000000000000000000001"; // ** unsure what this should really be but the contract functionality doesnt require specific values
        let pppTx1 = await mcFactory.connect(addr1).createPayPerPlay(addr1.address, "Title1", "Name1", artist1.address, 100, "rURL1", contentByte32, "iURL1", "mURL1", contributors, share); //Create Artist contract instances
        await pppTx1.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash
        
        contributors = [addr2.address, owner.address, addr1.address];
        share = [3, 5, 6];
 		contentByte32 = ethers.utils.formatBytes32String("Content2"); // or use "0x6c00000000000000000000000000000000000000000000000000000000000002"; // ** unsure what this should really be but the contract functionality doesnt require specific values
        let pppTx2 = await mcFactory.connect(addr2).createPayPerPlay(addr4.address, "Title2", "Name2", artist1.address, 100, "rURL2", contentByte32, "iURL2", "mURL2", contributors, share); //Create Artist contract instances
        await pppTx2.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash
        
        contributors = [addr1.address];
        share = [1];
 		contentByte32 = ethers.utils.formatBytes32String("Content3"); // or use "0x6c00000000000000000000000000000000000000000000000000000000000003"; // ** unsure what this should really be but the contract functionality doesnt require specific values
        let pppTx3 = await mcFactory.connect(addr2).createPayPerPlay(owner.address, "Title1", "Name1", artist2.address, 100, "rURL3", contentByte32, "iURL3", "mURL3", contributors, share); //Create Artist contract instances
        await pppTx3.wait();  // Functions that write data to the blockchain don't return any values. They return the transaction hash

        let pppList = await mcFactory.getPayPerPlayList();
        ppp1 = await pppContract.attach(pppList[0]);
        ppp2 = await pppContract.attach(pppList[1]);
        ppp3 = await pppContract.attach(pppList[2]);     
    });

    describe("Deployment", function () {

         it("should deploy PPP Contract to the right owner", async function () {
             expect(await ppp1.owner()).to.equal(addr1.address);
             expect(await ppp2.owner()).to.equal(addr4.address);
             expect(await ppp3.owner()).to.equal(owner.address);
         });
         
        it("should give MusicFactory contract 100 spending allowance", async function () {
   	        await musicoinToken.connect(addr1).approve(mcFactory.address, 100);
            let allowance = await musicoinToken.allowance(addr1.address, mcFactory.address);
            assert.equal(allowance, 100);
        });

//** Due to a limitation on the number of variables a function can have passed, createdBy is only going to be the MusicoinFactory.  If we need a different address here for the real caller of musicoinFactory then auto setting the Artist name to the Artist contract's is the easiest way to remove a variable being passed
        it("All initial PPP values should be set and returned correctly after created.", async function () {
			expect(await ppp1.createdBy()).to.equal(mcFactory.address);
			expect(await ppp2.createdBy()).to.equal(mcFactory.address);
			expect(await ppp3.createdBy()).to.equal(mcFactory.address);
        });
         
    });
    
    describe("PayPerPlay.sol Basic Tests (GET & SET testing)", async function () {

        // Create PPP contract instances
        // - 1st Contract (“PPP-1”)
        //     - Use Artist contract “A”
        //     - Use 4 contributors
        //     - Make contributor shares as 4, 3, 2, 1
        //     - Musicperplay should be 1 $MUSIC (1 is 10^18)
        //
        // - 2nd Contract (“PPP-2”)
        //     - Use an invalid address reference for Artist contract.  It should fail 
        //     - (There is no check here for using a valid contract address 
        //        but not one that is an Artist contract)

        // Check PPP-1 
        //  - Use the get functions to check all values set match as expected
        //      - Also call getContributorsLength.  This should return 4
        //
        //  - As the owner, use the update functions and check values updated correctly with the get functions
        //      - updateTitle
        //          - There should be an event alert
        //      - updateArtistName
        //          - There should be an event alert
        //      - updateResourceUrl
        //          - There should be an event alert
        //      - updateImageUrl
        //          - There should be an event alert
        //      - updateArtistAddress
        //          - There should be an event alert
        //      - updateMetadataUrl
        //          - There should be an event alert
        //      - updateLicense
        //          - Use 3 contributors; shares 5,2,3
        //      - There should be an event alert
        //          - getContributorsLength.  This should return 3
        //      - transferOwnership
        //          - Set ownership to a new account
        //          - There should be an event alert
        //
        //  - Test ownership.  Do not change to the new owner account and call all functions as the 
        //    non-owner.  All of the following should fail with “Caller is not owner”
        //      - updateTitle
        //      - updateArtistName
        //      - updateResourceUrl
        //      - updateImageUrl
        //      - updateArtistAddress
        //      - updateMetadataUrl
        //      - updateLicense
        //      - transferOwnership

        it("Get and Set tests: Title", async function () {
			expect(await ppp1.title()).to.equal('Title1');
			await ppp1.connect(addr1).updateTitle('new Title1');
			expect(await ppp1.title()).to.equal('new Title1');			
			// Not the owner test
            await expect(ppp1.connect(addr2).updateTitle('FAIL')).to.be.reverted;
        });

        it("Get and Set tests: Artist Name", async function () {
			expect(await ppp1.artistName()).to.equal('Name1');
			await ppp1.connect(addr1).updateArtistName('new Artist1');
			expect(await ppp1.artistName()).to.equal('new Artist1');			
			// Not the owner test
            await expect(ppp1.connect(addr2).updateArtistName('FAIL')).to.be.reverted;
        });

        it("Get and Set tests: Resource URL", async function () {
			expect(await ppp1.resourceUrl()).to.equal('rURL1');
			await ppp1.connect(addr1).updateResourceUrl('new rURL1');
			expect(await ppp1.resourceUrl()).to.equal('new rURL1');			
			// Not the owner test
            await expect(ppp1.connect(addr2).updateResourceUrl('FAIL')).to.be.reverted;
        });

        it("Get and Set tests: Image URL", async function () {
			expect(await ppp1.imageUrl()).to.equal('iURL1');
			await ppp1.connect(addr1).updateImageUrl('new iURL1');
			expect(await ppp1.imageUrl()).to.equal('new iURL1');			
			// Not the owner test
            await expect(ppp1.connect(addr2).updateImageUrl('FAIL')).to.be.reverted;
        });

        it("Get and Set tests: Artist Address", async function () {
			expect(await ppp1.artistProfileAddress()).to.equal(artist1.address);
			await ppp1.connect(addr1).updateArtistAddress(artist2.address);
			expect(await ppp1.artistProfileAddress()).to.equal(artist2.address);			
			// Not the owner test
            await expect(ppp1.connect(addr2).updateArtistAddress(artist2.address)).to.be.reverted;
        });

        it("Get and Set tests: Metadata URL", async function () {
			expect(await ppp1.metadataUrl()).to.equal('mURL1');
			await ppp1.connect(addr1).updateMetadataUrl('new mURL1');
			expect(await ppp1.metadataUrl()).to.equal('new mURL1');			
			// Not the owner test
            await expect(ppp1.connect(addr2).updateMetadataUrl('FAIL')).to.be.reverted;
        });

        it("Get and Set tests: owner", async function () {
            expect(await ppp1.owner()).to.equal(addr1.address);
			await ppp1.connect(addr1).transferOwnership(addr2.address);
            expect(await ppp1.owner()).to.equal(addr2.address);
			// Not the owner test
            await expect(ppp1.connect(addr1).updateMetadataUrl('FAIL')).to.be.reverted;
        });
        
        it("Get and Set tests: license", async function () {
			// Initial settings match 
            expect(await ppp1.musicPerPlay()).to.equal(100);
            expect(await ppp1.contributors(0)).to.equal(addr2.address);
            expect(await ppp1.contributors(1)).to.equal(owner.address);
            expect(await ppp1.contributorShares(0)).to.equal(3);
            expect(await ppp1.contributorShares(1)).to.equal(5);
            expect(await ppp1.getContributorsLength()).to.equal(2);
            
            // Updates work
        	let contributors = [addr1.address, addr2.address, owner.address];
        	let share = [8, 1, 4];
            await ppp1.connect(addr1).updateLicense(5, contributors, share);
            
            // New values are returned
            expect(await ppp1.musicPerPlay()).to.equal(5);
            expect(await ppp1.contributors(0)).to.equal(addr1.address);
            expect(await ppp1.contributors(1)).to.equal(addr2.address);
            expect(await ppp1.contributors(2)).to.equal(owner.address);
            expect(await ppp1.contributorShares(0)).to.equal(8);
            expect(await ppp1.contributorShares(1)).to.equal(1);
            expect(await ppp1.contributorShares(2)).to.equal(4);
            expect(await ppp1.getContributorsLength()).to.equal(3);
            
            // Updates fail
        	contributors = [addr1.address, addr2.address, owner.address];
        	share = [8, 1];
            await expect(ppp1.connect(addr1).updateLicense(5, contributors, share)).to.be.revertedWith('# of contributors doesnt match the # of shares');
            await expect(ppp1.connect(addr1).updateLicense(5, contributors, [])).to.be.revertedWith('# of contributors doesnt match the # of shares');
            await expect(ppp1.connect(addr1).updateLicense(5, [], share)).to.be.revertedWith('# of contributors doesnt match the # of shares');
            await expect(ppp1.connect(addr1).updateLicense(5, [], [])).to.not.be.reverted;

            // check security
            await expect(ppp1.connect(addr2).updateLicense(5, contributors, share)).to.be.revertedWith('Caller not owner');

       });
    });

    describe("PayPerPlay.sol Play payment Tests", async function () {
        // Test Play functions
        // - Call play()
        //      - Play event should be emitted
        //      - Caller’s wallet should be reduced by 1 $MUSIC (1 is 10^18)
        //      - Owner’s wallet balance should not change
        //      - All Contributors' wallet balances should go up according to their ratios
        //      - totalEarned should be incremented by 1 $MUSIC (1 is 10^18)
        //      - playCount should go up by 1
        it("Test Play Functions", async function () {
	        let ownerBalance = await musicoinToken.balanceOf(owner.address);
        	let addr1Balance = await musicoinToken.balanceOf(addr1.address);
        	let addr2Balance = await musicoinToken.balanceOf(addr2.address);
        	let addr3Balance = await musicoinToken.balanceOf(addr3.address);
        	let addr4Balance = await musicoinToken.balanceOf(addr4.address);
            expect(await ppp2.musicPerPlay()).to.equal(100);

			expect(await ppp2.playCount()).to.equal(0);
			expect(await ppp2.totalEarned()).to.equal(0);

        	await expect(ppp2.connect(addr3).play()).to.be.revertedWith('Music::transferFrom: transfer amount exceeds spender allowance');
   	        await musicoinToken.connect(addr3).approve(mcFactory.address, 500);
   	        ppp2.connect(addr3).play();

  			//contributors = [addr2.address, owner.address, addr1.address];
  			//share = [3, 5, 6];
			expect(ownerBalance.add(35)).to.equal(await musicoinToken.balanceOf(owner.address)); //35
			expect(addr1Balance.add(42)).to.equal(await musicoinToken.balanceOf(addr1.address)); //42
			expect(addr2Balance.add(21)).to.equal(await musicoinToken.balanceOf(addr2.address)); //21
			expect(addr3Balance.sub(98)).to.equal(await musicoinToken.balanceOf(addr3.address)); //99902  (98 spent)
			
			expect(addr4.address).to.equal(await ppp2.owner());
			expect(addr4Balance).to.equal(await musicoinToken.balanceOf(addr4.address)); // no change
	
			expect(await ppp2.playCount()).to.equal(1);
			
			// Ratios cause decimals not to be paid out
			expect(await ppp2.totalEarned()).to.equal(98);
			
			
			// Test with insufficient funds
   	        await musicoinToken.connect(addr5).approve(mcFactory.address, 100);
   	        await expect(ppp2.connect(addr5).play()).to.be.reverted;
	        await musicoinToken.transfer(addr5.address, 100);
  	        await expect(ppp2.connect(addr5).play()).to.not.be.reverted;
        });
    });

    describe("PayPerPlay.sol tipping Tests", async function () {

        // Use the 3rd Contract (“PPP-3”).  It should have been setup with 2 contributors and 1 owner.
        //contributors = [addr1.address];
        //share = [1];

        // Use a wallet that is not one of the contributors or owners and has $MUSIC in the wallet.
        
        // TIPPING
        // - Use an account that is not the owner or a contributor
        //      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
        //      - Owner’s wallet balance should not change
        //      - All Contributors' wallet balances should go up according to their ratios
        //      - totalTipped and totalEarned should be incremented accordingly
        //      - Event should be emitted with the correct information

		// Use an account that has not approved mcFactory to use their funds
		it("should fail tipping the ppp", async function () {
			await expect(ppp3.connect(addr2).tip(2)).to.be.revertedWith('Music::transferFrom: transfer amount exceeds spender allowance');
			expect(await ppp3.totalTipped()).to.equal(0);
		});

		// Use an account that is the owner
		it("should tip the artist 2 Musicoin using the contract owner (no balance change)", async function () {
			let tipAmount = 2;
			let allowance = 100;
			await musicoinToken.connect(addr3).approve(mcFactory.address, allowance);
			let contributorBalance = await musicoinToken.balanceOf(addr1.address);
			let senderBalance = await musicoinToken.balanceOf(addr3.address);
			let initialOwnerFunds = await musicoinToken.balanceOf(await ppp3.owner());

			// Baseline prior to tipping
			expect(await ppp3.totalTipped()).to.equal(0);
			expect(await ppp3.tipCount()).to.equal(0);
			expect(await ppp3.totalEarned()).to.equal(0);

			let receipt = await ppp3.connect(addr3).tip(tipAmount);
			receipt.wait();
			
			// Tipped increased
			expect(await ppp3.totalTipped()).to.equal(tipAmount);
			//      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
			expect(await musicoinToken.balanceOf(addr3.address)).to.equal(senderBalance.sub(tipAmount));
			//      - Owner's $MUSIC balance should be increased by $MUSIC requested to send
			expect(await musicoinToken.balanceOf(addr1.address)).to.equal(contributorBalance.add(tipAmount));
			//      - TipTotal and TipCount should be incremented accordingly
			expect(await ppp3.totalTipped()).to.equal(tipAmount);
			expect(await ppp3.tipCount()).to.equal(1);
			expect(await ppp3.totalEarned()).to.equal(tipAmount);

			//      - Event should be emitted with the correct information // ** HOW TO TEST THIS?
			tipAmount = 50;
			senderBalance = await musicoinToken.balanceOf(addr3.address);
			contributorBalance = await musicoinToken.balanceOf(addr1.address);
			
			receipt = await ppp3.connect(addr3).tip(tipAmount);
			receipt.wait();
			expect(await ppp3.totalTipped()).to.equal(52);
			expect(await ppp3.tipCount()).to.equal(2);
			expect(await ppp3.totalEarned()).to.equal(52);

			// Allowance is reduced
			let approved = await musicoinToken.allowance(addr3.address, mcFactory.address);
            expect(approved).to.equal(48);
			//      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
			// Balance of sender is reduced
			expect(await musicoinToken.balanceOf(addr3.address)).to.equal(senderBalance.sub(tipAmount));

			// Balance of artist owner is increased
			expect(await musicoinToken.balanceOf(await ppp3.owner())).to.equal(initialOwnerFunds);
		});        
    });
    
    
            // DISTRIBUTE BALANCE (TBD. Currently there are no funds collected for payout using this contract)
    describe("PayPerPlay.sol distributeBalance Tests", async function () {
		it("should distribute the PPP contract balance to the contributors (not the owner)", async function () {
			await expect(ppp1.connect(addr5).distributeBalance()).to.be.revertedWith('Caller not owner');
			
			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(0);
			await musicoinToken.transfer(ppp1.address, 1000);
			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(1000);

			let addr1Balance = await musicoinToken.balanceOf(addr1.address);
			let addr2Balance = await musicoinToken.balanceOf(addr2.address);
			let ownerBalance = await musicoinToken.balanceOf(owner.address);

			let tx = await ppp1.connect(addr1).distributeBalance();
			tx.wait();
			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(0);
			expect(addr1Balance).to.equal(await musicoinToken.balanceOf(addr1.address));
	        //contributors = [addr2.address, owner.address];
    	    //share = [3, 5];
			expect(addr2Balance.add(1000/8*3)).to.equal(await musicoinToken.balanceOf(addr2.address));
			expect(ownerBalance.add(1000/8*5)).to.equal(await musicoinToken.balanceOf(owner.address));
	    });
    });
    
    
    describe("PayPerPlay.sol Kill Tests", async function () {
		it("should distribute the PPP contract balance to the contributors (not the owner) and destroy the contract", async function () {
			expect(ppp1.getContributorsLength()).to.not.be.reverted;
			await expect(ppp1.connect(addr5).kill(true)).to.be.revertedWith('Caller not owner');
			await expect(ppp1.connect(addr5).kill(false)).to.be.revertedWith('Caller not owner');

			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(0);
			await musicoinToken.transfer(ppp1.address, 1000);
			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(1000);

			let addr1Balance = await musicoinToken.balanceOf(addr1.address);
			let addr2Balance = await musicoinToken.balanceOf(addr2.address);
			let ownerBalance = await musicoinToken.balanceOf(owner.address);

			let tx = await ppp1.connect(addr1).kill(true);
			tx.wait();
			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(0);
			expect(addr1Balance).to.equal(await musicoinToken.balanceOf(addr1.address));
	        //contributors = [addr2.address, owner.address];
    	    //share = [3, 5];
			expect(addr2Balance.add(1000/8*3)).to.equal(await musicoinToken.balanceOf(addr2.address));
			expect(ownerBalance.add(1000/8*5)).to.equal(await musicoinToken.balanceOf(owner.address));

			expect(ppp1.getContributorsLength()).to.be.reverted;
	    });    

		it("should NOT distribute the PPP contract balance to the contributors and destroy the contract with balance", async function () {
			expect(ppp1.getContributorsLength()).to.not.be.reverted;

			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(0);
			await musicoinToken.transfer(ppp1.address, 1000);
			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(1000);

			let addr1Balance = await musicoinToken.balanceOf(addr1.address);
			let addr2Balance = await musicoinToken.balanceOf(addr2.address);
			let ownerBalance = await musicoinToken.balanceOf(owner.address);

			let tx = await ppp1.connect(addr1).kill(false);
			tx.wait();
			expect(await musicoinToken.balanceOf(ppp1.address)).to.equal(1000);
			expect(addr1Balance).to.equal(await musicoinToken.balanceOf(addr1.address));
	        //contributors = [addr2.address, owner.address];
    	    //share = [3, 5];
			expect(addr2Balance).to.equal(await musicoinToken.balanceOf(addr2.address));
			expect(ownerBalance).to.equal(await musicoinToken.balanceOf(owner.address));

			expect(ppp1.getContributorsLength()).to.be.reverted;
	    });   

	});
        
        
        
});

