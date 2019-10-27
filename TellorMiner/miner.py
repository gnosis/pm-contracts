import web3,json
import binascii
from web3 import Web3
import requests,json, time,random
import hashlib
from Naked.toolshed.shell import execute_js

contract_address = "";
node_url ="http://localhost:8545" #https://rinkeby.infura.io/
net_id = 60 #eth network ID
last_block = 0

public_keys = ["0xe037ec8ec9ec423826750853899394de7f024fee"]
private_keys = ["4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16"]

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
			return j;
		if x % 10000 == 0:
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			_block = int(d['result'],16)
			if(last_block != _block):
				_challenge,_apiId,_difficulty,_apiString = getVariables();
				if challenge != _challenge:
					return 0;

def getAPIvalue(_api):
	_api = _api.replace("'", "")
	print('Getting : ',_api)
	json = _api.split('(')[0]
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

def masterMiner():
	challenge,apiId,difficulty,apiString = getVariables();
	while True:
		nonce = mine(str(challenge),public_keys[miners_started],difficulty);
		if(nonce > 0):
			print ("You guessed the hash!");
			value = getAPIvalue(apiString) - miners_started*10; #account 2 should always be winner
			arg_string =""+ str(nonce) + " "+ str(apiId) +" " + str(value)+" "+str(contract_address)+" "+str(public_keys[miners_started])+" "+str(private_keys[miners_started])
			print(arg_string)
			success = execute_js('testSubmitter.js',arg_string)
			v = False;
			while(v == False):
				time.sleep(2);
				_challenge,_apiId,_difficulty,_apiString = getVariables();
				if challenge == _challenge:
					v = False
					time.sleep(5);
				elif _apiId > 0:
					v = True
					challenge = _challenge;
					apiId = _apiId;
					difficulty = _difficulty;
					apiString = _apiString;
		else:
			challenge,apiId,difficulty,apiString = getVariables(); 
	print('Miner Stopping')

def getVariables():
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_call","params":[{"to":contract_address,"data":"0x94aef022"}, "latest"]}
	r = requests.post(node_url, data=json.dumps(payload));
	val = jsonParser(r);
	print(val)
	val = val['result'];
	_challenge = val[:66]
	val = val[66:]
	_apiId = int(val[:64],16)
	val = val[64:]
	_difficulty = int(val[:64],16);
	val =val[64:]
	val =val[64:]
	val =val[64:]
	val = val[:-16]
	_apiString =  str(binascii.unhexlify(val.strip()))
	return _challenge,_apiId,_difficulty,_apiString

def jsonParser(_info):
	my_json = _info.content
	data = json.loads(my_json)
	s = json.dumps(data, indent=4, sort_keys=True)
	return json.loads(s)

#getVariables()
masterMiner();
#getAPIvalue('json(https://api.gdax.com/products/BTC-USD/ticker).price')