pragma solidity ^0.4.2;
contract PayPerPlay {
    string public constant contractVersion = "v0.7";


    uint constant gasRequiredForFallback = 41000;
    uint constant gasRequiredForLogging = 2000;
    uint constant gasRequiredForSend = 3000;
    uint constant gasPerRecipient = gasRequiredForFallback + gasRequiredForSend + gasRequiredForLogging;
    uint constant distributeOverhead = 100000;

    address public owner;
    address public createdBy;
    string public title;
    string public artistName;
    address public artistProfileAddress;
    string public resourceUrl; // e.g. ipfs://<hash>
    bytes32 public contentType;
    string public metadataUrl;
    string public imageUrl;

    // license information
    uint public weiPerPlay;

    // proportional payments (dependent on weiPerPlay or tip size)
    address[] public contributors;
    uint[] public contributorShares;
    uint public totalShares;

    // book keeping
    mapping(address => uint) public pendingPayment;
    uint public playCount;
    uint public totalEarned;
    uint public tipCount;
    uint public totalTipped;
    uint public totalPending;
    uint public licenseVersion;
    uint public metadataVersion;
    uint distributionGasEstimate;

    // events
    event playEvent(uint plays);
    event tipEvent(uint plays, uint tipCount);
    event paymentPending(address recipient, uint amount);
    event distributionPending(uint gasReceived, uint amountReceived);
    event licenseUpdateEvent(uint version);
    event transferEvent(address oldOwner, address newOwner);
    event resourceUpdateEvent(string oldResource, string newResource);
    event titleUpdateEvent(string oldTitle, string newTitle);
    event artistNameUpdateEvent(string oldArtistName, string newArtistName);
    event imageUpdateEvent(string oldImage, string newImage);
    event metadataUpdateEvent(string oldMetadata, string newMetadata);
    event artistProfileAddressUpdateEvent(address oldArtistAddress, address newArtistAddress);

    // event paymentDistributionEvent(uint amount);
    // event gasDistributionEvent(uint gas);

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Title", "Arist", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 1000000, "ipfs://resourceQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "audio/mp3", "ipfs://imagefbFQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "ipfs://metadataQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", ["0x11111", "0x22222", "0x33333"], [1, 1, 1]
    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Title", "Arist", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 1000000, "ipfs://resourceQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "audio/mp3", "ipfs://imagefbFQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", "ipfs://metadataQcjacL3jCvY53MrU6hDBhyW4VjzQqSEoUcEPez", ["0xef55bfac4228981e850936aaf042951f7b146e41", "0x11111", "0x22222", "0x33333"], [1, 1, 1, 1]
    function PayPerPlay(
            address _owner,
            string _title,
            string _artistName,
            address _artistProfileAddress,
            uint _weiPerPlay,
            string _resourceUrl,
            bytes32 _contentType,
            string _imageUrl,
            string _metadataUrl,
            address[] _contributors,
            uint[] _contributorShares) {
        title = _title;
        artistName = _artistName;
        contentType = _contentType;
        artistProfileAddress = _artistProfileAddress;

        createdBy = msg.sender;
        resourceUrl = _resourceUrl;
        metadataUrl = _metadataUrl;
        imageUrl = _imageUrl;

        // allow creator to call this function once during initialization
        owner = msg.sender;
        updateLicense(_weiPerPlay,
            _contributors, _contributorShares);

        // now set the real owner
        owner = _owner;
    }

    modifier adminOnly {
        if (msg.sender != owner) throw;
        _;
    }

    function () payable {
        // if possible, forward the balance on to recipients
        if (msg.gas > distributionGasEstimate) {
            distributePayment(msg.value);
        }
        else {
            distributionPending(msg.gas, msg.value);
        }
    }

    function tip() payable {
        distributePayment(msg.value);

        tipCount++;
        totalTipped += msg.value;
        totalEarned += msg.value;
    }

    function getContributorsLength() public constant returns(uint) {
        return contributors.length;
    }

    function play() payable {
        if (msg.value < weiPerPlay) throw;

        // users can only purchase one play at a time.  don't steal their money
        var toRefund = msg.value - weiPerPlay;

        // I believe there is minimal risk in calling the sender directly, as it
        // should not be able to stall the contract for any other callers.
        if (toRefund > 0 && !msg.sender.send(toRefund)) {
            throw;
        }

        distributePayment(weiPerPlay);
        totalEarned += weiPerPlay;
        playCount++;

        playEvent(playCount);
    }

    /*
     * Forces a payment attempt if there is any amount owed to the given address.
     * Can be called by anyone.
     *
     * We cannot use msg.sender because the recipient may be a contract.  If the contract
     * does not integrate with the PPP "collectPendingPayment" method, then funds will be
     * trapped.
     *
     * Although this seems wrong, I cannot think of any reason why it would be a problem.  If there
     * is any value in pendingPayment, it must be because we already tried to call the contract.
     * Additionally, any calls to PPP will again try to call the contract (and PPP can be initiated
     * by anyone as well).
     *
     * Also note that I am not using send, because if the calling contract requires a lot of gas, I would
     * like the caller to be able to supply as much as needed.
     */
    function collectPendingPayment(address recipient) {
        var toSend = clearPendingPayment(recipient);

        // using call instead of send to allow gas forwarding
        if (toSend > 0 && !recipient.call.value(toSend)()) {
            throw;
        }
    }

    /*** Admin functions ***/

    /**
     * Take the payment pending for the given recipient and sends it to
     * the provided address.  This is provided in case the recipient cannot
     * recieve funds (failed contract)
     */
    function transferPendingPayments(address recipient, address destination) adminOnly {
        var toSend = clearPendingPayment(recipient);

        // using call instead of send to allow gas forwarding
        if (toSend > 0 && !destination.call.value(toSend)()) {
            throw;
        }
    }

    function transferOwnership(address newOwner) adminOnly {
        address oldOwner = owner;
        owner = newOwner;
        transferEvent(oldOwner, newOwner);
    }

    function updateTitle(string newTitle) adminOnly {
        string memory oldTitle = newTitle;
        title = newTitle;
        titleUpdateEvent(oldTitle, newTitle);
    }

    function updateArtistName(string newArtistName) adminOnly {
        string memory oldArtistName = newArtistName;
        artistName = newArtistName;
        artistNameUpdateEvent(oldArtistName, newArtistName);
    }

    function updateResourceUrl(string newResourceUrl) adminOnly {
        string memory oldResourceUrl = resourceUrl;
        resourceUrl = newResourceUrl;
        resourceUpdateEvent(oldResourceUrl, newResourceUrl);
    }

    function updateImageUrl(string newImageUrl) adminOnly {
        string memory oldImageUrl = imageUrl;
        imageUrl = newImageUrl;
        imageUpdateEvent(oldImageUrl, newImageUrl);
    }

    function updateArtistAddress(address newArtistAddress) adminOnly {
        address oldArtistAddress = artistProfileAddress;
        artistProfileAddress = newArtistAddress;
        artistProfileAddressUpdateEvent(oldArtistAddress, newArtistAddress);
    }

    function updateMetadataUrl(string newMetadataUrl) adminOnly {
        string memory oldMetadataUrl = metadataUrl;
        metadataUrl = newMetadataUrl;
        metadataVersion++;
        metadataUpdateEvent(oldMetadataUrl, newMetadataUrl);
    }

    /*
     * Updates share allocations.  All old allocations are over written
     */
    function updateLicense(uint _weiPerPlay,
        address[] _contributors, uint[] _contributorShares) adminOnly {

        if (_contributors.length != _contributorShares.length) throw;

        weiPerPlay = _weiPerPlay;
        contributors = _contributors;
        contributorShares = _contributorShares;
        totalShares = 0;

        for (uint c=0; c < contributors.length; c++) {
            totalShares += contributorShares[c];
        }

        // sanity checks

        // watch out for division by 0 if totalShares == 0
        if (totalShares == 0 && contributors.length > 0)
            throw;

        distributionGasEstimate = estimateGasRequired(contributors.length);
        licenseVersion++;
        licenseUpdateEvent(licenseVersion);
    }

    function distributeBalance() adminOnly {
        distributePayment(this.balance);
    }

    function kill(bool _distributeBalanceFirst) adminOnly {
        if (_distributeBalanceFirst) {
            distributeBalance(); // is there any risk here?
        }
        selfdestruct(owner);
    }

    /*** internal ***/
    bool private distributionReentryLock;
    modifier withDistributionLock {
        if (distributionReentryLock) throw;
        distributionReentryLock = true;
        _;
        distributionReentryLock = false;
    }

    function estimateGasRequired(uint _recipients) internal constant returns(uint) {
        return distributeOverhead + _recipients*gasPerRecipient;
    }

    function distributePayment(uint _total) withDistributionLock internal {
        for (uint c=0; c < contributors.length; c++) {
            distributePaymentTo(_total, c);
        }
    }

    function distributePaymentTo(uint _total, uint cIdx) internal {
        var amount = (contributorShares[cIdx] * _total) / totalShares;
        var contributorAddress = contributors[cIdx];

        // estimate the amount of gas needed for the rest of the contributors
        // (not including this one), then add on the gas we might need if the call
        // fails.
        var reserved = estimateGasRequired(contributors.length-cIdx-1) + gasRequiredForFallback;
        if (amount > 0 && !trySend(contributorAddress, amount, reserved)) {
            addPendingPayment(contributorAddress, amount);
        }
    }

    /**
     * If possible, call the recipient and provide some gas in case the recipeint
     * is also a contract.  Otherwise, just call send
     */
    function trySend(address recipient, uint amount, uint reserved) internal returns(bool) {
        if (msg.gas > reserved) {
           return recipient.call.gas(msg.gas - reserved).value(amount)();
        }
        else {
           return recipient.send(amount);
        }
    }

    function addPendingPayment(address recipient, uint amount) internal {
        pendingPayment[recipient] += amount;
        totalPending += amount;
        paymentPending(recipient, amount);
    }

    function clearPendingPayment(address recipient) internal returns(uint) {
        var amount = pendingPayment[recipient];
        pendingPayment[recipient] = 0;
        totalPending -= amount;
        return amount;
    }
}