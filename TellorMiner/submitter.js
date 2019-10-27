
/*To do list
Automatically submit from python / cython
Get gas price automatically
Get more specific gasLimit

*/
const Web3 = require("web3");
const Tx = require('ethereumjs-tx')
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'))
var json = require('../build/contracts/Oracle.json');

var privateKey = Buffer.from(process.argv[7], 'hex');
let myContract = new web3.eth.Contract(json.abi,process.argv[5]);
let data = myContract.methods.submitMiningSolution(process.argv[2],process.argv[3] - 0,process.argv[4] - 0).encodeABI();

  web3.eth.getTransactionCount(process.argv[6], function (err, nonce) {
     var tx = new Tx({
      nonce: nonce,
      gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
      gasLimit: 1000000,
      to: process.argv[5],
      value: 0,
      data: data,
    });
    tx.sign(privateKey);

    var raw = '0x' + tx.serialize().toString('hex');
    web3.eth.sendSignedTransaction(raw).on('transactionHash', function (txHash) {
      }).on('receipt', function (receipt) {
      }).on('confirmation', function (confirmationNumber, receipt) {
      }).on('error', function (error) {
        console.log(error);
    });
  });
