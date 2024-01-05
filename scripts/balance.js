const Web3 = require('web3');
const web3Eth = new Web3('http://127.0.0.1:8545');
const web3Bsc = new Web3('http://127.0.0.1:8546');

const TokenEth = require('../build/contracts/TokenEth.json');
const TokenBsc = require('../build/contracts/TokenBsc.json');

const tokenEth = new web3Eth.eth.Contract(
    TokenEth.abi,
    TokenEth.networks['5777'].address
);
const tokenBsc = new web3Bsc.eth.Contract(
    TokenBsc.abi,
    TokenBsc.networks['5778'].address
);

(async () => {
    const accounts = await web3Eth.eth.getAccounts();
    const account = accounts[0];

    const balanceEth = await tokenEth.methods.balanceOf(account).call();
    const balanceBsc = await tokenBsc.methods.balanceOf(account).call();

    console.log(`Balance on ETH: ${balanceEth.toString()}`);
    console.log(`Balance on BSC: ${balanceBsc.toString()}`);
})()