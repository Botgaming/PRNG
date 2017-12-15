const bigInt = require("big-integer");
const sha512 = require('js-sha512');

module.exports.generate = function (serverSeed, clientSeed, playerWallet, nonce, maxValue) {
	var hash = sha512(serverSeed + clientSeed + playerWallet + nonce);
	var hashInt = bigInt(hash, 16);
	var result = hashInt.mod(maxValue + 1).value;

	return result;
};

module.exports.algorithm = "sha512";