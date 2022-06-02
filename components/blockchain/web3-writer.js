// *** RW: How much gas needs sending for the contracts under Skale?  Now it is hardcoded

const Promise = require("bluebird");
const Web3Reader = require('./web3-reader');
const ArrayUtils = require('./array-utils');

function Web3Writer(web3Reader, maxCoinsPerPlay) {
    this.web3 = web3Reader.getWeb3();
    this.web3Reader = web3Reader;
    this.maxCoinsPerPlay = maxCoinsPerPlay;
}

Web3Writer.prototype.setCredentialsProvider = function (provider) {
    this.credentialsProvider = provider;
};

Web3Writer.createInMemoryCredentialsProvider = function (account, password) {
    if (password == "dummy1") { console.log("Default dummy account password was used, might be an incorrect configuration") }
    return {
        getCredentials: function () {
            return Promise.resolve({
                account: account,
                password: password
            });
        }
    }
};

Web3Writer.prototype.unlockAccount = function (provider) {
    provider = provider || this.credentialsProvider;
    if (!provider)
        throw new Error("You must provide a credentials provider or call setCredentialsProvider before sending transactions");

    return provider.getCredentials()
        .bind(this)
        .then(function (credentials) {
            return this.unlockAccountWithCredentials(credentials);
        })
};

Web3Writer.prototype.unlockAccountWithCredentials = function (credentials) {
    return new Promise(function (resolve, reject) {
        this.web3.personal.unlockAccount(credentials.account, credentials.password, 10, function (err, result) {
            if (result) {
                resolve(credentials.account);
            }
            else {
                reject(new Error("Unlocking account failed: " + err));
            }
        });
    }.bind(this));
};

Web3Writer.prototype.tipLicense = function (licenseAddress, weiTipAmount, credentialsProvider) {
    return this.unlockAccount(credentialsProvider)
        .bind(this)
        .then(function (account) {
            const contract = this.web3Reader.getLicenseContractInstance(licenseAddress);
            // *** RW: Tipping needs updating to send Musicoin as a function parameter.  Assuming weiTipAmount is from a UI form and validated as Musicoin for the user
            // *** RW: const params = { from: account, value: weiTipAmount, gas: 940000 };
            const params = { from: account, gas: 940000 };
            return new Promise(function (resolve, reject) {
                //noinspection JSUnresolvedFunction
                contract.tip(weiTipAmount, params, function (err, tx) {
                    if (err) reject(err);
                    else resolve(tx);
                });
            })
        })
        .then(function (tx) {
            console.log("Sending tip, tx: " + tx);
            return tx;
        })
};

Web3Writer.prototype.sendFromProfile = function (profileAddress, recipientAddress, musicoins, credentialsProvider) {
    const weiAmount = this.toIndivisibleUnits(musicoins);
    return this.web3Reader.getBalanceInMusicoins(profileAddress)
        .bind(this)
        .then(balance => {
            if (balance.greaterThanOrEqualTo(musicoins)) {
                return this.unlockAccount(credentialsProvider);
            }
            throw new Error(`Tip failed, account does not have enough funds to send ${musicoins} musicoins, balance: ${balance}, account: ${profileAddress}`);
        })
        .then(function (sender) {
            const contract = this.web3Reader.getArtistContractInstance(profileAddress);
            const params = { from: sender, gas: 940000 };
            return new Promise(function (resolve, reject) {
                //noinspection JSUnresolvedFunction
                // *** RW: This is the same signature
                contract.payOut(recipientAddress, weiAmount, params, function (err, tx) {
                    if (err) reject(err);
                    else resolve(tx);
                });
            })
        })
        .then(function (tx) {
            console.log("Sending payment from from profile, tx: " + tx);
            return tx;
        })
};

Web3Writer.prototype.distributeLicenseBalance = function (licenseAddress, credentialsProvider) {
    return Promise.join(
        this.web3Reader.loadLicense(licenseAddress),
        this.unlockAccount(credentialsProvider),
        function (license, sender) {
            const contract = this.web3Reader.getLicenseContractInstance(licenseAddress);
            const params = { from: sender, gas: 940000 };
            return new Promise(function (resolve, reject) {
                //noinspection JSCheckFunctionSignatures
                // *** RW: This is the same signature
                contract.distributeBalance(params, function (err, tx) {
                    if (err) reject(err);
                    else resolve(tx);
                });
            })
        }.bind(this))
        .then(function (tx) {
            console.log("Distributing balance of " + licenseAddress + ", tx: " + tx);
            return tx;
        });

};

Web3Writer.prototype.ppp = function (licenseAddress, credentialsProvider) {
    return Promise.join(
        this.web3Reader.loadLicense(licenseAddress),
        this.unlockAccount(credentialsProvider),
        function (license, sender) {
            // *** RW: This check seems odd if the app controls the UBI play fees
            if (license.coinsPerPlay > this.maxCoinsPerPlay) {
                throw new Error(`license exceeds max coins per play, ${license.coinsPerPlay} > ${this.maxCoinsPerPlay}`)
            }
            const contract = this.web3Reader.getLicenseContractInstance(licenseAddress);
            // *** RW: const params = { from: sender, value: license.weiPerPlay, gas: 940000 };
            const params = { from: sender, gas: 940000 };
            return new Promise(function (resolve, reject) {
                //noinspection JSCheckFunctionSignatures
                // *** RW: Payment is being sent by the value field but it will automatically be taken by the contract in Skale.  This needs testing for spending approval by the factory
                // *** RW: Should play() be changed to accept a value, license.weiPerPlay, or left to handle this internally without the user?  Approval for the factory to spend coin is needed 
                contract.play(params, function (err, tx) {
                    if (err) reject(err);
                    else resolve(tx);
                });
            })
        }.bind(this))
        .then(function (tx) {
            console.log("Sending ppp, tx: " + tx);
            return tx;
        });
};

// *** RW: How should this be supported now?  Not sending skETH.  Not calling a particular function either.  It should call the Musicoin transfer function directly rather than use .eth.sendTransaction?
Web3Writer.prototype.sendCoins = function (recipient, musicoins, credentialsProvider) {
    return this.unlockAccount(credentialsProvider)
        .then((account) => {
            const params = { to: recipient, from: account, value: this.toIndivisibleUnits(musicoins), gas: 940000 };
            return new Promise(function (resolve, reject) {
                return this.web3.eth.sendTransaction(params, function (err, tx) {
                    if (err) reject(err);
                    else resolve(tx);
                });
            }.bind(this))
        })
        .then(function (tx) {
            console.log("Sending payment: " + tx);
            return tx;
        })
};

/**
 *
 * @param releaseRequest: A JSON object with the following structure
 * {
 *    owner: The address of the contract owner, which will have administrative rights
 *    title: "My Song Title",
 *    profileAddress: <address of the Artist profile contract>,
 *    coinsPerPlay: The number of Musicoins to charge for each stream (e.g. 1)
 *    resourceUrl: A URL indicating the location of the audio resource (e.g. ipfs://<hash>)
 *    metadataUrl: A URL indicating the location of the metadata file (e.g. ipfs://<hash>)
 *    royalties: A JSON array of the fixed amount royalty payments to be paid for each play, where each item has an address and an
 *       amount defined Musicoin, e.g. [{address: 0x111111, amount: 0.5}, {address: 0x222222, amount: 0.1}]
 *    contributors: A JSON array of the proportional amount to be paid for each play and tip, where each item
 *       has an address and an integer number of shares, e.g. [{address: 0x111111, shares: 5}, {address: 0x222222, shares: 3}].
 * }
 * @param credentialsProvider: (optional) The credentials provider.  If this is not provided, the default provider will be used.
 *        Web3Writer#setCredentialsProvider
 * @returns {*|Promise.<tx>} a Promise that resolves to the transaction hash
 */
// example: 0xc03cfa7500b44f238f8324651df9a3c383bca36e
Web3Writer.prototype.releaseLicense = function (releaseRequest, credentialsProvider) {
    // *** RW: Contract version update
    const contractDefinition = this.web3Reader.getContractDefinition(Web3Reader.ContractTypes.PPP, "v1.20210924");

    if (!releaseRequest.owner && credentialsProvider) {
        releaseRequest.owner = credentialsProvider.getCredentials().account;
    }

    // copy all params from releaseRequest and then add some computed params
    // the names should stay close to the contract constructor args
    const params = Object.assign({}, releaseRequest, {
        artistProfileAddress: releaseRequest.profileAddress,
        royalties: releaseRequest.royalties.map(r => r.address),
        royaltyAmounts: releaseRequest.royalties.map(r => r.amount).map(a => this.toIndivisibleUnits(a)),
        contributors: releaseRequest.contributors.map(r => r.address),
        contributorShares: releaseRequest.contributors.map(r => r.shares),
        // *** RW: This should be UBI of 1 and not set by the artist
        weiPerPlay: this.toIndivisibleUnits(releaseRequest.coinsPerPlay),
    });

    return this.releaseContract(contractDefinition, params, credentialsProvider);
};

Web3Writer.prototype.updatePPPLicense = function (releaseRequest, credentialsProvider) {
    // Go through each field and update only if needed.
    // *** RW: Contract version update
    const contractDefinition = this.web3Reader.getContractDefinition(Web3Reader.ContractTypes.PPP, "v1.20210924");
    const contract = this.web3Reader.getContractAt(contractDefinition.abi, releaseRequest.contractAddress);
    releaseRequest.weiPerPlay = this.toIndivisibleUnits(releaseRequest.coinsPerPlay);
    return this.web3Reader.loadLicense(releaseRequest.contractAddress)
        .then(license => {
            return this.unlockAccount(credentialsProvider)
                .then(account => {
                    const titleUpdate = (license.title != releaseRequest.title)
                        ? contract.updateTitleAsync(releaseRequest.title, { from: account, gas: 120000 })
                        : Promise.resolve(null);

                    const imageUpdate = (license.imageUrl != releaseRequest.imageUrl)
                        ? contract.updateImageUrlAsync(releaseRequest.imageUrl, { from: account, gas: 120000 })
                        : Promise.resolve(null);

                    const metadataUpdate = (license.metadataUrl != releaseRequest.metadataUrl)
                        ? contract.updateMetadataUrlAsync(releaseRequest.metadataUrl, { from: account, gas: 120000 })
                        : Promise.resolve(null);

                    const oldContributors = license.contributors.map(c => c.address);
                    const oldShares = license.contributors.map(c => c.shares);

                    const newContributors = releaseRequest.contributors.map(c => c.address);
                    const newShares = releaseRequest.contributors.map(c => c.shares);

                    const distributionUpdate = !ArrayUtils.equals(newContributors, oldContributors)
                        || !ArrayUtils.equals(newShares, oldShares)
                        || license.weiPerPlay != releaseRequest.weiPerPlay
                        ? contract.updateLicenseAsync(
                            releaseRequest.weiPerPlay,
                            newContributors,
                            newShares,
                            { from: account, gas: 240000 })
                        : Promise.resolve(null);

                    return Promise.join(titleUpdate, imageUpdate, metadataUpdate, distributionUpdate, (titleTx, imageTx, metadataTx, distributionTx) => {
                        console.log("Updating PPP contract " + license.title + ", " + releaseRequest.contractAddress);
                        if (titleTx) console.log("title update tx: " + titleTx);
                        if (imageTx) console.log("image update tx: " + imageTx);
                        if (metadataTx) console.log("metadata update tx: " + metadataTx);
                        if (distributionTx) console.log("distribution update tx: " + distributionTx);
                        return {
                            titleTx: titleTx,
                            imageTx: imageTx,
                            metadataTx: metadataTx,
                            distributionTx: distributionTx
                        }
                    })
                });
        })
};

Web3Writer.prototype.releaseArtistProfile = function (releaseRequest, credentialsProvider) {
    // *** RW: Contract version update
    const contractDefinition = this.web3Reader.getContractDefinition(Web3Reader.ContractTypes.ARTIST, "v1.20210924");
    if (releaseRequest.profileAddress) {
        return this.updateArtistProfile(releaseRequest, credentialsProvider);
    }
    else {
        if (!releaseRequest.owner && credentialsProvider) {
            releaseRequest.owner = credentialsProvider.getCredentials().account;
        }
        return this.releaseContract(contractDefinition, releaseRequest, credentialsProvider);
    }
};

Web3Writer.prototype.updateArtistProfile = function (releaseRequest, credentialsProvider) {
    // *** RW: Contract version update
    const contractDefinition = this.web3Reader.getContractDefinition(Web3Reader.ContractTypes.ARTIST, "v1.20210924");
    const contract = this.web3Reader.getContractAt(contractDefinition.abi, releaseRequest.profileAddress);

    return this.unlockAccount(credentialsProvider)
        .bind(this)
        .then((account) => {
            const params = { from: account, gas: 120000 };
            return contract.updateDetailsAsync(
                releaseRequest.artistName,
                releaseRequest.imageUrl,
                releaseRequest.descriptionUrl,
                releaseRequest.socialUrl,
                params)
        }
        )
};

Web3Writer.prototype.releaseContract = function (contractDefinition, releaseRequest, credentialsProvider) {
    return this.unlockAccount(credentialsProvider)
        .then(function (account) {
            return new Promise(function (resolve, reject) {
                const constructorArgs = _extractRequiredProperties(releaseRequest, contractDefinition.constructorArgs);
                const blockNumber = this.web3.eth.blockNumber;
                this.web3.eth.contract(contractDefinition.abi).new(
                    ...constructorArgs,
                    _createNewContractProperties(account, contractDefinition),
                    _createNewContractListener(resolve, reject, account, contractDefinition, blockNumber));
            }.bind(this))
        }.bind(this))
};

Web3Writer.prototype.createAccount = function (pwd) {
    return new Promise(function (resolve, reject) {
        try {
            const newAccount = this.web3.personal.newAccount(pwd);
            return resolve(newAccount);
        } catch (e) {
            reject(e);
        }
    }.bind(this));
};

Web3Writer.prototype.toIndivisibleUnits = function (musicCoins) {
    return this.web3.toWei(musicCoins, 'ether');
};

const _extractRequiredProperties = function (sourceObject, names) {
    return names.map(f => {
        if (!sourceObject.hasOwnProperty(f)) {
            throw Error("Could not find required property: " + f);
        }
        return sourceObject[f];
    })
};

const _createNewContractListener = function (resolve, reject, account, contractDefinition, blockNumber) {
    return function (e, contract) {
        const label = contractDefinition.type + ", version " + contractDefinition.version;
        if (e) {
            console.log("Failed to deploy " + label + ": blockNumber: " + blockNumber + ": " + e);
            reject(e);
        }
        else {
            console.log("Deploying " + label + ", blockNumber: " + blockNumber + ", transactionHash: " + contract.transactionHash + ", contractAddress: " + contract.address);
            resolve(contract.transactionHash);
        }
    }
};

const _createNewContractProperties = function (account, contractDefinition) {
    return {
        from: account,
        data: contractDefinition.code,
        gas: contractDefinition.deploymentGas
    };
};

module.exports = Web3Writer;
