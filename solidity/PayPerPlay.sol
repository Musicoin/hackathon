// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./MUSIC_Schain.sol";
import "./MUSICWrapper.sol";

contract PayPerPlay is MUSICWrapper {
    string public constant contractVersion = "v0.7"; 

    Music private musicToken;

    address public owner;
    address public createdBy;
    string public title;
    string public artistName;
    address public artistProfileAddress;
    string public resourceUrl; // e.g. ipfs://<hash>
    bytes32 public contentType; 
    string public metadataUrl;
    string public imageUrl;

    // license information
    uint public musicPerPlay;

    // proportional payments (dependent on musicPerPlay or tip size)
    address[] public contributors;
    uint[] public contributorShares;
    uint public totalShares;

    // book keeping
    uint public playCount;
    uint public totalEarned;
    uint public tipCount;
    uint public totalTipped;
    uint public licenseVersion;
    uint public metadataVersion;
    uint distributionGasEstimate;

    // events
    event playEvent(uint plays);
    event tipEvent(uint plays, uint tipCount);
    event licenseUpdateEvent(uint version);
    event transferEvent(address oldOwner, address newOwner);
    event resourceUpdateEvent(string oldResource, string newResource);
    event titleUpdateEvent(string oldTitle, string newTitle);
    event artistNameUpdateEvent(string oldArtistName, string newArtistName);
    event imageUpdateEvent(string oldImage, string newImage);
    event metadataUpdateEvent(string oldMetadata, string newMetadata);
    event artistProfileAddressUpdateEvent(address oldArtistAddress, address newArtistAddress);

    // event paymentDistributionEvent(uint amount);
    // event gasDistributionEvent(uint gas);

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Title", "Arist", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 1000000, "ipfs://resourceQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "audio/mp3", "ipfs://imagefbFQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "ipfs://metadataQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", ["0x11111", "0x22222", "0x33333"], [1, 1, 1]
    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Title", "Arist", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 1000000, "ipfs://resourceQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "audio/mp3", "ipfs://imagefbFQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "ipfs://metadataQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", ["0xef55bfac4228981e850936aaf042951f7b146e41", "0x11111", "0x22222", "0x33333"], [1, 1, 1, 1]
    constructor (
            address _owner,
            string memory _title,
            string memory _artistName,
            address _artistProfileAddress,
            uint _musicPerPlay,
            string memory _resourceUrl,
            bytes32 _contentType, 
            string memory _imageUrl,
            string memory _metadataUrl,
            address[] memory _contributors,
            uint[] memory _contributorShares) {
        title = _title;
        artistName = _artistName;
        contentType = _contentType;
        artistProfileAddress = _artistProfileAddress;

        createdBy = msg.sender;
        resourceUrl = _resourceUrl;
        metadataUrl = _metadataUrl;
        imageUrl = _imageUrl;

        // allow creator to call this function once during initialization
        owner = msg.sender;
        updateLicense(_musicPerPlay,
            _contributors, _contributorShares);

        // now set the real owner
        owner = _owner;
        musicToken = getMusicToken();
   }

    modifier adminOnly {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    function tip(uint _tipAmount) public payable {
        //2021-05 This will now be $MUSIC in _tipAmount not msg.value
        distributePayment(_tipAmount);

        tipCount++;
        totalTipped += _tipAmount;
        totalEarned += _tipAmount;
    }

    function getContributorsLength() public view returns(uint) {
        return contributors.length;
    }
    
    function play(uint _pppAmount) public payable {
        //2021-05 This will now be $MUSIC in _pppAmount not msg.value.  
        //2021-05 This function could work without any variables passed as it was previously designed to work with ETH but then the end user has no control/protection from being overcharged by a high ppp fee.  
        require(_pppAmount >= musicPerPlay, "Insufficient funds sent for playing");
        play();
    }
    
    function play() public payable {
        //2021-05 This will now be $MUSIC not ETH  
        //2021-05 requiring _pppAmount changes the function signature and potentially breaks any connecting apps so this one is retained but unsafe for users playing malicious tracks as they have no control over how much $MUSIC they are sending now (depending on who controls setting the PPP amounts)
        require(musicToken.balanceOf(msg.sender) >= musicPerPlay, "Insufficient funds in account");

        //2021-05 only use the required musicPerPlay amount and not what was sent in _pppAmount in case it was more than musicPerPlay
        distributePayment(musicPerPlay);

        totalEarned += musicPerPlay;
        playCount++;

        emit playEvent(playCount);
    }

    /*** Admin functions ***/

    function transferOwnership(address newOwner) public adminOnly {
        address oldOwner = owner;
        owner = newOwner;
        emit transferEvent(oldOwner, newOwner);
    }

    function updateTitle(string memory newTitle) public adminOnly {
        string memory oldTitle = newTitle;
        title = newTitle;
        emit titleUpdateEvent(oldTitle, newTitle);
    }

    function updateArtistName(string memory newArtistName) public adminOnly {
        string memory oldArtistName = newArtistName;
        artistName = newArtistName;
        emit artistNameUpdateEvent(oldArtistName, newArtistName);
    }

    function updateResourceUrl(string memory newResourceUrl) public adminOnly {
        string memory oldResourceUrl = resourceUrl;
        resourceUrl = newResourceUrl;
        emit resourceUpdateEvent(oldResourceUrl, newResourceUrl);
    }

    function updateImageUrl(string memory newImageUrl) public adminOnly {
        string memory oldImageUrl = imageUrl;
        imageUrl = newImageUrl;
        emit imageUpdateEvent(oldImageUrl, newImageUrl);
    }

    function updateArtistAddress(address newArtistAddress) public adminOnly {
        address oldArtistAddress = artistProfileAddress;
        artistProfileAddress = newArtistAddress;
        emit artistProfileAddressUpdateEvent(oldArtistAddress, newArtistAddress);
    }

    function updateMetadataUrl(string memory newMetadataUrl) public adminOnly {
        string memory oldMetadataUrl = metadataUrl;
        metadataUrl = newMetadataUrl;
        metadataVersion++;
        emit metadataUpdateEvent(oldMetadataUrl, newMetadataUrl);
    }

    /*
     * Updates share allocations.  All old allocations are over written
     * 2021-05 This allows the owner/admin to change the PPP rate in _musicPerPlay.  If the owner is not Musicoin or PPP is not a lookup for an Oracle then the artist can set their own rates.
     */
    function updateLicense(uint _musicPerPlay,
        address[] memory _contributors, uint[] memory _contributorShares) public adminOnly {

        require (_contributors.length == _contributorShares.length, 'The # of contributors does not match the # of contributor shares.');
        musicPerPlay = _musicPerPlay;
        contributors = _contributors;
        contributorShares = _contributorShares;
        totalShares = 0;

        for (uint c=0; c < contributors.length; c++) {
            totalShares += contributorShares[c];
        }

        // sanity checks

        // watch out for division by 0 if totalShares == 0
        require(!(totalShares == 0 && contributors.length > 0), "Total shares must be more than 0");

        licenseVersion++;
        emit licenseUpdateEvent(licenseVersion);
    }

    function distributeBalance() public adminOnly {
        distributePayment(musicToken.balanceOf(address(this))); //rw updated to use $MUSIC balance of this contract address instead of ETH address(this).balance
    }

    function kill(bool _distributeBalanceFirst) public adminOnly {
        if (_distributeBalanceFirst) {
            distributeBalance(); // is there any risk here?
        }
        selfdestruct(payable(owner));
    }

    /*** internal ***/
    bool private distributionReentryLock;
    modifier withDistributionLock {
        require (!distributionReentryLock, "Re-entry is locked") ;
        distributionReentryLock = true;
        _;
        distributionReentryLock = false;
    }

    function distributePayment(uint _total) withDistributionLock internal {
        for (uint c=0; c < contributors.length; c++) {
            distributePaymentTo(_total, c);
        }
    }

    function distributePaymentTo(uint _total, uint cIdx) internal {
        uint amount = uint((contributorShares[cIdx] * _total) / totalShares);

        if (amount > 0) {
            require(musicToken.transferFrom(msg.sender, contributors[cIdx], amount));
        }
    }
}
