const Web3 = require('web3');
const web3Eth = new Web3('ws://127.0.0.1:8545');
const web3Bsc = new Web3('ws://127.0.0.1:8546');

const BridgeEth = require('../build/contracts/BridgeEth.json');
const BridgeBsc = require('../build/contracts/BridgeBsc.json');

const bridgeEth = new web3Eth.eth.Contract(
    BridgeEth.abi,
    BridgeEth.networks['5777'].address
);
const bridgeBsc = new web3Bsc.eth.Contract(
    BridgeBsc.abi,
    BridgeBsc.networks['5778'].address
);

bridgeEth.events.Transfer({ fromBlock: 0, step: 0 })
    .on('data', async event => {
        const accounts = await web3Eth.eth.getAccounts();
        const { from, to, amount, date, nonce, signature } = event.returnValues;
        const tx = bridgeBsc.methods.mint(from, to, amount, nonce, signature);
        const [gasPrice, gasCost] = await Promise.all([
            web3Bsc.eth.getGasPrice(),
            tx.estimateGas({ from: accounts[0] }),
        ]);
        const data = tx.encodeABI();
        const txData = {
            from: accounts[0],
            to: bridgeBsc.options.address,
            data: data,
            gas: gasCost,
            gasPrice: gasPrice
        };
        const receipt = await web3Bsc.eth.sendTransaction(txData);
        console.log(`Transaction hash: ${receipt.transactionHash}`);
        console.log(`Processed transfer: - from ${from} - to ${to} - amount ${amount} tokens - date ${date} - nonce ${nonce}`);
    });