require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");


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
  paths: {
    sources: "./solidity",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
    },
    skale: {
      url: process.env.SKALE_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY, "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"], // these are just hardhat test keys, they won't make you rich :)
      chainId: 0x785b4b9847b9,
      gasPrice: "auto",
      gas: 8000000,
    }
  }
};
