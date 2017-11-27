const generator = require("./generators/generator");
const MAX_UINT32 = require( 'const-max-uint32');

const uuidV1 = require('uuid/v1');
const randomstring = require("randomstring");

const replaceall = require("replaceall");
const fs = require('fs');


const uuid = uuidV1();
const serverSeed = replaceall("-", "", uuid); // is generated for every game session
console.log("Server Seed:", serverSeed);

const playerWallet = "0x6a0fe2de79f61f2fd2f6caf528e4dec6ff8ef90e";
console.log("Player wallet:", playerWallet);

// binary sequence generation parameters (length, module, outputDir etc)
const length = 1000000000; // 1kkk
// const length = 1000;
console.log("Sequence length:", length);

const mod = MAX_UINT32;
console.log("Module:", mod);

const outputDir = ".\\out";
const outputFile = outputDir + "\\sequence." + generator.algorithm + "." + length + "." + mod + ".bin";
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}

fs.open(outputFile, 'w', function (status, fd) {
	if (status) {
		console.log(status.message);
		return;
	}
	var before = Date.now();
	var buffer = new Buffer(4000000);
	var offset = 0;
	for (var nonce = 0; nonce < length; nonce++) {
		// client seed may (and may not) be changed for every random value
		var clientSeed = randomstring.generate({
			length: 4,
			charset: 'alphanumeric'
		});

		var result = generator.generate(serverSeed, clientSeed, playerWallet, nonce, mod);

		buffer.writeUInt32LE(result, offset);
		offset += 4;
		if ((nonce + 1) % 200000 == 0) {
			console.log("nonce:", nonce + 1, ". Duration:", Date.now() - before, "ms");
		}
		if (offset == buffer.length) {
			fs.writeSync(fd, buffer, 0, buffer.length, null);
			offset = 0;
		}
	}
	if (offset != 0) {
		fs.writeSync(fd, buffer, 0, offset, null);
	}
	fs.closeSync(fd);
	console.log("The data have written to file:", outputFile, ". Total duration:", Date.now() - before, "ms");
	//printBinValues(outputFile);
});

// print int 32 values from binary file to control written data
function printBinValues(filePath) {
	const stats = fs.statSync(filePath);
	const fileSizeInBytes = stats.size;
	fs.open(filePath, 'r', function (status, fd) {
		if (status) {
			console.log(status.message);
			return;
		}
		var buffer = new Buffer(fileSizeInBytes);
		fs.read(fd, buffer, 0, buffer.length, 0, function (err, data) {
			if (err) {
				throw err;
			}
			for (var i = 0; i < fileSizeInBytes; i += 4) {
				var value = buffer.readUInt32LE(i);
				console.log(value);
			};
		});
	});
}
