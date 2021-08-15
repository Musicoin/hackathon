require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */


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
      chainId: 2067916454627834,
      accounts: ["PUT 5 TEST ACCOUNT PRIVATE KEYS HERE.  THEY NEED TO BE HOLDING skETH"],
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

IMA Rinkeby ABI
https://raw.githubusercontent.com/skalenetwork/skale-network/master/releases/dappnet-v2/IMA/1.0.0/abi.json

IMA SChain ABI
https://github.com/skalenetwork/skale-network/blob/master/releases/dappnet-v2/IMA/1.0.0/proxySchain.json

Supporting IMA Documentation

https://skale.network/docs/developers/products/interchain-messaging-agent/transferring-eth
https://skale.network/docs/developers/products/interchain-messaging-agent/managing-erc20
https://skale.network/docs/developers/products/interchain-messaging-agent/managing-erc721
https://skale.network/docs/developers/products/interchain-messaging-agent/managing-erc1155

*/
