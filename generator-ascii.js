const generator = require("./generators/generator");
const MAX_UINT32 = require('const-max-uint32');

const uuidV1 = require('uuid/v1');
const randomstring = require("randomstring");

const replaceall = require("replaceall");

const fs = require('fs');

var argv = require('yargs').usage('Usage: node $0 [options]')
	.example('node $0 -r 100 -m 36', '// generates a sequence with 100 values (one value [0; 36] per line)')
	.example('node $0 -r 100 -c 52', '// generates sequences with 100 x 52 values (52 comma separated values [0; 51] per line)')
	.example('node $0 -r 100 -c 52 -l 0', '// the same as above and with no progress logs')
	.example('node $0 -r 100 -c 52 -l 200000', '// the same as above and with logs every 200 000 rows')
	.alias('r', 'rows')
	.describe('r', 'Rows (lines) in output file')
	.demandOption(['r'])
	.alias('c', 'cols')
	.describe('c', 'Columns in output file. By default cols = 1. For cols > 1 is used "vertical" test')
	.alias('m', 'maxValue')
	.describe('m', 'Maximally generated value. It is used only when cols = 1. By default the one equals to maximum unsigned int 32 value (2^32 - 1)')
	.alias('l', 'logRow')
	.describe('l', 'Log every l rows generation progress (row number, time from the program running). If l < 1 then logging is disabled. By default l = 100 000')
	.help('h')
	.alias('h', 'help')
	.argv;

const rows  = parseInputNumber(argv.rows, 100);
const cols = parseInputNumber(argv.cols, 1);
const logRow = parseInputNumber(argv.logRow, 100000);
console.log("Sequence rows:", rows);
console.log("Sequence columns:", cols);

const maxValue = parseInputNumber(argv.maxValue, MAX_UINT32);
if (cols == 1) {
	console.log("Max value (including):", maxValue);
}

const outputDir = ".\\out";
const encoding = "ascii";
const outputFile = outputDir + "\\sequence." + generator.algorithm + "." + rows + "x" + cols + "." + maxValue + "." + encoding;
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir);
}
var serverSeed = generateServerSeed(); // is generated for every game session
if (cols == 1) {
	console.log("Server Seed:", serverSeed);
}
const playerWallet = "0x6a0fe2de79f61f2fd2f6caf528e4dec6ff8ef90e";
console.log("Player wallet:", playerWallet);
var algorithm = cols == 1 ? "\'standard\' test" : "\'vertical\' test";
console.log(algorithm, "has chosen");

var wStream = fs.createWriteStream(outputFile, { flags: 'w+', encoding: encoding });

var before = Date.now();

generateAndWrite(1, 1, null, function () {
	wStream.end(function () {
		console.log("The data have written to file:", outputFile, ". Total duration:", Date.now() - before, "ms");
	});
});

function generateAndWrite(iteration, column, deck, callback) {
	while (iteration <= rows) {
		if (cols > 1) {
			if (column == 1) {
				deck = generateDeck(cols);
			}
			while (column <= cols) {
				var clientSeed = generateClientSeed();
				var index = generator.generate(serverSeed, clientSeed, playerWallet, column, cols - column);

				var result = deck[index].toString();
				if (column != cols) {
					result += ",";
				} else if (iteration < rows) {
					result += "\n";
				}
				deck.splice(index, 1);
				column++;
				if (!wStream.write(result)) {
					wStream.once('drain', function () { generateAndWrite(iteration, column, deck, callback); });
					return;
				}
			}
			serverSeed = generateServerSeed();
			iteration++;
			column = 1;
		} else {
			var clientSeed = generateClientSeed();
			var result = generator.generate(serverSeed, clientSeed, playerWallet, iteration, maxValue);
			if (iteration < rows) {
				result += "\n";
			}
			iteration++;
			if (!wStream.write(result.toString())) {
				wStream.once('drain', function () { generateAndWrite(iteration, null, null, callback); });
				return;
			}
		}
		if (logRow > 0 && (iteration % logRow == 0)) {
			console.log("Current row:", iteration, ". Duration:", Date.now() - before, "ms");
		}
	}
	if (iteration > rows) {
		callback();
	}
}

function generateServerSeed() {
	var uuid = uuidV1();
	return replaceall("-", "", uuid);
}

function generateClientSeed() {
	return randomstring.generate({ length: 6, charset: 'alphanumeric' }); // client seed may (and may not) be changed for every random value
}

function generateDeck(size) {
	var deck = new Array();
	for (var i = 0; i < size; i++) {
		deck.push(i);
	}
	return deck;
}

function parseInputNumber(input, defaultValue) {
	if (input != null) {
		if (Number.isInteger(input)) {
			return input;
		}
		console.log("Parameter \"", input, "\" has to be natural number");
		process.exit();
	}
	return defaultValue;
}