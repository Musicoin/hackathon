const Web3 = require("web3");

export function getBalances() {
  // let rinkebyABIs = require("./contracts/rinkeby_ABIs.json");
  let schainABIs = require("./contracts/schain_ABIs.json");
  let rinkebyABIs = require("./contracts/rinkeby_ABIs.json");
  let rinkebyERC20ABI = require("./contracts/rinkeby_ERC20_ABI.json");
  let schainERC20ABI = require("./contracts/schain_ERC20_ABI.json");

  let account = process.env.REACT_APP_INSECURE_ACCOUNT;
  let accountForMainnet = process.env.REACT_APP_INSECURE_ACCOUNT;
  let accountForSchain = process.env.REACT_APP_INSECURE_ACCOUNT;

  let rinkeby = process.env.REACT_APP_INSECURE_RINKEBY;
  let schainEndpoint = process.env.REACT_APP_INSECURE_SKALE_CHAIN;
  let schainName = process.env.REACT_APP_INSECURE_CHAIN_NAME;

  // const lockAndDataForMainnetAddress =
  //   rinkebyABIs.deposit_box_erc20_address;

  const tokenManagerERC20Address = schainABIs.token_manager_erc20_address;

  const ERC20ABI = rinkebyERC20ABI.erc20_abi;
  const ERC20Address = rinkebyERC20ABI.erc20_address;

  const ERC20ABISchain = schainERC20ABI.erc20_abi;
  const ERC20AddressAddress = schainERC20ABI.erc20_address;

  const communityPoolAddress = rinkebyABIs.community_pool_address;
  const communityPoolABI = rinkebyABIs.community_pool_abi;

  const web3Rinkeby = new Web3(rinkeby);
  const web3SkaleChain = new Web3(schainEndpoint);

  const RinkebyERC20Contract = new web3Rinkeby.eth.Contract(
      ERC20ABI,
      ERC20Address
  );

  const CommunityPool = new web3Rinkeby.eth.Contract(
      communityPoolABI,
      communityPoolAddress
  );

  let schainERC20Contract = new web3SkaleChain.eth.Contract(
      ERC20ABISchain,
      ERC20AddressAddress
  );

  RinkebyERC20Contract.methods
      .balanceOf(accountForMainnet)
      .call()
      .then((balance) => {
        balance = web3Rinkeby.utils.hexToNumberString(
            web3Rinkeby.utils.numberToHex(balance)
        );
        document.getElementById(
            "rinkeby_balance"
        ).value = web3Rinkeby.utils.fromWei(balance, "ether");
      });

  CommunityPool.methods
      .getBalance(account, schainName)
      .call({ from: account })
      .then((balance) => {
        if (balance === null) {
          balance = 0;
        }
        balance = web3Rinkeby.utils.hexToNumberString(
            web3Rinkeby.utils.numberToHex(balance)
        );
        document.getElementById(
            "community_balance"
        ).value = web3Rinkeby.utils.fromWei(balance, "ether");
      });

  const SchainERC20ABI = schainERC20ABI.erc20_abi;
  const SchainERC20Address = schainERC20ABI.erc20_address;

  const SchainERC20Contract = new web3SkaleChain.eth.Contract(
      SchainERC20ABI,
      SchainERC20Address
  );

  web3SkaleChain.eth.getBalance(account).then((balance) => {
    document.getElementById(
        "schain_sketh_balance"
    ).value = web3Rinkeby.utils.fromWei(balance, "ether");
  });

  SchainERC20Contract.methods
      .balanceOf(accountForSchain)
      .call()
      .then((balance) => {
        balance = web3SkaleChain.utils.hexToNumberString(
            web3SkaleChain.utils.numberToHex(balance)
        );
        document.getElementById(
            "skale_balance"
        ).value = web3SkaleChain.utils.fromWei(balance, "ether");
      });

  schainERC20Contract
      .getPastEvents("MinterAdded", {
        filter: { account: [tokenManagerERC20Address] },
        fromBlock: 0,
        toBlock: "latest"
      })
      .then((events) => {
        if (events[0]) {
          document.getElementById("lnd_minter").value = "Minter";
        } else {
          document.getElementById("lnd_minter").value = "Not a Minter";
        }
      });

  setTimeout(function () {
    getBalances();
  }, 4000);
}
