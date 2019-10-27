import web3,json
import binascii
from web3 import Web3
import requests,json, time,random
import hashlib
from Naked.toolshed.shell import execute

'''
This miner is to be run with the demo.  
It mines values and then has random parties submit requests for data
It loops through 10 different API's
and also requests data and adds tips to them
'''
contract_address = "0x2B63d6e98E66C7e9fe11225Ba349B0B33234D9A2";
node_url ="http://localhost:8545" #https://rinkeby.infura.io/
net_id = 60 #eth network ID
last_block = 0
openApiIds = [1]
symbols = ["BTCUSD","ETHUSD","LTCBTC","USDCBNB","ETHBTC","BTCUSDT","BNBBTC","BNBBTC","BNBTUSD","XRPTUSD"]
sleep_between_mines =10;#number of seconds between mines
public_keys = ["0xe037ec8ec9ec423826750853899394de7f024fee","0xcdd8fa31af8475574b8909f135d510579a8087d3","0xb9dd5afd86547df817da2d0fb89334a6f8edd891","0x230570cd052f40e14c14a81038c6f3aa685d712b","0x3233afa02644ccd048587f8ba6e99b3c00a34dcc"]
private_keys = ["4bdc16637633fa4b4854670fbb83fa254756798009f52a1d3add27fb5f5a8e16","d32132133e03be292495035cf32e0e2ce0227728ff7ec4ef5d47ec95097ceeed","d13dc98a245bd29193d5b41203a1d3a4ae564257d60e00d6f68d120ef6b796c5","4beaa6653cdcacc36e3c400ce286f2aefd59e2642c2f7f29804708a434dd7dbe","78c1c7e40057ea22a36a0185380ce04ba4f333919d1c5e2effaf0ae8d6431f14"]
miners_started = 0;
challenge = 0
apis = ["json(https://api.gdax.com/products/BTC-USD/ticker).price",
"json(https://api.gdax.com/products/ETH-USD/ticker).price",
"json(https://api.binance.com/api/v3/ticker/price?symbol=LTCBTC).price",
"json(https://api.binance.com/api/v3/ticker/price?symbol=USDCBNB).price",
"json(https://api.binance.com/api/v3/ticker/price?symbol=ETHBTC).price",
"json(https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT).price",
"json(https://api.binance.com/api/v3/ticker/price?symbol=BNBBTC).price",
"json(https://api.binance.com/api/v3/ticker/price?symbol=BNBTUSD).price",
"json(https://api.binance.com/api/v3/ticker/price?symbol=XRPTUSD).price"] #whats the standard way to do this?
granularities = [1,10,100,1000,1000000]
queryList = ["json(https://api.gdax.com/products/BTC-USD/ticker).price1000"]




def generate_random_number():
    return random.randint(1000000,9999999)


def requestData():
	print("Requesting Data..")
	requests = random.randint(1,3)
	for x in range(requests):
		num = random.randint(0,len(apis)-1)
		apiString= apis[num]
		symbol = symbols[num]
		granularity = granularities[random.randrange(len(granularities))]
		tip = random.randint(0,10000)
		apiId = 0;
		j = random.randint(0,4)
		arg_string ="\""+ apiString + "\" "+ symbol +" " + str(apiId)+" "+str(granularity)+" "+str(tip)+" "+str(contract_address)+" "+str(public_keys[j])+" "+str(private_keys[j])
		print('Request_ID  - ',str(apiId),' , Tip - ',str(tip))
		execute("node requestData.js "+arg_string);
		query = apis[num] + str(granularity)
		if query not in queryList:
			print("New Request - ",query)
			print("New Request ID - ",len(openApiIds) + 1)
			queryList.append(query);
			openApiIds.append(len(openApiIds) + 1);
	return



def addToTip():
	print("Adding Tips..")
	tips = random.randint(1,3)
	for x in range(tips):
		rand_api= random.randint(0,len(openApiIds)-1)
		value = random.randint(0,10000)
		j = random.randint(0,4)
		apiId = openApiIds[rand_api]
		arg_string =""+ str(apiId) +" " + str(value)+" "+str(contract_address)+" "+str(public_keys[j])+" "+str(private_keys[j])
		print('Request_ID  - ',str(apiId),' , Tip - ',str(value))
		execute("node addTip.js "+arg_string);
	return




def getSolution(challenge, public_address, difficulty):
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
def mine():
	global miners_started
	print("Mining..")
	apiId = 0
	challenge = 0
	while apiId < 1:
		_challenge,_apiId,difficulty,apiString,granularity = getVariables();
		print('Variable String',_challenge,_apiId,difficulty,apiString,granularity)
		apiId = _apiId
		challenge = _challenge
		time.sleep(5);
	while apiId == _apiId and challenge == _challenge:
		nonce = getSolution(str(challenge),public_keys[miners_started],difficulty);
		if(nonce > 0):
			value = max(0,(getAPIvalue(apiString)) * granularity); #account 2 should always be winner
			arg_string =""+ str(nonce) + " "+ str(apiId) +" " + str(value)+" "+str(contract_address)+" "+str(public_keys[miners_started])+" "+str(private_keys[miners_started])
			execute("node testSubmitter.js "+arg_string);
			if miners_started == 4:
				miners_started = 0
			else:
				miners_started += 1
			_challenge,_apiId,difficulty,apiString,granularity = getVariables();
		else:
			Print("No nonce found");
			return
	print ("New Value Secured - ", value);
	return;

def getMinersStarted():
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_call","params":[{"to":contract_address,"data":"0xa22e407a"}, "latest"]}
	r = requests.post(node_url, data=json.dumps(payload));
	val = jsonParser(r);
	val = val['result'];
	return int(val,16);


def getAPIvalue(_api):
	_api = _api.replace("'", "")
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
		return 0
	if('json' in json):
		if(len(filter)):
			allFilters = filter.split(".")
			price = response.json()
			i = 0
			while i < len(allFilters):
				if('/' in allFilters[i]):
					allFilters[i] =allFilters[i].replace("/", ".")
					allFilters[i+1] = allFilters[i] + allFilters[i+1]
					i += 1
				price =price[allFilters[i].replace("___"," ")]
				i += 1
		else:
			price = response.json()
	else:
		price = response
	return int(float(price))

def getVariables():
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_call","params":[{"to":contract_address,"data":"0xa22e407a"}, "latest"]}
	r = requests.post(node_url, data=json.dumps(payload));
	val = jsonParser(r);
	val = val['result'];
	_challenge = val[:66]
	val = val[66:]
	_apiId = int(val[:64],16)
	val = val[64:]
	_difficulty = int(val[:64],16);
	val =val[64:]
	val =val[64:]
	_granularity = int(val[:64],16);
	val =val[64:]
	val =val[64:]
	val = val[:-16]
	_apiString =  str(binascii.unhexlify(val.strip())).replace("\\","").replace('x00',"")
	return _challenge,_apiId,_difficulty,_apiString,_granularity

def jsonParser(_info):
	my_json = _info.content
	data = json.loads(my_json)
	s = json.dumps(data, indent=4, sort_keys=True)
	return json.loads(s)

def getAddress():
	global last_block, contract_address
	payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_blockNumber"}
	r = requests.post(node_url, data=json.dumps(payload));
	e = jsonParser(r);
	block = int(e['result'],16)
	while(block > last_block):
		print('block',block);
		try:
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_getTransactionByBlockNumberAndIndex","params":[hex(block),0]}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			tx = d['result']
			payload = {"jsonrpc":"2.0","id":net_id,"method":"eth_getTransactionReceipt","params":[tx['hash']]}
			r = requests.post(node_url, data=json.dumps(payload));
			d = jsonParser(r);
			tx = d['result']
			_contract_address =tx['contractAddress']
			if len(_contract_address)>0:
				last_block = int(e['result'],16) 
				block = 0;
				contract_address = _contract_address
				print('New Contract Address',contract_address)
				return True;
		except:
			pass
		block = block - 1;
	last_block = int(e['result'],16)
	return False;


def masterMiner():
	#First we get the contract address
	#getAddress();
	while True:
		#mine first value
		mine();
		time.sleep(sleep_between_mines);
		#request data for 1 - 10 API's
		# requestData();
		# time.sleep(10);
		# #keep track of open API's - randomly select a random number and tip them a random amount
		# addToTip();
		# time.sleep(10);

	print('Mock System Stopping')

#getVariables()
masterMiner();
#getAddress();
#getAPIvalue("json(https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=8BOZABJ2U1CEWBD).Global___Quote.05/.___price")
