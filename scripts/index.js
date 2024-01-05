const Web3 = require('web3');
const web3Eth = new Web3('http://127.0.0.1:8545');
const web3Bsc = new Web3('http://127.0.0.1:8546');

const BridgeEth = require('../build/contracts/BridgeEth.json');
const BridgeBsc = require('../build/contracts/BridgeBsc.json');

const keys = require("../keys.json")

const bridgeEth = new web3Eth.eth.Contract(
    BridgeEth.abi,
    BridgeEth.networks['5777'].address
);
const bridgeBsc = new web3Bsc.eth.Contract(
    BridgeBsc.abi,
    BridgeBsc.networks['5778'].address
);

const getPrivateKey = (address) => {
    return keys.private_keys[address.toLowerCase()]
}

const nonce = 2;
(async () => {
    const accounts = await web3Eth.eth.getAccounts();
    const account = accounts[0];

    const privatekey = getPrivateKey(account);
    const amount = 95;
    const message = web3Eth.utils.soliditySha3(
        { t: 'address', v: account },
        { t: 'address', v: account },
        { t: 'uint256', v: amount },
        { t: 'uint256', v: nonce },
    ).toString('hex');
    const { signature } = web3Eth.eth.accounts.sign(
        message,
        privatekey
    );
    const tx = await bridgeEth.methods.burn(account, amount, nonce, signature)
    const [gasPrice, gasCost] = await Promise.all([
        web3Eth.eth.getGasPrice(),
        tx.estimateGas({ from: account }),
    ]);
    const data = tx.encodeABI();
    const txData = {
        from: account,
        to: bridgeEth.options.address,
        data: data,
        gas: gasCost,
        gasPrice: gasPrice
    };
    const receipt = await web3Eth.eth.sendTransaction(txData);
    console.log(`Transfer Transaction hash: ${receipt.transactionHash}`);
})()