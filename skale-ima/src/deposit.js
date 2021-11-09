const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;

const amountToSend = '1000';

export function makeDeposit() {
  let rinkebyABIs = require("./contracts/rinkeby_ABIs.json");
  let rinkebyERC20ABI = require("./contracts/rinkeby_ERC20_ABI.json");

  let privateKey = new Buffer(
      process.env.REACT_APP_INSECURE_PRIVATE_KEY,
      "hex"
  );
  let accountForMainnet = process.env.REACT_APP_INSECURE_ACCOUNT;

  let rinkeby = process.env.REACT_APP_INSECURE_RINKEBY;
  let schainName = process.env.REACT_APP_INSECURE_CHAIN_NAME;
  let chainId = process.env.REACT_APP_INSECURE_RINKEBY_CHAIN_ID;

  const depositBoxAddress = rinkebyABIs.deposit_box_erc20_address;
  const depositBoxABI = rinkebyABIs.deposit_box_erc20_abi;

  const erc20ABI = rinkebyERC20ABI.erc20_abi;
  const erc20Address = rinkebyERC20ABI.erc20_address;

  const web3ForMainnet = new Web3(rinkeby);

  let depositBox = new web3ForMainnet.eth.Contract(
      depositBoxABI,
      depositBoxAddress
  );

  let contractERC20 = new web3ForMainnet.eth.Contract(erc20ABI, erc20Address);

  /**
   * Uses the openzeppelin ERC20
   * contract function approve
   * https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC20
   */
  let approve = contractERC20.methods
      .approve(
          depositBoxAddress,
          web3ForMainnet.utils.toHex(web3ForMainnet.utils.toWei(amountToSend, "ether"))
      )
      .encodeABI();

  /**
   * Uses the SKALE DepositBox
   * contract function depositERC20
   */
  let deposit = depositBox.methods
      .depositERC20(
          schainName,
          erc20Address,
          web3ForMainnet.utils.toHex(web3ForMainnet.utils.toWei(amountToSend, "ether"))
      )
      .encodeABI();

  web3ForMainnet.eth.getTransactionCount(accountForMainnet).then((nonce) => {
    //create raw transaction
    const rawTxApprove = {
      chainId: chainId,
      from: accountForMainnet,
      nonce: "0x" + nonce.toString(16),
      data: approve,
      to: erc20Address,
      gas: 6500000,
      gasPrice: 1000000000
    };

    //sign transaction
    const txApprove = new Tx(rawTxApprove, {
      chain: "rinkeby",
      hardfork: "petersburg"
    });
    txApprove.sign(privateKey);

    const serializedTxApprove = txApprove.serialize();

    //send signed transaction (approve)
    web3ForMainnet.eth
        .sendSignedTransaction("0x" + serializedTxApprove.toString("hex"))
        .on("receipt", (receipt) => {
          console.log(receipt);
          web3ForMainnet.eth
              .getTransactionCount(accountForMainnet)
              .then((nonce) => {
                const rawTxDeposit = {
                  chainId: chainId,
                  from: accountForMainnet,
                  nonce: "0x" + nonce.toString(16),
                  data: deposit,
                  to: depositBoxAddress,
                  gas: 6500000,
                  gasPrice: 1000000000
                };

                //sign transaction
                const txDeposit = new Tx(rawTxDeposit, {
                  chain: "rinkeby",
                  hardfork: "petersburg"
                });

                txDeposit.sign(privateKey);

                const serializedTxDeposit = txDeposit.serialize();

                //send signed transaction (deposit)
                web3ForMainnet.eth
                    .sendSignedTransaction("0x" + serializedTxDeposit.toString("hex"))
                    .on("receipt", (receipt) => {
                      console.log(receipt);
                    })
                    .catch(console.error);
              });
        })
        .catch(console.error);
  });
}
