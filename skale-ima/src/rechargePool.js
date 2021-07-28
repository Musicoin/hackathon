const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;

export function rechargePool() {
  let rinkebyABIs = require("./contracts/rinkeby_ABIs.json");
  let privateKey = new Buffer(
      process.env.REACT_APP_INSECURE_PRIVATE_KEY,
      "hex"
  );
  let accountForMainnet = process.env.REACT_APP_INSECURE_ACCOUNT;

  let rinkeby = process.env.REACT_APP_INSECURE_RINKEBY;
  let schainName = process.env.REACT_APP_INSECURE_CHAIN_NAME;
  let chainId = process.env.REACT_APP_INSECURE_RINKEBY_CHAIN_ID;

  const communityPoolAddress = rinkebyABIs.community_pool_address;
  const communityPoolABI = rinkebyABIs.community_pool_abi;

  const web3 = new Web3(rinkeby);

  let CommunityPool = new web3.eth.Contract(
      communityPoolABI,
      communityPoolAddress
  );

  // User needs skETH
  // before withdraw, user needs to be registered in communityPool.rechargeuserWallet and pass schain name...
  // add a value, 1 eth or 0.5 eth
  // after then can withdraw

  let registerMainnetCommunityPool = CommunityPool.methods
      .rechargeUserWallet(schainName)
      .encodeABI();

  web3.eth.getTransactionCount(accountForMainnet).then((nonce) => {
    //create raw transaction
    const rawRechargeUserWallet = {
      chainId: chainId,
      from: accountForMainnet,
      nonce: "0x" + nonce.toString(16),
      data: registerMainnetCommunityPool,
      to: communityPoolAddress,
      gas: 6500000,
      gasPrice: 1000000000,
      value: web3.utils.toHex(web3.utils.toWei("0.5", "ether"))
    };

    //sign transaction
    const txRechargeUserWallet = new Tx(rawRechargeUserWallet, {
      chain: "rinkeby",
      hardfork: "petersburg"
    });
    txRechargeUserWallet.sign(privateKey);

    //serialize transaction
    const serializedRechargeUserWallet = txRechargeUserWallet.serialize();

    //send signed transaction
    web3.eth
        .sendSignedTransaction(
            "0x" + serializedRechargeUserWallet.toString("hex")
        )
        .on("receipt", (receipt) => {
          //record receipt to console
          console.log(receipt);
        })
        .catch(console.error);
  });
}
