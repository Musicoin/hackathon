pragma solidity ^0.8.0;

import "./MUSIC_Schain.sol";

abstract contract MUSICWrapper {

    function getMusicToken() internal pure returns (Music) {
        return Music(address(0x4F997866FD8Bc7F63cbAEA24c4Cdf89B13994780));
    }
}
