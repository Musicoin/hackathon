pragma solidity ^0.4.2;
contract Artist {
    string public contractVersion = "v0.3";
    address public owner;
    address public createdBy;
    address public forwardingAddress = 0x0;
    string public artistName;
    string public imageUrl;
    string public descriptionUrl;
    string public socialUrl;


    uint public tipCount = 0;
    uint public tipTotal = 0;
    mapping(address => bool) public following;
    uint public followers = 0;

    modifier onlyOwner {
        if (msg.sender != owner) throw;
        _;
    }

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Test", "Test", "Test", "test"
    function Artist(
        address _owner,
        string _artistName,
        string _imageUrl,
        string _descriptionUrl,
        string _socialUrl) {
        owner = _owner;
        createdBy = msg.sender;
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
    }

    function () payable {
        // accept payments
        if (forwardingAddress != 0x0) {
            if (!forwardingAddress.send(msg.value)) {
                // ok, just hold onto it in this contract
            }
        }
    }

    function tip() payable {
        tipCount++;
        tipTotal += msg.value;
        if (!owner.send(msg.value)) {
            throw;
        }
    }

    function follow() {
        if (!following[msg.sender]) {
            following[msg.sender] = true;
            followers++;
        }
    }

    function unfollow() {
        if (following[msg.sender]) {
            following[msg.sender] = false;
            followers--;
        }
    }

    function payOut(address recipient, uint amount) onlyOwner {
        if (!recipient.send(amount)) {
            throw;
        }
    }

    function payOutBalance(address recipient) onlyOwner {
        if (!recipient.send(this.balance)) {
            throw;
        }
    }

    function updateDetails(
        string _artistName,
        string _imageUrl,
        string _descriptionUrl,
        string _socialUrl) onlyOwner {
        artistName = _artistName;
        imageUrl = _imageUrl;
        descriptionUrl = _descriptionUrl;
        socialUrl = _socialUrl;
    }

    function removeForwardingAddress() onlyOwner {
        forwardingAddress = 0x0;
    }

    function setForwardingAddress(address _forwardingAddress) onlyOwner {
        forwardingAddress = _forwardingAddress;
    }

    function setOwner(address _owner) onlyOwner {
        owner = _owner;
    }

    function setArtistName(string _artistName) onlyOwner {
        artistName = _artistName;
    }

    function setImageUrl(string _imageUrl) onlyOwner {
        imageUrl = _imageUrl;
    }

    function setDescriptionUrl(string _descriptionUrl) onlyOwner {
        descriptionUrl = _descriptionUrl;
    }

    function setSocialUrl(string _socialUrl) onlyOwner {
        socialUrl = _socialUrl;
    }
}