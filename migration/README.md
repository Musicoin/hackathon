## **Musicoin Migration script**
How to use this script

#### Hardhat config
`npm i`
`npm install dotenv`
`npm install mongoose`
`npm i bcrypt-nodejs`
`npm i fastest-validator`
`npm install web3`

#### To deploy Artist contract (10 at a time) run below in terminal
`npx hardhat --network <network> run ./scripts/migrate-Artist.js`

#### To deploy releases contract (100 at a time)
`npx hardhat --network <network> run ./scripts/migrate-Releases.js`

{network} could be local/skale network configured in _hardhat.config.js_

>*Setup a local Skale network via refering to* 
[Skale-Sdk](https://github.com/skalenetwork/skale-sdk)  
