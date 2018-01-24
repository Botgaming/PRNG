# PRNG
The Pseudo Random Number Generator (PRNG) is based on SHA-512 hash algorithm. Target pseudorandom value is calculated such way:

**_mod(int(sha512(serverSeed + clientSeed + playerWallet + nonce)), maxValue)_**,
 
 where <br />
* **_mod()_** – is a modulus operation (take a remainder from division on integer value maxValue);
* **_maxValue_** - is a natural number, which is an upper bound of target pseudorandom number (in our application it is usually has no more 100 value);
* **_int()_** – is a converting operation from hexadecimal string to integer value;
* **_sha512()_** – is the SHA-512 hash calculation operation from the target string (serverSeed + clientSeed + playerWallet + nonce);
* **_serverSeed_** – is a symbolic string, which is initialized with UUID (Universally Unique Identifier - 32 symbolic string without dashes) every first game cycle of the game session. Inside every successive game cycle in the same game session serverSeed will be initialized with sha512 function from previous serverSeed value (sha512(serverSeed)). Game session is considered as an interval between a player starts and ends a game. Game cycle is considered as distribution of card deck (decks) for card games and as one spin for slot games;
* **_clientSeed_** - is an alphanumeric value with length from 4 to 32 symbols. This value may (or may not by a player desire) be changed on every pseudorandom number;
* **_playerWallet_** - is an ethereum wallet address (20 bytes sequence which is represented as 42 symbolic hexadecimal string with 0x prefix). Example: 0x6a0fe2de79f61f2fd2f6caf528e4dec6ff8ef90e;
* **_nonce_** - is a natural number, inside one game session it is unique and every next value is more than previous one (next value may equal to incremented previous one);

In general terms serverSeed is required to avoid a prediction of generator result from a player side, clientSeed - to exclude possibility of influence on open source generator result from a server, playerWallet provides uniqueness of generated sequences between different players (for multiple players games) through the same game session, nonce provides uniqueness of the generator bias (seed) through single game session in cases when clientSeed is not changed "enough".

PRNG implementation is contained in **_generators/generator.js_** file.

### PRNG Testing
To test PRNG was used famous Random Number Test Suite which is called Dieharder Version 3.31.1 (Robert G. Brown (rgb), Dirk Eddelbuettel, David Bauer). The one implements main diehard and NIST tests. For more information about Dieharder see http://webhome.phy.duke.edu/~rgb/General/dieharder.php. <br />
Test sequence for the suite was produced by the PRNG and contained 1 000 000 000 (one billion) unsigned integer values in binary format. <br />
A module to generate test sequence is contained in **_generator-bin.js_** file.

### PRNG Test Results
Test results of the Dieharder suite are represented in: <br />
https://github.com/Botgaming/PRNG/blob/master/test-results/sequence.sha512.1000000000.4294967295.results.txt, <br />
where it could be seen that all tests were **passed**.
