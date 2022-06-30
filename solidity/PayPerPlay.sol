// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./MUSIC_Schain.sol";
import "./MUSICFactory.sol";
import "./utils/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PayPerPlay is AccessControl {
    using SafeMath for uint256;

    string public constant contractVersion = "v1.20220624"; // Updated for including Zepplin Roles
    // string public constant contractVersion = "v1.20210924";  // First major release on Skale

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant WALLET_ADMIN_ROLE = keccak256("WALLET_ADMIN_ROLE");

    MusicFactory public musicFactory;
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
    uint256 public musicPerPlay;

    // proportional payments (dependent on musicPerPlay or tip size)
    address[] public contributors;
    uint256[] public contributorShares;
    uint256 public totalShares;

    // book keeping
    uint256 public playCount;
    uint256 public totalEarned;
    uint256 public tipCount;
    uint256 public totalTipped;
    uint256 public licenseVersion;
    uint256 public metadataVersion;

    // events
    event playEvent(uint256 plays);
    event tipEvent(uint256 plays, uint256 tipCount);
    event licenseUpdateEvent(uint256 version);
    event transferEvent(address oldOwner, address newOwner);
    event grantWalletAdminEvent(address walletAdmin);
    event revokeWalletAdminEvent(address walletAdmin);
    event resourceUpdateEvent(string oldResource, string newResource);
    event titleUpdateEvent(string oldTitle, string newTitle);
    event artistNameUpdateEvent(string oldArtistName, string newArtistName);
    event imageUpdateEvent(string oldImage, string newImage);
    event metadataUpdateEvent(string oldMetadata, string newMetadata);
    event artistProfileAddressUpdateEvent(
        address oldArtistAddress,
        address newArtistAddress
    );

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Title", "Arist", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 1000000, "ipfs://resourceQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "audio/mp3", "ipfs://imagefbFQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "ipfs://metadataQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", ["0xef55bfac4228981e850936aaf042951f7b146e41", "0x11111", "0x22222", "0x33333"], [1, 1, 1, 1]
    // Assumes / requires that this is created using the MusicoinFactory only
    constructor(
        address _owner,
        string memory _title,
        string memory _artistName,
        address _artistProfileAddress,
        uint256 _musicPerPlay,
        string memory _resourceUrl,
        bytes32 _contentType,
        string memory _imageUrl,
        string memory _metadataUrl,
        address[] memory _contributors,
        uint256[] memory _contributorShares
    ) {
        title = _title;
        artistName = _artistName;
        contentType = _contentType;
        artistProfileAddress = _artistProfileAddress;

        createdBy = msg.sender;
        resourceUrl = _resourceUrl;
        metadataUrl = _metadataUrl;
        imageUrl = _imageUrl;

        // Update licenses as the msg.sender / creator of this contract before transfering ownership to the "owner" address
        _setupRole(ADMIN_ROLE, msg.sender);
 
        updateLicense(_musicPerPlay, _contributors, _contributorShares);

        // setting the real owner needs to be called separately now. The constructor has too many parameters.  Assuming it is the _createdBy address.
        owner = _owner;
        // 202206 Adding role based security for owner
        grantRole(ADMIN_ROLE, owner);
        musicFactory = MusicFactory(msg.sender);
    }

    modifier adminOnly() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not the admin");
        _;
    }

    modifier walletAdminOnly() {
        require(hasRole(WALLET_ADMIN_ROLE, msg.sender), "Caller is not the wallet admin");
        _;
    }

    function tip(uint256 _tipAmount) public payable {
        //2021-05 This will now be $MUSIC in _tipAmount not msg.value
        distributePayment(_tipAmount, msg.sender);

        tipCount++;
        totalTipped += _tipAmount;
    }

    function getContributorsLength() public view returns (uint256) {
        return contributors.length;
    }

    function play() public payable {
        //2021-05 This will now be $MUSIC in _pppAmount not msg.value.
        require(
            musicFactory.getMusicToken().balanceOf(msg.sender) >= musicPerPlay,
            "Insufficient funds"
        );

        //2021-05 only use the required musicPerPlay amount and not what was sent in _pppAmount in case it was more than musicPerPlay
        distributePayment(musicPerPlay, msg.sender);
        playCount++;
        emit playEvent(playCount);
    }

    /*** Admin functions ***/
    // 202206 This still retains the original creator as the Admin in the roles and only changes the user owner
    function transferOwnership(address newOwner) public adminOnly {
        address oldOwner = owner;
        owner = newOwner;
        // Added 202206
        grantRole(ADMIN_ROLE, newOwner);
        renounceRole(ADMIN_ROLE, oldOwner);
        emit transferEvent(oldOwner, newOwner);
    }

    // Added 202206
    function grantWalletAdmin(address _walletAdmin) public adminOnly {
        grantRole(WALLET_ADMIN_ROLE, _walletAdmin);
        emit grantWalletAdminEvent(oldWalletAdmin, _walletAdmin);
    }
    // Added 202206
    function revokeWalletAdmin(address _walletAdmin) public adminOnly {
        revokeRole(WALLET_ADMIN_ROLE, _walletAdmin);
        emit revokeWalletAdminEvent(_walletAdmin);
    }

    function updateMusicFactory(MusicFactory _musicFactory) public adminOnly {
        musicFactory = _musicFactory;
    }

    function getMusicFactoryAddress() public view returns (MusicFactory) {
        return musicFactory;
    }

    function updateTitle(string memory newTitle) public adminOnly {
        string memory oldTitle = title;
        title = newTitle;
        emit titleUpdateEvent(oldTitle, newTitle);
    }

    function updateArtistName(string memory newArtistName) public adminOnly {
        string memory oldArtistName = artistName;
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
        emit artistProfileAddressUpdateEvent(
            oldArtistAddress,
            newArtistAddress
        );
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
    function updateLicense(
        uint256 _musicPerPlay,
        address[] memory _contributors,
        uint256[] memory _contributorShares
    ) public adminOnly {
        require(
            _contributors.length == _contributorShares.length,
            "# of contributors doesnt match the # of shares"
        );
        musicPerPlay = _musicPerPlay;
        contributors = _contributors;
        contributorShares = _contributorShares;
        totalShares = 0;

        for (uint256 c = 0; c < contributors.length; c++) {
            totalShares += contributorShares[c];
        }

        // sanity checks

        // watch out for division by 0 if totalShares == 0
        require(
            !(totalShares == 0 && contributors.length > 0),
            "Total shares must be > 0"
        );

        licenseVersion++;
        emit licenseUpdateEvent(licenseVersion);
    }

    // 202206 changed to only allow walletAdmin to work with payments
    function distributeBalance() public walletAdminOnly {
        distributePayment(
            musicFactory.getMusicToken().balanceOf(address(this)),
            address(this)
        ); //rw updated to use $MUSIC balance of this contract address instead of ETH address(this).balance
    }

    function kill(bool _distributeBalanceFirst) public adminOnly {
        if (_distributeBalanceFirst) {
            distributeBalance(); // is there any risk here?
        }

        // This will send all remaining Musicoin to the owner
        distributePaymentTo(
            musicFactory.getMusicToken().balanceOf(address(this)),
            address(this),
            owner
        );
        // This will send all remaining gas to the owner.  This does not hanndle MUSICOIN
        selfdestruct(payable(owner));
    }

    /*** internal ***/
    bool private distributionReentryLock;
    modifier withDistributionLock() {
        require(!distributionReentryLock, "Re-entry locked");
        distributionReentryLock = true;
        _;
        distributionReentryLock = false;
    }

    function distributePayment(uint256 _total, address fromAccount)
        internal
        withDistributionLock
    {
        uint256 portion = 0;
        for (uint256 c = 0; c < contributors.length; c++) {
            portion = contributorShares[c] * _total;
            distributePaymentTo(
                portion.div(totalShares),
                fromAccount,
                contributors[c]
            );
        }
    }

    function distributePaymentTo(
        uint256 amount,
        address fromAccount,
        address toAccount
    ) internal {
        // If this is a regular payment request then it must pay via the requester's funds using TransferFrom, otherwise it is being paid via this contract and uses Transfer only
        if ((amount > 0) && (fromAccount != address(this))) {
            require(musicFactory.transferFrom(fromAccount, toAccount, amount));
        } else if ((amount > 0) && (fromAccount == address(this))) {
            require(musicFactory.getMusicToken().transfer(toAccount, amount));
        }

        totalEarned += amount; // Moved here for more accurate accounting in case there is coin lost due to contribution ratio rounding down of decimals
    }
}
