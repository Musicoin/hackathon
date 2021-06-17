/*
 * This hardhat script will deploy your smart contracts to your SKALE Chain.
 *
 *  @param {String} privateKey - Provide your wallet private key.
 *  @param {String} provider - Provide your SKALE endpoint address.
 */
// import { HardhatUserConfig } from "hardhat/config";
// import "@nomiclabs/hardhat-web3";
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

//https://skale.network/developers/ for SKALE documentation
let privateKey =  process.env.PRIVATE_KEY;

//Provide your SKALE endpoint address
let skale = process.env.SKALE_ENDPOINT

module.exports = {
  defaultNetwork: "skale",
  solidity: {
    version: '0.4.22',
    settings: {
      optimizer:{
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    skale: {
        url: skale,
        accounts: [privateKey],
        gasPrice: 30000
    },
    local: {
      url : "http://127.0.0.1:1234",
      accounts: ["0x16db936de7342b075849d74a66460007772fab88cf4ab509a3487f23398823d6"],
      gasPrice: 30000
    }
  }
}