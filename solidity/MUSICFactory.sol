// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MUSIC_Schain.sol";
import "./Artist.sol";
import "./PayPerPlay.sol";

//ToDo: add team roles, 1 owner and a list of addresses that are allowed to send tokens on behalf of the artist contracts
//ToDo: add function to remove team roles in case we want to change which addresses have access

contract MusicFactory {
    string public constant contractVersion = "v1.20210924";

    event newArtistCreated(string info, address newArtist, address creator);
    event newPayPerPlayCreated(
        string info,
        address newPayPerPlay,
        address creator
    );

    address public owner;
    address public createdBy;
    address public musicTokenAddress;

    address[] public artistList;
    address[] public payPerPlayList; // All PPP contracts
    mapping(address => Artist) public artistMap; // All contracts for a given Artist
    mapping(address => PayPerPlay) public payPerPlayMap; // All contracts for a given PPP
    mapping(address => PayPerPlay[]) public artistPayPerPlayMap; // All PPP contracts for a given Artist

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // transferFrom payments can only be called by registered musicoin contracts
    modifier onlyMusicoinContracts() {
        require(
            (msg.sender == owner) ||
                (address(artistMap[msg.sender]) != address(0)) ||
                (address(payPerPlayMap[msg.sender]) != address(0)),
            "Caller is not the owner nor a Musicoin created contract"
        );
        _;
    }

    constructor(address _musicTokenAddress) {
        owner = msg.sender;
        createdBy = msg.sender;
        musicTokenAddress = _musicTokenAddress;
    }

    function kill() public onlyOwner {
        // This will not kill all the contracts the factory created.  That will have to be done manually via the Artist and PayPerPlay contracts
        // Artist and PayPerPlay contracts can be updated by owner to new MusicFactory contracts
        selfdestruct(payable(owner));
    }

    function setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

    function getMusicToken() public view returns (Music) {
        return Music(musicTokenAddress);
    }

    function setMusicTokenAddress(address _musicTokenAddress) public onlyOwner {
        musicTokenAddress = _musicTokenAddress;
    }

    function transferFrom(
        address src,
        address dst,
        uint256 rawAmount
    ) external payable onlyMusicoinContracts returns (bool) {
        return getMusicToken().transferFrom(src, dst, rawAmount);
    }

    // Does this need to be onlyOwner?
    function createArtist(
        address _owner,
        string memory _artistName,
        string memory _imageUrl,
        string memory _descriptionUrl,
        string memory _socialUrl
    ) public {
        Artist newArtist = new Artist(
        //ToDo: owner should be set to this contract
            _owner,
            _artistName,
            _imageUrl,
            _descriptionUrl,
            _socialUrl,
            msg.sender
        );
        artistList.push(address(newArtist));
        artistMap[address(newArtist)] = newArtist;
        emit newArtistCreated(
            "A new Artist contract has been added",
            address(newArtist),
            msg.sender
        );
    }

    function getArtistList() public view returns (address[] memory) {
        return artistList;
    }

    function getPayPerPlayList() public view returns (address[] memory) {
        return payPerPlayList;
    }

    // Does this need to be onlyOwner?
    function createPayPerPlay(
        address payable _owner,
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
    ) public {
        PayPerPlay newPPP = new PayPerPlay(
        //ToDo: owner should be set to this contract
            _owner,
            _title,
            _artistName,
            _artistProfileAddress,
            _musicPerPlay,
            _resourceUrl,
            _contentType,
            _imageUrl,
            _metadataUrl,
            _contributors,
            _contributorShares
        );
        payPerPlayList.push(address(newPPP));
        payPerPlayMap[address(newPPP)] = newPPP;
        artistPayPerPlayMap[_artistProfileAddress].push(newPPP);
        emit newPayPerPlayCreated(
            "A new PayPerPlay contract has been added",
            address(newPPP),
            msg.sender
        );
    }
}
