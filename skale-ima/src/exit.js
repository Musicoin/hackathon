import Web3 from "web3";
import Common from "ethereumjs-common";
const Tx = require("ethereumjs-tx").Transaction;

export function exit() {
  let schainABIs = require("./contracts/schain_ABIs.json");
  let rinkebyERC20ABI = require("./contracts/rinkeby_ERC20_ABI.json");
  let schainERC20ABI = require("./contracts/schain_ERC20_ABI.json");

  let privateKey = new Buffer(
      process.env.REACT_APP_INSECURE_PRIVATE_KEY,
      "hex"
  );
  let accountForMainnet = process.env.REACT_APP_INSECURE_ACCOUNT;
  let accountForSchain = process.env.REACT_APP_INSECURE_ACCOUNT;
  let schainEndpoint = process.env.REACT_APP_INSECURE_SKALE_CHAIN;
  let chainId = process.env.REACT_APP_INSECURE_CHAIN_ID;

  const customCommon = Common.forCustomChain(
      "mainnet",
      {
        name: "skale-network",
        chainId: chainId
      },
      "istanbul"
  );
  const tokenManagerAddress = schainABIs.token_manager_erc20_address;
  const tokenManagerABI = schainABIs.token_manager_erc20_abi;

  const erc20ABI = schainERC20ABI.erc20_abi;
  const erc20Address = schainERC20ABI.erc20_address;

  const erc20AddressOnMainnet = rinkebyERC20ABI.erc20_address;

  const web3ForSchain = new Web3(schainEndpoint);

  let tokenManager = new web3ForSchain.eth.Contract(
      tokenManagerABI,
      tokenManagerAddress
  );

  let contractERC20 = new web3ForSchain.eth.Contract(erc20ABI, erc20Address);

  /**
   * Uses the openzeppelin ERC20
   * contract function approve
   * https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20
   */
  let approve = contractERC20.methods
      .approve(
          tokenManagerAddress,
          web3ForSchain.utils.toHex(web3ForSchain.utils.toWei("1", "ether"))
      )
      .encodeABI();

  /**
   * Uses the SKALE TokenManager
   * contract function exitToMainERC20
   */
  let exit = tokenManager.methods
      .exitToMainERC20(
          erc20AddressOnMainnet,
          accountForMainnet,
          web3ForSchain.utils.toHex(web3ForSchain.utils.toWei("1", "ether"))
      )
      .encodeABI();

  web3ForSchain.eth.getTransactionCount(accountForSchain).then((nonce) => {
    //create raw transaction
    const rawTxApprove = {
      chainId: chainId,
      from: accountForSchain,
      nonce: "0x" + nonce.toString(16),
      data: approve,
      to: erc20Address,
      gasPrice: 100000000000,
      gas: 8000000
    };

    //sign transaction
    const txApprove = new Tx(rawTxApprove, { common: customCommon });
    txApprove.sign(privateKey);

    const serializedTxApprove = txApprove.serialize();

    //send signed transaction (approval)
    web3ForSchain.eth
        .sendSignedTransaction("0x" + serializedTxApprove.toString("hex"))
        .on("receipt", (receipt) => {
          console.log(receipt);
          web3ForSchain.eth
              .getTransactionCount(accountForSchain)
              .then((nonce) => {
                //create raw transaction
                const rawTxExit = {
                  chainId: chainId,
                  from: accountForSchain,
                  nonce: "0x" + nonce.toString(16),
                  data: exit,
                  to: tokenManagerAddress,
                  gasPrice: 100000000000,
                  gas: 8000000
                };

                //sign transaction
                const txExit = new Tx(rawTxExit, { common: customCommon });
                txExit.sign(privateKey);

                const serializedTxExit = txExit.serialize();

                //send signed transaction (exit)
                web3ForSchain.eth
                    .sendSignedTransaction("0x" + serializedTxExit.toString("hex"))
                    .on("receipt", (receipt) => {
                      console.log(receipt);
                    })
                    .catch(console.error);
              });
        })
        .catch(console.error);
  });
}
