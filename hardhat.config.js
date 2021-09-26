require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");

let privateKey =  process.env.PRIVATE_KEY;
let skale = process.env.SKALE_ENDPOINT


module.exports = {
  defaultNetwork: "skale",
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    hardhat: {
    },
    skale: {
      url: "https://dappnet-api.skalenodes.com/v1/elegant-ancha",
      accounts: ["PUT 5 TEST ACCOUNT PRIVATE KEYS HERE.  THEY NEED TO BE HOLDING skETH"],
      chainId: 0x758c251b409fa,
      timeout: 50000,
      gasPrice: "auto",
      gas: 8000000,
    }
  }
};

/**
SKALE TestNet
S-Chain Name
elegant-ancha

Chain ID
0x758c251b409fa
(converted to decimal: 2067916454627834)

HTTPS Load Balancer Endpoint
https://dappnet-api.skalenodes.com/v1/elegant-ancha

WebSocket Endpoints
ws://dappnet-v2-15.skalenodes.com:10066
wss://dappnet-v2-15.skalenodes.com:10071﻿
*/
