const { expect, assert } = require('chai');
const { ethers } = require("hardhat");




//                    //
//  MUSIC_Schain.sol  //
//                    //

describe("MUSIC_Schain.sol", function () {
    let MusicoinToken;
    let _owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        MusicoinContract = await ethers.getContractFactory("Music");
        [_owner, addr1, addr2] = await ethers.getSigners();

        MusicoinToken = await MusicoinContract.deploy(_owner.address);
    });

    describe("Deployment", async function () {

        it("should deploy Musicoin Token", async function () {
            expect(await MusicoinToken.symbol()).to.equal("MUSIC");
        });

        it("should show that the Initial totalSupply of Tokens is 0 on deployment", async function () {
            const x = 10000000
            expect(await MusicoinToken.totalSupply()).to.equal(x);
        });

        // there should be a better way of checking the owner of Musicoin besides token balance
        it("should show the owner/deployer? of the token", async function () {
            const balance = await MusicoinToken.balanceOf(_owner.address);
            assert.equal(balance, 10000000);
        });

    });

    describe("MUSIC_Schain basic functions", function () {

        it("should transfer 20 tokens to addr1", async function () {
            MusicoinToken.transfer(addr1.address, 20);
            const balance = await MusicoinToken.balanceOf(addr1.address);
            expect(balance).to.equal(20)
        });

        it("should transfer 10 tokens from addr1 to addr2", async function () {
            MusicoinToken.transfer(addr1.address, 20);
            MusicoinToken.connect(addr1).transfer(addr2.address, 10);
            const balance = await MusicoinToken.balanceOf(addr2.address);
            expect(balance).to.equal(10)
            assert.equal(await MusicoinToken.balanceOf(addr1.address), 10)
        });


    });
});




//                    //
//     Artist.sol     //
//                    //

describe("Artist.sol", function () {
    let MusicoinToken;
    let Artist;
    let _owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        ArtistContract = await ethers.getContractFactory("Artist"); 
        MusicoinContract = await ethers.getContractFactory("Music");
        [_owner, addr1, addr2] = await ethers.getSigners();

        MusicoinToken = await MusicoinContract.deploy(_owner.address);
        Artist = await ArtistContract.deploy(addr1.address, "Artist", "IMG", "DESC", "Social"); //Create Artist contract instances
        await MusicoinToken.transfer(addr1.address, 100);
        await MusicoinToken.transfer(addr2.address, 100);

        // await MusicoinToken.connect(addr1).approve(Artist.address, 100);
        await MusicoinToken.connect(addr2).approve(Artist.address, 100);
        // await MusicoinToken.connect(_owner).approve(Artist.address, 100);
    });

    describe("Deployment",async function () {

        // Create with the owner the same account as the msg sender (A)
        it("should deploy artist to the correct owner", async function () {
            expect(await Artist.owner()).to.equal(addr1.address);
            // console.log(MusicoinToken.address);
            expect(await MusicoinToken.balanceOf(addr1.address), 20)
        });

        it("should give artist contract 100 spending allowance", async function () {
            const allowance = await MusicoinToken.allowance(addr1.address, Artist.address);
            assert.equal(allowance, 100);
        });

        it("transfer test", async function () {
            const total = await MusicoinToken.balanceOf(addr1.address);
            assert.equal(total, 100);
        })

        // Check the values in each field to be the same as you set using the get functions. Also,
        //      createdBy should be the msg.sender;
        //      forwardingAddress should be 0x0
        //      musicToken should be the expected token address 

        // Create with the owner different from the msg sender (B)

        // Check the values in each field to be the same as you set using the get functions. Also,
        //      createdBy should be the msg.sender but owner is what you sent;

    });
    

    describe("Artist.sol Basic Tests", async function () {

        // Using (A) and sending requests from the contract owner account, 
        // update the variables using the set functions and check their values 
        // with the get functions right after
        //      - setForwardingAddress
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
        //      - setForwardingAddress
        //      - setArtistName
        //      - setImageUrl
        //      - setDescriptionUrl
        //      - setSocialUrl
        //      - updateDetails
        //      - setOwner

    });

    describe("Artist.sol Interactive Tests", async function () {

        describe("Testing FOLLOWING functions", async function () {

            // FOLLOWING using contract (A):
            // await Artist.follow();
            it("should follow", async function () {
                await Artist.connect(_owner).follow()
                const follower = await Artist.followers();
                assert.equal(follower, 1);
            });
            

            // Inspect "following".  It should be empty (can this be checked without hash indexes?)

            // Call follow().  The caller should now be true in the "following" array

            // Call unfollow().  The caller should be false in the "following" array

            // Change accounts.  Call follow().  The caller should now be true in the "following" array.  The previous account should still be false
        });
        
        describe("Testing recieve()", async function () {

            // Call removeForwardingAddress.  The forwardingAddress should be 0x0

            // Call the Artist object without any function named.  Send ETH with the call.
            //      The contract should have a balance matching what was sent

            // Call setForwardingAddress and make it a known account

            // Call the Artist object without any function named.  Send ETH with the call.
            //      - The account you set should have received a balance matching what was sent. The 
            //        Artist balance should be the same as before making the call
            //          - This would have been an issue before moving to Skale, but probably not 
            //            important now if we lose ethSKL, just messy.  Should all balances be sent as soon as a forwarding address is set? Ben Gyles


        });

        describe("Testing TIPPING function", async function () {
            // Use an account that is NOT the owner
            //      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
            it("should tip the artist 2 Musicoin", async function () {
                console.log('approvedd');
                await Artist.connect(addr2).tip(2);
                expect(await Artist.tipTotal()).to.equal(2);
            })
            //      - Owner's $MUSIC balance should be increased by $MUSIC requested to send
            //      - TipTotal and TipCount should be incremented accordingly
            //      - Event should be emitted with the correct information

            // Use an account that is the owner
            //      - Send tip.  Owner account balance should be unchanged
            //      - TipTotal and TipCount should be incremented accordingly.  Should sending tips from the owner be prevented to stop someone from hacking the tip statistics? Ben Gyles
            //      - Event should be emitted with the correct information

            // Use an account that is the owner
            //      - Send tip that is more than the $MUSIC owned.  Send should fail
            //      - NO event should be emitted
        });

        
        // PAYOUT (TBD.  Currently there are no funds collected for payout using this contract)
    });
});




//                    //
//   PayPerPlay.sol   //
//                    //

describe("PayPerPlay.sol", function () {
    let PayPerPlayContract;
    let MusicoinToken;
    let _owner;
    let addr1;
    let addr2;
  
    // beforeEach(async function () {
    //   //+-Get the ContractFactory and Signers here:_
    //   ArtistContract = await ethers.getContractFactory("Artist");
    //   PayPerPlayContract = await ethers.getContractFactory("PayPerPlay");
    //   MusicoinContract = await ethers.getContractFactory("Music");
    //   [_owner, addr1, addr2] = await ethers.getSigners();

    //   MusicoinToken = await MusicoinContract.deploy(_owner.address);
    //   Artist = await ArtistContract.deploy(_owner.address, "Artist", "IMG", "DESC", "SOCIAL");
    //   PayPerPlay = await PayPerPlayContract.deploy(
    //       _owner.address,
    //       "PPP Contract",
    //       "Artist",
    //       addr1.address,
    //       1,
    //       "URL",
    //       ethers.utils.formatBytes32String("Content"),
    //       "IMG",
    //       "metadata",
    //       [addr1.address], // asks for array, then displays : Error: invalid arrayify value
    //       [1] // out of 100 or 1?
    //       );
    // });
    // describe("Deployment", function () {

    //     it("should deploy PPP Contract to the right owner", async function () {
    //         const curOwner = await PayPerPlay.owner()
    //         expect(curOwner).to.equal(_owner.address)
    //     });
    // });
    
    describe("PayPerPlay.sol Basic Tests", async function () {
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


    });

    describe("PayPerPlay.sol Interactive Tests", async function () {
        // Use the 1st Contract (“PPP-1”).  It should have been setup with 3 contributors and 1 owner.

        // Use a wallet that is not one of the contributors or owners and has $MUSIC in the wallet.
        
        // Test Play functions
        // - Call play()
        //      - Play event should be emitted
        //      - Caller’s wallet should be reduced by 1 $MUSIC (1 is 10^18)
        //      - Owner’s wallet balance should not change
        //      - All Contributors' wallet balances should go up according to their ratios
        //      - totalEarned should be incremented by 1 $MUSIC (1 is 10^18)
        //      - playCount should go up by 1
        //
        // - Call play(integer) using 5 $MUSIC (1 is 10^18)
        //      - Play event should be emitted
        //      - The results should be the same as above with only 1 $MUSIC being used for payments
        // - Call play(integer) using more $MUSIC than is in the callers wallet. This should fail
        
        // TIPPING
        // - Use an account that is not the owner or a contributor
        //      - Sender's $MUSIC balance should be reduced by $MUSIC requested to send
        //      - Owner’s wallet balance should not change
        //      - All Contributors' wallet balances should go up according to their ratios
        //      - totalTipped and totalEarned should be incremented accordingly
        //      - Event should be emitted with the correct information
        
        // DISTRIBUTE BALANCE (TBD. Currently there are no funds collected for payout using this contract)
    });
});
