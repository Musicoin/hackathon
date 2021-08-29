// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MUSICFactory.sol";
import "./MUSIC_Schain.sol";

contract Artist {
    MusicFactory public musicFactory;

    string public contractVersion = "v0.3"; //rw what version does this now need to be?
    
    address public owner;
   	address public createdBy;
 
   	string public artistName;

  	string public imageUrl;
   	string public descriptionUrl;
   	string public socialUrl;

    uint public tipCount = 0;
    uint public tipTotal = 0;
    mapping(address => bool) public following;
    uint public followers = 0;

    modifier onlyOwner {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    /**
     * Constructor for the Artist contract.
     * Assumes validation logic for artist details is managed by the Music player application.
     * Address objects will fail by the EVM if not valid.
     * Assumes / requires that this is created using the MusicoinFactory only
     */
    constructor (address _owner, string memory _artistName, string memory _imageUrl, string memory _descriptionUrl, string memory _socialUrl, address _createdBy) {
		artistName = _artistName;
		imageUrl = _imageUrl;
		descriptionUrl = _descriptionUrl;
		socialUrl = _socialUrl;
        owner = _owner;
        createdBy = _createdBy;

        musicFactory = MusicFactory(msg.sender);
    }

    function kill() public onlyOwner {
        payOutBalance(payable(owner));
        selfdestruct(payable(owner));
    }

    event tipping(address tipper, address benefactor, uint tip);
    
    function tip(uint _tipAmount) public payable {
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

    function payOut(address payable recipient, uint amount) public onlyOwner {
        // updated to send $MUSIC instead of ETH
        //require(recipient.send(amount), "payout failed"); 
        require(musicFactory.getMusicToken().transfer(recipient, amount), "payout failed"); //rw why is this sent to the recipient and not the forwardingAddress?
    }

    function payOutBalance(address payable recipient) public onlyOwner {
        // updated to send the $MUSIC balance to the recipient from this contract (owner)
        require(musicFactory.getMusicToken().transfer(recipient, musicFactory.getMusicToken().balanceOf(address(this))), "payout failed"); 
    }

    function updateDetails (string memory _artistName, string memory _imageUrl, string memory _descriptionUrl, string memory _socialUrl) public onlyOwner {
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
    }

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
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
