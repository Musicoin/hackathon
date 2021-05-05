import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';

const provider = new HDWalletProvider(
    process.env.PRIVATE_KEY,
    process.env.SKALE_ENDPOINT,
);
export default new Web3(provider);
