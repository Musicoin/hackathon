// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Artist {
    string public contractVersion = "v0.3";
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
        if (forwardingAddress != address(0)) {
            if (!forwardingAddress.send(msg.value)) {
                // ok, just hold onto it in this contract
            }
        }
    }

    function tip() public payable {
        tipCount++;
        tipTotal += msg.value;
        require(msg.sender == owner, "Caller is not owner");
        //rw why is this check done last instead of using the modifier?
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
        require(recipient.send(amount), "payout failed"); 
    }

    function payOutBalance(address payable recipient) public onlyOwner {
        require (recipient.send(address(this).balance), "payout balance failed");
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

    function testReturn () public pure returns (uint) {
        return 123456;
    }
}
