
export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegator",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "fromDelegate",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "toDelegate",
        "type": "address"
      }
    ],
    "name": "DelegateChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "previousBalance",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newBalance",
        "type": "uint256"
      }
    ],
    "name": "DelegateVotesChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "MinterAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "MinterRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DELEGATION_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOMAIN_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "addMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "rawAmount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "name": "checkpoints",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "fromBlock",
        "type": "uint32"
      },
      {
        "internalType": "uint96",
        "name": "votes",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "delegatee",
        "type": "address"
      }
    ],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "delegatee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "nonce",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expiry",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "delegateBySig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "delegates",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getCurrentVotes",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "blockNumber",
        "type": "uint256"
      }
    ],
    "name": "getPriorVotes",
    "outputs": [
      {
        "internalType": "uint96",
        "name": "",
        "type": "uint96"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isMinter",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "numCheckpoints",
    "outputs": [
      {
        "internalType": "uint32",
        "name": "",
        "type": "uint32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "dst",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "rawAmount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "src",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "dst",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "rawAmount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const bytecode = "0x60806040523480156200001157600080fd5b506040516200397138038062003971833981810160405281019062000037919062000823565b89600390805190602001906200004f92919062000497565b5088600490805190602001906200006892919062000497565b508460078190555087600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555033600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555085600690805190602001906200010a92919062000497565b5082600890805190602001906200012392919062000497565b5083600990805190602001906200013c92919062000497565b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555062000191878383620001e360201b60201c565b8a600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505050505050505050505062000ef0565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161462000276576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200026d9062000afc565b60405180910390fd5b8051825114620002bd576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620002b49062000b40565b60405180910390fd5b82600a8190555081600b9080519060200190620002dc92919062000528565b5080600c9080519060200190620002f5929190620005b7565b506000600d8190555060005b600b805490508110156200038557600c81815481106200034a577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9060005260206000200154600d600082825462000368919062000c55565b9250508190555080806200037c9062000dc7565b91505062000301565b506000600d541480156200039e57506000600b80549050115b15620003e1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620003d89062000b1e565b60405180910390fd5b620003f7600b805490506200045760201b60201c565b60148190555060126000815480929190620004129062000dc7565b91905055507f8b39b01c7d0d1bd288204f8e12eec2e0ad2b3631ab809dcfe99161c9aefb864d6012546040516200044a919062000b62565b60405180910390a1505050565b60008060008062000469919062000c55565b62000475919062000c55565b8262000482919062000cb2565b600062000490919062000c55565b9050919050565b828054620004a59062000d91565b90600052602060002090601f016020900481019282620004c9576000855562000515565b82601f10620004e457805160ff191683800117855562000515565b8280016001018555821562000515579182015b8281111562000514578251825591602001919060010190620004f7565b5b50905062000524919062000609565b5090565b828054828255906000526020600020908101928215620005a4579160200282015b82811115620005a35782518260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055509160200191906001019062000549565b5b509050620005b3919062000609565b5090565b828054828255906000526020600020908101928215620005f6579160200282015b82811115620005f5578251825591602001919060010190620005d8565b5b50905062000605919062000609565b5090565b5b80821115620006245760008160009055506001016200060a565b5090565b60006200063f620006398462000bb3565b62000b7f565b905080838252602082019050828560208602820111156200065f57600080fd5b60005b8581101562000693578162000678888262000757565b84526020840193506020830192505060018101905062000662565b5050509392505050565b6000620006b4620006ae8462000be2565b62000b7f565b90508083825260208201905082856020860282011115620006d457600080fd5b60005b85811015620007085781620006ed88826200080c565b845260208401935060208301925050600181019050620006d7565b5050509392505050565b600062000729620007238462000c11565b62000b7f565b9050828152602081018484840111156200074257600080fd5b6200074f84828562000d5b565b509392505050565b600081519050620007688162000ea2565b92915050565b600082601f8301126200078057600080fd5b81516200079284826020860162000628565b91505092915050565b600082601f830112620007ad57600080fd5b8151620007bf8482602086016200069d565b91505092915050565b600081519050620007d98162000ebc565b92915050565b600082601f830112620007f157600080fd5b81516200080384826020860162000712565b91505092915050565b6000815190506200081d8162000ed6565b92915050565b60008060008060008060008060008060006101608c8e0312156200084657600080fd5b6000620008568e828f0162000757565b9b505060208c015167ffffffffffffffff8111156200087457600080fd5b620008828e828f01620007df565b9a505060408c015167ffffffffffffffff811115620008a057600080fd5b620008ae8e828f01620007df565b9950506060620008c18e828f0162000757565b9850506080620008d48e828f016200080c565b97505060a08c015167ffffffffffffffff811115620008f257600080fd5b620009008e828f01620007df565b96505060c0620009138e828f01620007c8565b95505060e08c015167ffffffffffffffff8111156200093157600080fd5b6200093f8e828f01620007df565b9450506101008c015167ffffffffffffffff8111156200095e57600080fd5b6200096c8e828f01620007df565b9350506101208c015167ffffffffffffffff8111156200098b57600080fd5b620009998e828f016200076e565b9250506101408c015167ffffffffffffffff811115620009b857600080fd5b620009c68e828f016200079b565b9150509295989b509295989b9093969950565b6000620009e860138362000c44565b91507f43616c6c6572206973206e6f74206f776e6572000000000000000000000000006000830152602082019050919050565b600062000a2a60208362000c44565b91507f546f74616c20736861726573206d757374206265206d6f7265207468616e20306000830152602082019050919050565b600062000a6c60418362000c44565b91507f5468652023206f6620636f6e7472696275746f727320646f6573206e6f74206d60008301527f61746368207468652023206f6620636f6e7472696275746f722073686172657360208301527f2e000000000000000000000000000000000000000000000000000000000000006040830152606082019050919050565b62000af68162000d51565b82525050565b6000602082019050818103600083015262000b1781620009d9565b9050919050565b6000602082019050818103600083015262000b398162000a1b565b9050919050565b6000602082019050818103600083015262000b5b8162000a5d565b9050919050565b600060208201905062000b79600083018462000aeb565b92915050565b6000604051905081810181811067ffffffffffffffff8211171562000ba95762000ba862000e73565b5b8060405250919050565b600067ffffffffffffffff82111562000bd15762000bd062000e73565b5b602082029050602081019050919050565b600067ffffffffffffffff82111562000c005762000bff62000e73565b5b602082029050602081019050919050565b600067ffffffffffffffff82111562000c2f5762000c2e62000e73565b5b601f19601f8301169050602081019050919050565b600082825260208201905092915050565b600062000c628262000d51565b915062000c6f8362000d51565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111562000ca75762000ca662000e15565b5b828201905092915050565b600062000cbf8262000d51565b915062000ccc8362000d51565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161562000d085762000d0762000e15565b5b828202905092915050565b600062000d208262000d31565b9050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b60005b8381101562000d7b57808201518184015260208101905062000d5e565b8381111562000d8b576000848401525b50505050565b6000600282049050600182168062000daa57607f821691505b6020821081141562000dc15762000dc062000e44565b5b50919050565b600062000dd48262000d51565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141562000e0a5762000e0962000e15565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b62000ead8162000d13565b811462000eb957600080fd5b50565b62000ec78162000d27565b811462000ed357600080fd5b50565b62000ee18162000d51565b811462000eed57600080fd5b50565b612a718062000f006000396000f3fe6080604052600436106101f95760003560e01c80637132048c1161010d578063b10f0fdf116100a0578063d008b5c91161006f578063d008b5c91461069d578063e0b7f8b2146106c6578063e31e9c9014610703578063e8b69bc31461072e578063f2fde38b1461074a576101f9565b8063b10f0fdf146105f3578063b784c9661461061e578063b814b7ed14610647578063cd29c71a14610672576101f9565b806393e84cd9116100dc57806393e84cd9146105685780639761430214610572578063a0a8e4601461059d578063aba83150146105c8576101f9565b80637132048c146104d45780637943da69146104fd5780638da5cb5b1461051457806391a8b36a1461053f576101f9565b80634ab6d3371161019057806354c937a31161015f57806354c937a31461040e5780635b2f515b1461043957806366f8913d146104645780636898f82b1461048d5780636dfa8d99146104a9576101f9565b80634ab6d3371461036457806350a5292f1461038f57806350c5f467146103ba57806353c3af38146103e3576101f9565b80633a5673a4116101cc5780633a5673a4146102a65780633a98ef39146102d15780633cb5d100146102fc5780634a79d50c14610339576101f9565b806305e91fbc146101fe5780631e2c74f61461022957806336ebffca1461025257806337fb13b01461027d575b600080fd5b34801561020a57600080fd5b50610213610773565b6040516102209190612530565b60405180910390f35b34801561023557600080fd5b50610250600480360381019061024b91906120ec565b610801565b005b34801561025e57600080fd5b506102676108db565b6040516102749190612515565b60405180910390f35b34801561028957600080fd5b506102a4600480360381019061029f919061213e565b6108e1565b005b3480156102b257600080fd5b506102bb6109ca565b6040516102c891906124a8565b60405180910390f35b3480156102dd57600080fd5b506102e66109f0565b6040516102f39190612649565b60405180910390f35b34801561030857600080fd5b50610323600480360381019061031e919061217f565b6109f6565b60405161033091906124a8565b60405180910390f35b34801561034557600080fd5b5061034e610a35565b60405161035b9190612530565b60405180910390f35b34801561037057600080fd5b50610379610ac3565b6040516103869190612649565b60405180910390f35b34801561039b57600080fd5b506103a4610ad0565b6040516103b19190612649565b60405180910390f35b3480156103c657600080fd5b506103e160048036038101906103dc919061213e565b610ad6565b005b3480156103ef57600080fd5b506103f8610c49565b6040516104059190612649565b60405180910390f35b34801561041a57600080fd5b50610423610c4f565b60405161043091906124a8565b60405180910390f35b34801561044557600080fd5b5061044e610c75565b60405161045b9190612530565b60405180910390f35b34801561047057600080fd5b5061048b6004803603810190610486919061213e565b610d03565b005b6104a760048036038101906104a2919061217f565b610dec565b005b3480156104b557600080fd5b506104be610e3c565b6040516104cb9190612649565b60405180910390f35b3480156104e057600080fd5b506104fb60048036038101906104f6919061213e565b610e42565b005b34801561050957600080fd5b50610512610fcd565b005b34801561052057600080fd5b50610529611132565b60405161053691906124a8565b60405180910390f35b34801561054b57600080fd5b506105666004803603810190610561919061213e565b611158565b005b6105706112cb565b005b34801561057e57600080fd5b50610587611431565b6040516105949190612649565b60405180910390f35b3480156105a957600080fd5b506105b2611437565b6040516105bf9190612530565b60405180910390f35b3480156105d457600080fd5b506105dd611470565b6040516105ea9190612530565b60405180910390f35b3480156105ff57600080fd5b506106086114fe565b6040516106159190612649565b60405180910390f35b34801561062a57600080fd5b50610645600480360381019061064091906120c3565b611504565b005b34801561065357600080fd5b5061065c611639565b6040516106699190612649565b60405180910390f35b34801561067e57600080fd5b5061068761163f565b6040516106949190612530565b60405180910390f35b3480156106a957600080fd5b506106c460048036038101906106bf91906121d1565b6116cd565b005b3480156106d257600080fd5b506106ed60048036038101906106e8919061217f565b611920565b6040516106fa9190612649565b60405180910390f35b34801561070f57600080fd5b50610718611944565b6040516107259190612649565b60405180910390f35b6107486004803603810190610743919061217f565b61194a565b005b34801561075657600080fd5b50610771600480360381019061076c91906120c3565b6119a0565b005b60068054610780906128ae565b80601f01602080910402602001604051908101604052809291908181526020018280546107ac906128ae565b80156107f95780601f106107ce576101008083540402835291602001916107f9565b820191906000526020600020905b8154815290600101906020018083116107dc57829003601f168201915b505050505081565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610891576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161088890612589565b60405180910390fd5b80156108a05761089f610fcd565b5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16ff5b60075481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610971576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161096890612589565b60405180910390fd5b6000819050816003908051906020019061098c929190611d4c565b507f22acc4a8a24a882ec34023ae560342d9168fcf2891e33fe6cce65205f14b6e1d81836040516109be929190612552565b60405180910390a15050565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600d5481565b600b8181548110610a0657600080fd5b906000526020600020016000915054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60038054610a42906128ae565b80601f0160208091040260200160405190810160405280929190818152602001828054610a6e906128ae565b8015610abb5780601f10610a9057610100808354040283529160200191610abb565b820191906000526020600020905b815481529060010190602001808311610a9e57829003601f168201915b505050505081565b6000600b80549050905090565b60125481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610b66576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b5d90612589565b60405180910390fd5b600060098054610b75906128ae565b80601f0160208091040260200160405190810160405280929190818152602001828054610ba1906128ae565b8015610bee5780601f10610bc357610100808354040283529160200191610bee565b820191906000526020600020905b815481529060010190602001808311610bd157829003601f168201915b505050505090508160099080519060200190610c0b929190611d4c565b507fb02c8b10c4223f4e1db03c9ed3788d67b02b2a0017cb46d8f7e267da8ec3635d8183604051610c3d929190612552565b60405180910390a15050565b60135481565b600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60048054610c82906128ae565b80601f0160208091040260200160405190810160405280929190818152602001828054610cae906128ae565b8015610cfb5780601f10610cd057610100808354040283529160200191610cfb565b820191906000526020600020905b815481529060010190602001808311610cde57829003601f168201915b505050505081565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610d93576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d8a90612589565b60405180910390fd5b60008190508160049080519060200190610dae929190611d4c565b507f1fdaa66cdf50e1e42b0580f739eb16e2e93204915beee198eabf70ab5ac138798183604051610de0929190612552565b60405180910390a15050565b600a54811015610e31576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e2890612629565b60405180910390fd5b610e396112cb565b50565b600f5481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610ed2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ec990612589565b60405180910390fd5b600060088054610ee1906128ae565b80601f0160208091040260200160405190810160405280929190818152602001828054610f0d906128ae565b8015610f5a5780601f10610f2f57610100808354040283529160200191610f5a565b820191906000526020600020905b815481529060010190602001808311610f3d57829003601f168201915b505050505090508160089080519060200190610f77929190611d4c565b5060136000815480929190610f8b906128e0565b91905055507f371845017d9ef73a8a9a99f3ff29b8d9a5967ff6ac9e50905722a8e65dfc14458183604051610fc1929190612552565b60405180910390a15050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461105d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161105490612589565b60405180910390fd5b61113060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff166040518263ffffffff1660e01b81526004016110db91906124a8565b60206040518083038186803b1580156110f357600080fd5b505afa158015611107573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061112b91906121a8565b611ad5565b565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146111e8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111df90612589565b60405180910390fd5b6000600680546111f7906128ae565b80601f0160208091040260200160405190810160405280929190818152602001828054611223906128ae565b80156112705780601f1061124557610100808354040283529160200191611270565b820191906000526020600020905b81548152906001019060200180831161125357829003601f168201915b50505050509050816006908051906020019061128d929190611d4c565b507f660b07d69b189ddf18e0bb333d534e5ce6838e161154489b36d3d5bd329e540781836040516112bf929190612552565b60405180910390a15050565b600a5460008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b815260040161132791906124a8565b60206040518083038186803b15801561133f57600080fd5b505afa158015611353573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061137791906121a8565b10156113b8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113af906125c9565b60405180910390fd5b6113c3600a54611ad5565b600a54600f60008282546113d79190612739565b92505081905550600e60008154809291906113f1906128e0565b91905055507f1a89c1c30743c234698485f5369000475c99a479a87f18ff17e5b581e6fdecdd600e546040516114279190612649565b60405180910390a1565b600e5481565b6040518060400160405280600481526020017f76302e370000000000000000000000000000000000000000000000000000000081525081565b6009805461147d906128ae565b80601f01602080910402602001604051908101604052809291908181526020018280546114a9906128ae565b80156114f65780601f106114cb576101008083540402835291602001916114f6565b820191906000526020600020905b8154815290600101906020018083116114d957829003601f168201915b505050505081565b600a5481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611594576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161158b90612589565b60405180910390fd5b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055507f77a1bc180e78798ba8584a9b8f49c501bfa3c51c781e23a07e84b4e585623665818360405161162d9291906124c3565b60405180910390a15050565b60115481565b6008805461164c906128ae565b80601f0160208091040260200160405190810160405280929190818152602001828054611678906128ae565b80156116c55780601f1061169a576101008083540402835291602001916116c5565b820191906000526020600020905b8154815290600101906020018083116116a857829003601f168201915b505050505081565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461175d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161175490612589565b60405180910390fd5b80518251146117a1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611798906125e9565b60405180910390fd5b82600a8190555081600b90805190602001906117be929190611dd2565b5080600c90805190602001906117d5929190611e5c565b506000600d8190555060005b600b8054905081101561185e57600c8181548110611828577f4e487b710000000000000000000000000000000...