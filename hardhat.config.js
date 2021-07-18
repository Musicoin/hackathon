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
  defaultNetwork: "hardhat",
  solidity: "0.8.0",
  networks: {
    // hardhat: {
    //   forking: {
    //     url: "https://dappnet-node0.skalenodes.com:10008"
    //   }
    // }
    skale: {
      url: "https://dappnet-node0.skalenodes.com:10008",
      accounts: ["0x4030a6fdc8e57b944eed1f4c3c99897c13948d0fd63a3324ed09bfe19c2d28c2"],
      gasPrice: 0,
    }
  }
};