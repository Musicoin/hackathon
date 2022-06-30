// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MUSICFactory.sol";
import "./MUSIC_Schain.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Artist is AccessControl {
    MusicFactory public musicFactory;

    string public constant contractVersion = "v1.20220624"; // Updated for including Zepplin Roles
    // string public constant contractVersion = "v1.20210924";  // First major release on Skale
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant WALLET_ADMIN_ROLE = keccak256("WALLET_ADMIN_ROLE");

    address public owner;
    address public createdBy;

    string public artistName;

    string public imageUrl;
    string public descriptionUrl;
    string public socialUrl;

    uint256 public tipCount = 0;
    uint256 public tipTotal = 0;
    mapping(address => bool) public following;
    uint256 public followers = 0;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not the owner/admin");
        _;
    }
    modifier walletAdminOnly() {
        require(hasRole(WALLET_ADMIN_ROLE, msg.sender), "Caller is not the wallet admin");
        _;
    }

    /**
     * Constructor for the Artist contract.
     * Assumes validation logic for artist details is managed by the Music player application.
     * Address objects will fail by the EVM if not valid.
     * Assumes / requires that this is created using the MusicoinFactory only
     */
    constructor(
        address _owner,
        string memory _artistName,
        string memory _imageUrl,
        string memory _descriptionUrl,
        string memory _socialUrl,
        address _createdBy
    ) {
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
        // 202206 Admin role setup
        _setupRole(ADMIN_ROLE, msg.sender);
        owner = _owner;
        grantRole(ADMIN_ROLE, owner);
        createdBy = _createdBy;

        musicFactory = MusicFactory(msg.sender);
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

    function kill() public onlyOwner {
        payOutBalance(payable(owner));
        selfdestruct(payable(owner));
    }

    event tipping(address tipper, address benefactor, uint256 tip);

    function tip(uint256 _tipAmount) public payable {
        tipCount++;
        tipTotal += _tipAmount;
        // User will have to have made an approved allowance with the MusicFactory contract for tipping to work
        require(musicFactory.transferFrom(msg.sender, owner, _tipAmount));
        emit tipping(msg.sender, owner, _tipAmount);
    }

    function follow() public {
        if (!following[msg.sender]) {
            following[msg.sender] = true;
            followers++;
        }
    }

    function unfollow() public {
        if (following[msg.sender]) {
            following[msg.sender] = false;
            followers--;
        }
    }

    function payOut(address payable recipient, uint256 amount)
        public
        walletAdminOnly
    {
        // updated to send $MUSIC instead of ETH
        //require(recipient.send(amount), "payout failed");
        require(
            musicFactory.getMusicToken().transfer(recipient, amount),
            "payout failed"
        ); //rw why is this sent to the recipient and not the forwardingAddress?
    }

    function payOutBalance(address payable recipient) public walletAdminOnly {
        // updated to send the $MUSIC balance to the recipient from this contract (owner)
        require(
            musicFactory.getMusicToken().transfer(
                recipient,
                musicFactory.getMusicToken().balanceOf(address(this))
            ),
            "payout failed"
        );
    }

    function updateDetails(
        string memory _artistName,
        string memory _imageUrl,
        string memory _descriptionUrl,
        string memory _socialUrl
    ) public onlyOwner {
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
    }

    function setOwner(address _owner) public onlyOwner {
        address oldOwner = owner;
        owner = _owner;
        grantRole(ADMIN_ROLE, _owner);
        // 202206 If there should only be one user type owner then remove the old one.  This does not remove the Musicoin owner that was added in construction
        revokeRole(ADMIN_ROLE, oldOwner);
    }

    function updateMusicFactory(MusicFactory _musicFactory) public onlyOwner {
        musicFactory = _musicFactory;
    }

    function getMusicFactoryAddress() public view returns (MusicFactory) {
        return musicFactory;
    }

    function setArtistName(string memory _artistName) public onlyOwner {
        artistName = _artistName;
    }

    function setImageUrl(string memory _imageUrl) public onlyOwner {
        imageUrl = _imageUrl;
    }

    function setDescriptionUrl(string memory _descriptionUrl) public onlyOwner {
        descriptionUrl = _descriptionUrl;
    }

    function setSocialUrl(string memory _socialUrl) public onlyOwner {
        socialUrl = _socialUrl;
    }
}
