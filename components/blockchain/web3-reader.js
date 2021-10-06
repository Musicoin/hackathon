const Promise = require('bluebird');
const ArrayUtils = require('./array-utils');
const fs = require('fs');
// *** RW: Update to new .abi ideally using a config file
const pppAbi = JSON.parse(fs.readFileSync(__dirname + '/../../solidity/v1_20210924/PayPerPlay.sol.abi'));
const artistAbi = JSON.parse(fs.readFileSync(__dirname + '/../../solidity/v1_20210924/Artist.sol.abi'));
const SolidityUtils = require("./solidity-utils");

const TxTypes = Object.freeze({
    FUNCTION: "function",
    CREATION: "creation",
    EXCHANGE: "exchange",
    UNKNOWN: "unknown"
});

const FunctionTypes = Object.freeze({
    PLAY: "play",
    TIP: "tip",
    UNKNOWN: "unknown"
});

const ContractTypes = Object.freeze({
    PPP: "ppp",
    ARTIST: "artist",
    WORK: "work",
    UNKNOWN: "unknown"
});
Web3Reader.TxTypes = TxTypes;
Web3Reader.ContractTypes = ContractTypes;
Web3Reader.FunctionTypes = FunctionTypes;

const knownContracts = [];

function Web3Reader(web3) {
    this.web3 = web3;

    this.txTypeMapping = {};
    // *** RW: tip() function call needs to send musicoin as uint256. Does it need updating with parameter here?
    this.txTypeMapping[this.web3.sha3('tip()').substring(0, 10)] = TxTypes.FUNCTION;
    this.txTypeMapping[this.web3.sha3('play()').substring(0, 10)] = TxTypes.FUNCTION;
    this.txTypeMapping['0x'] = TxTypes.EXCHANGE;

    this.functionTypeMapping = {};
    // *** RW: tip() function call needs to send musicoin as uint256. Does it need updating with parameter here?
    this.functionTypeMapping[this.web3.sha3('tip()').substring(0, 10)] = FunctionTypes.TIP;
    this.functionTypeMapping[this.web3.sha3('play()').substring(0, 10)] = FunctionTypes.PLAY;

    // *** RW: Is this built to support all versions of contracts in production?  This can be updated to just the new version.  Old code left as an example for future version management
    //this.pppV5 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/mvp5/PayPerPlay.json');
    //this.pppV6 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/mvp6/PayPerPlay.json');
    //this.pppV7 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/mvp7/PayPerPlay.json');
    //this.artistV2 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/mvp5/Artist.json');
    //this.artistV3 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/mvp7/Artist.json');
    this.pppV1_20210924 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/v1_20210924/PayPerPlay.json');
    this.artistV1_20210924 = SolidityUtils.loadContractDefinition(this.web3.sha3, __dirname + '/../../solidity/v1_20210924/Artist.json');

    // *** RW: This needs to be rewritten to work with Musicoin instead of eth balance
    this.getBalanceAsync = Promise.promisify(this.web3.eth.getBalance);

    // *** RW: This is built to support all versions of contracts in production.  Push any new versions here.  Old ones removed for the migration launch
    knownContracts.push(this.pppV1_20210924);
    knownContracts.push(this.artistV1_20210924);
};

Web3Reader.getDependencies = function () {
    return { web3: null };
};

Web3Reader.prototype.getContractDefinition = function (type, version) {
    return knownContracts.filter(function (d) { return d.type == type && d.version == version })[0];
};

Web3Reader.prototype.loadLicense = function (licenseAddress) {
    console.log("Loading license: " + licenseAddress);

    // load the oldest supported version and extract the actual version from the contract
    const tempContract = this.web3.eth.contract(pppAbi).at(licenseAddress);
    return Promise.promisify(tempContract.contractVersion)()
        .bind(this)
        .then(function (version) {
            return this.getContractDefinition(ContractTypes.PPP, version);
        })
        .then(function (definition) {
            const licensePromise = this.loadContract(licenseAddress, definition.abi);
            // extracting the arrays takes some extra work
            const c = Promise.promisifyAll(this.web3.eth.contract(definition.abi).at(licenseAddress));
            const contributorPromise = ArrayUtils.extractAddressAndValues(c.contributorsAsync, c.contributorSharesAsync, "shares");
            const royaltyPromise = ArrayUtils.extractAddressAndValues(c.royaltiesAsync, c.royaltyAmountsAsync, "amount");
            return Promise.join(licensePromise, contributorPromise, royaltyPromise,
                function (licenseObject, contributors, royalties) {
                    licenseObject.contributors = contributors;
                    licenseObject.royalties = royalties;

                    // for convenience, do the conversion to "coins" from wei
                    licenseObject.coinsPerPlay = this.web3.fromWei(licenseObject.weiPerPlay, 'ether');
                    licenseObject.totalEarnedCoins = this.web3.fromWei(licenseObject.totalEarned, 'ether');
                    licenseObject.address = licenseAddress;

                    return licenseObject;
                }.bind(this));
        });
};

Web3Reader.prototype.getArtistByProfile = function (profileAddress, output) {
    return this.loadContract(profileAddress, artistAbi, output);
};

Web3Reader.prototype.loadContract = function (address, abi, outputObject) {
    return this.loadContractAndFields(address, abi, this.getConstantFields(abi), outputObject);
};

Web3Reader.prototype.getFunctionType = function (transaction) {
    return this.functionTypeMapping[transaction.input] || FunctionTypes.UNKNOWN;
};

Web3Reader.prototype.getTransactionType = function (transaction) {
    if (transaction.to == null) {
        return TxTypes.CREATION;
    }
    return this.txTypeMapping[transaction.input];
};

Web3Reader.prototype.getContractType = function (code) {
    for (let i = 0; i < knownContracts.length; i++) {
        const template = knownContracts[i];
        if (code.length >= template.codeLength) {
            const codeHash = this.web3.sha3(code.substr(0, template.codeLength));
            if (codeHash == template.codeHash) {
                return {
                    type: template.type,
                    version: template.version
                };
            }
        }
    }
    return {
        type: ContractTypes.UNKNOWN,
        version: "unknown"
    };
};

Web3Reader.prototype.getTransaction = function (tx) {
    return new Promise(function (resolve, reject) {
        this.web3.eth.getTransaction(tx, function (error, transaction) {
            if (error) reject(error);
            else resolve(transaction);
        })
    }.bind(this));
};

Web3Reader.prototype.getTransactionReceipt = function (tx) {
    return new Promise(function (resolve, reject) {
        this.web3.eth.getTransactionReceipt(tx, function (error, receipt) {
            if (error) reject(error);
            else resolve(receipt);
        })
    }.bind(this));
};

Web3Reader.prototype.getLicenseContractInstance = function (licenseAddress) {
    return this.web3.eth.contract(pppAbi).at(licenseAddress);
};

Web3Reader.prototype.getArtistContractInstance = function (profileAddress) {
    return this.web3.eth.contract(this.artistV1_20210924.abi).at(profileAddress);
};

Web3Reader.prototype.getContractAt = function (abi, address) {
    return Promise.promisifyAll(this.web3.eth.contract(abi).at(address));
};

/*
 * Loads the given fields into a JSON object asynchronously
 */
Web3Reader.prototype.loadContractAndFields = function (address, abi, fields, outputObject) {
    const c = Promise.promisifyAll(this.web3.eth.contract(abi).at(address));
    fields = fields.map(f => {
        if (typeof f == "string") {
            const matches = abi.filter(k => k.name == f);
            if (matches.length == 1) {
                return matches[0];
            }
            else {
                console.log(`Could not match field: ${f}, found ${matches.length} matches`);
                return null;
            }
        }
        return f;
    }).filter(f => f != null);

    const promises = fields.map(f => {
        const name = f.name;
        if (c[name + "Async"]) return c[name + "Async"]();
        return Promise.resolve(name + " not found")
            .catch(function (err) {
                return name + " not found";
            });
    });

    // *** RW: This needs to call the musicoin contract, not web3
    const fieldPromises = Promise.all(promises);
    return Promise.join(this.getBalanceAsync(address), fieldPromises, function (weiBalance, results) {
        const output = outputObject || {};
        fields.forEach((f, idx) => {
            const name = f.name;
            let value = results[idx];
            if (f.outputs.length == 1 && f.outputs[0].type.startsWith("bytes")) {
                value = this.web3.toUtf8(value);
            }
            output[name] = value;
        });
        output.balance = this.web3.fromWei(weiBalance, 'ether');
        return output;
    }.bind(this))
};

// *** RW: This needs to call the musicoin contract, not web3
Web3Reader.prototype.getBalanceInMusicoins = function (address) {
    return this.getBalanceAsync(address)
        .then((weiBalance) => this.web3.fromWei(weiBalance, 'ether'));
};

Web3Reader.prototype.convertWeiToMusicoins = function (weiAmount) {
    return this.web3.fromWei(weiAmount, 'ether');
};

Web3Reader.prototype.getConstantFields = function (abi) {
    return abi
        .filter(field => field.constant && field.type == "function" && field.inputs && field.inputs.length == 0)
};

Web3Reader.prototype.waitForTransaction = function (expectedTx) {
    return new Promise(function (resolve, reject) {
        let count = 0;
        const filter = this.web3.eth.filter('latest');
        filter.watch(function (error, result) {
            if (error) console.log("Error: " + error);
            if (result) console.log("Result: " + result);
            count++;

            if (count > 30) {
                console.log("Giving up on tx " + expectedTx);
                reject(new Error("Transaction was not confirmed"));
                filter.stopWatching();
            }

            // each time a new block comes in, see if our tx is in it
            this.web3.eth.getTransactionReceipt(expectedTx, function (error, receipt) {
                if (receipt && receipt.transactionHash == expectedTx) {
                    console.log("Got receipt: " + expectedTx + ", blockHash: " + receipt.blockHash);
                    this.web3.eth.getTransaction(expectedTx, function (error, transaction) {
                        if (transaction.gas == receipt.gasUsed) {
                            // wtf?! This is the only way to check for an error??
                            filter.stopWatching();
                            reject(new Error("Out of gas (or an error was thrown)"));
                        }
                        else if (receipt.blockHash) {
                            console.log("Confirmed " + expectedTx);
                            console.log("Block hash " + receipt.blockHash);
                            filter.stopWatching();
                            resolve(receipt);
                        }
                        else {
                            console.log("Waiting for confirmation of " + expectedTx);
                        }
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

Web3Reader.prototype.getWeb3 = function () {
    return this.web3;
};

module.exports = Web3Reader;
