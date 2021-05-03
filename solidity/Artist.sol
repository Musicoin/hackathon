// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MUSIC_Schain.sol";

contract Artist {
    Music private musicToken;

    string public contractVersion = "v0.3"; //rw what version does this now need to be?
    address public owner;
    address public createdBy;
    address payable public forwardingAddress;   
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

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Test", "Test", "Test", "test"
    constructor (
        address _owner,
        string memory _artistName,
        string memory _imageUrl,
        string memory _descriptionUrl,
        string memory _socialUrl) {
        owner = _owner;
        createdBy = msg.sender;
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
        forwardingAddress = payable(address(0));
    }

    receive () external payable {
        // accept payments
        //rw: This accepts ETH payments.  The tip function receives $MUSIC so the payouts need to handle both tokens
        if (forwardingAddress != address(0)) {
            if (!forwardingAddress.send(msg.value)) {
                // ok, just hold onto it in this contract
            }
        }
    }

    function tip(uint _tipAmount) public payable {
        tipCount++;
        tipTotal += _tipAmount;
        //tipTotal += msg.value;  //rw removed. The tip will now be in $MUSIC, not ETH.
        //rw this does not collect any ETH sent with the msg.value object.  Assuming that will not happen from the UI/PlayerApp
        //rw transferFrom will check the sender's wallet has enough $MUSIC to tip and then sends it to the owner of this contract
        require(musicToken.transferFrom(msg.sender, owner, _tipAmount)); //rw why is this sent to the owner and not the forwardingAddress?
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
        //rw updated to send $MUSIC instead of ETH
        //require(recipient.send(amount), "payout failed"); 
        require(musicToken.transfer(recipient, amount), "payout failed"); //rw why is this sent to the recipient and not the forwardingAddress?
    }

    function payOutBalance(address payable recipient) public onlyOwner {
        //rw Although should only be using $MUSIC, the fallback receive function accepts ETH, so this pay out function will return the total balance of both ETH and $MUSIC
        require (recipient.send(address(this).balance), "payout balance failed");
        //rw updated to send the $MUSIC balance to the recipient from this contract (owner) as well
        require(musicToken.transfer(recipient, musicToken.balanceOf(owner)), "payout failed"); //rw why is this sent to the recipient and not the forwardingAddress?
    }

    function updateDetails (
        string memory _artistName,
        string memory _imageUrl,
        string memory _descriptionUrl,
        string memory _socialUrl) public onlyOwner {
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
    }

    function removeForwardingAddress() public onlyOwner {
        forwardingAddress = payable(address(0));
    }

    function setForwardingAddress(address payable _forwardingAddress) public onlyOwner {
        forwardingAddress = _forwardingAddress;
    }

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
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
