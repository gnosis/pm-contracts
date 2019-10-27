

const Web3 = require("web3");
const fs = require('fs');
const Tx = require('ethereumjs-tx')
var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545/'))
var json = require('../build/contracts/Tellor.json');

apiId = process.argv[2] - 0
value = process.argv[3] - 0
var address = process.argv[4];
var abi = json.abi;
var account = process.argv[5];
var privateKey = Buffer.from(process.argv[6], 'hex');
let myContract = new web3.eth.Contract(abi,address);
let data = myContract.methods.addTip(apiId,value).encodeABI();


web3.eth.getTransactionCount(account, function (err, nonce) {
     var tx = new Tx({
      nonce: nonce,
      gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
      gasLimit: 2000000,
      to: address,
      value: 0,
      data: data,
    });
    tx.sign(privateKey);

    var raw = '0x' + tx.serialize().toString('hex');
    web3.eth.sendSignedTransaction(raw).on('transactionHash', function (txHash) {
      }).on('receipt', function (receipt) {
          console.log("receipt:" + receipt);
      }).on('confirmation', function (confirmationNumber, receipt) {
      }).on('error', function (error) {
    });
  });
