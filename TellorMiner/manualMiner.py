import web3,json
import binascii
from web3 import Web3
import requests,json, time,random
import pandas as pd
import hashlib
from Naked.toolshed.shell import execute_js, muterun_js, run_js
contract_address = "0xDae06771E342fc7A8BddBe9b159bB9fa8cE4D626";
node_url ="http://localhost:8545" #https://rinkeby.infura.io/
net_id = 4 #eth network ID
last_block = 0
challenge = '0x64966a8be800bd7d993d125a07e5fd93ae291e65f65bd53ae3a03558e4f40dc2'
apiId = 5
difficulty =1
apiString =  'json(https://api.gdax.com/products/BTC-USD/ticker).price'
granularity = 10000
public_keys = ["0xe037ec8ec9ec423826750853899394de7f024fee","0xcdd8fa31af8475574b8909f135d510579a8087d3","0xb9dd5afd86547df817da2d0fb89334a6f8edd891","0x230570cd052f40e14c14a81038c6f3aa685d712b","0x3233afa02644ccd048587f8ba6e99b3c00a34dcc"]
private_keys = ["4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16","d32132133e03be292495035cf32e0e2ce0227728ff7ec4ef5d47ec95097ceeed","d13dc98a245bd29193d5b41203a1d3a4ae564257d60e00d6f68d120ef6b796c5","4beaa6653cdcacc36e3c400ce286f2aefd59e2642c2f7f29804708a434dd7dbe","78c1c7e40057ea22a36a0185380ce04ba4f333919d1c5e2effaf0ae8d6431f14"]


def generate_random_number():
    return random.randint(1000000,9999999)

def mine(challenge, public_address, difficulty):
	global last_block, contract_address
	x = 0;
	while True:
		x += 1;
		j = generate_random_number()
		nonce = Web3.toHex(str.encode(str(j)))
		_string = str(challenge).strip() + public_address[2:].strip() + str(nonce)[2:].strip()
		v = Web3.toHex(Web3.sha3(hexstr=_string));
		z= hashlib.new('ripemd160',bytes.fromhex(v[2:])).hexdigest()
		n = "0x" + hashlib.new('sha256',bytes.fromhex(z)).hexdigest()
		hash1 = int(n,16);
		if hash1 % difficulty == 0:
			print(j)
			print(challenge)
			print(_string)
			print(hash1)
			return j;
		if x % 10000 == 0:
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			_block = int(d['result'],16)

def getAPIvalue(_api):
	_api = _api.replace("'", "")
	print('Getting : ',_api)
	json = _api.split('(')[0]
	print(json)
	if('json' in json):
		_api = _api.split('(')[1]
		filter = _api.split(').')[1]
	_api = _api.split(')')[0]
	try:
		response = requests.request("GET", _api)
	except:
		response = 0;
		print('API ERROR',_api)
	if('json' in json):
		if(len(filter)):
			price =response.json()[filter]
		else:
			price = response.json()
	else:
		price = response
	print(price)
	return int(float(price))

# def getAPIvalue():
# 	url = "https://api.gdax.com/products/BTC-USD/ticker"
# 	response = requests.request("GET", url)
# 	price =response.json()['price']
# 	return int(float(price))

def masterMiner():
	miners_started = 0
	while True:
		nonce = mine(str(challenge),public_keys[miners_started],difficulty);
		print('n',nonce);
		if(nonce > 0):
			print ("You guessed the hash!");
			value = max(0,(5000- miners_started*10) * granularity);
			#value = max(0,(getAPIvalue(apiString) - miners_started*10) * granularity); #account 2 should always be winner
			arg_string =""+ str(nonce) + " "+ str(apiId) +" " + str(value)+" "+str(contract_address)+" "+str(public_keys[miners_started])+" "+str(private_keys[miners_started])
			print(arg_string)
			#success = execute_js('testSubmitter.js',arg_string)
			#print('WE WERE SUCCESSFUL: ', success)
			run_js('rinkebySubmitter.js',arg_string);
			miners_started += 1 
			if(miners_started == 5):
				break
		else:
			break
	print('Miner Stopping')

def jsonParser(_info):
	my_json = _info.content
	data = json.loads(my_json)
	s = json.dumps(data, indent=4, sort_keys=True)
	return json.loads(s)


#getVariables()
masterMiner();
#getAddress();
#getAPIvalue('json(https://api.gdax.com/products/BTC-USD/ticker).price')
