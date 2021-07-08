pragma solidity ^0.8.0;

import "./MUSIC_Schain.sol";

abstract contract MUSICWrapper {

    function getMusicToken() internal pure returns (Music) {
        return Music(address(0x4dB78c15576cA56edEBeB8A582E637131c160f7F));
    }
}
