var MathUtils = artifacts.require("../../contracts/Utils/Math.sol");
var EventFactory = artifacts.require("../../contracts/Events/EventFactory.sol");
var EtherToken = artifacts.require("../../contracts/Tokens/EtherToken.sol");
var CentralizedOracleFactory = artifacts.require("../../contracts/Oracles/CentralizedOracleFactory.sol");
var CategoricalEvent = artifacts.require("../../contracts/Events/CategoricalEvent.sol");
var OutcomeToken = artifacts.require("../../contracts/Tokens/OutcomeToken.sol");

contract(
  'EtherToken',
  function(accounts)
  {
    let centralizedOracleFactory;
    let eventFactory;
    let ether_tokenAddr;

    beforeEach(
      async () =>
      {
        centralizedOracleFactory = await CentralizedOracleFactory.deployed();
        eventFactory = await EventFactory.deployed();
        ether_token = await EtherToken.deployed();
      }
    );

    it(
      'should buy and sell all outcomes',
      async () =>
      {
        const ipfs_hash = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
        const oracleTx = await centralizedOracleFactory.createCentralizedOracle(ipfs_hash);
        assert.isObject(oracleTx);
        //unfortunately we need to fish it out of the Event, because non constant functions can't return a value
        const oracleAddress = oracleTx.logs[0].args.centralizedOracle;
        const eventTx = await eventFactory.createCategoricalEvent(ether_token.address, oracleAddress, 2);
        const eventAddress = eventTx.logs[0].args.categoricalEvent;
        const event = CategoricalEvent.at(eventAddress);
        assert.isObject(event, `failed for ${eventAddress}`);
        //Buy all outcomes
        let buyer = 0
        let collateral_token_count = 10
        await ether_token.deposit({value: collateral_token_count, sender: accounts[buyer]});
        const eventBalance = await ether_token.balanceOf(accounts[buyer]);
        assert.equal(eventBalance, collateral_token_count);
        await ether_token.approve(eventAddress, collateral_token_count, {sender: accounts[buyer]});
        await event.buyAllOutcomes(collateral_token_count, {sender: accounts[buyer]});
        assert.equal (await ether_token.balanceOf(eventAddress) , collateral_token_count);
        assert.equal (await ether_token.balanceOf(accounts[buyer]), 0);
        // let outcome_token_1 = event.outcomeTokens(0);
        // let outcome_token_1 = OutcomeToken.at(event.outcomeTokens(0));
        // console.log(event.outcomeTokens(0).then(function(result) {console.log(result);}, function(err) {console.log(err);}));
        // assert.isTrue (await web3.isAddress(event.outcomeTokens(0).address));
        // let outcome_token_2 = EtherToken.at(event.outcomeTokens[1].address);
        // assert.equal (await outcome_token_1.balanceOf(accounts[buyer]), collateral_token_count);
        // assert.equal (await outcome_token_2.balanceOf(accounts[buyer]), collateral_token_count);
        // //Sell all outcomes
        await event.sellAllOutcomes(collateral_token_count, {sender: accounts[buyer]});
        assert.equal (await ether_token.balanceOf(accounts[buyer]) , collateral_token_count);
        assert.equal (await ether_token.balanceOf(eventAddress), 0);
        // assert.equal (await outcome_token_1.balanceOf(accounts[buyer]), 0);
        // assert.equal (await outcome_token_2.balanceOf(accounts[buyer]), 0);
      }
    );

    /*   Original JavaScript test code from gnosis-contracts
          # Create event
          ipfs_hash = b'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
          oracle = self.centralized_oracle_factory.createCentralizedOracle(ipfs_hash)
          event_address = self.event_factory.createCategoricalEvent(self.ether_token.address, oracle, 2)
          event = self.contract_at(event_address, self.event_abi)
          # Buy all outcomes
          buyer = 0
          collateral_token_count = 10
          self.ether_token.deposit(value=collateral_token_count, sender=keys[buyer])
          self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), collateral_token_count)
          self.ether_token.approve(event_address, collateral_token_count, sender=keys[buyer])
          event.buyAllOutcomes(collateral_token_count, sender=keys[buyer])
          self.assertEqual(self.ether_token.balanceOf(event_address), collateral_token_count)
          self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), 0)
      outcome_token_1 = self.contract_at(event.outcomeTokens(0), self.token_abi)
      outcome_token_2 = self.contract_at(event.outcomeTokens(1), self.token_abi)
      self.assertEqual(outcome_token_1.balanceOf(accounts[buyer]), collateral_token_count)
      self.assertEqual(outcome_token_2.balanceOf(accounts[buyer]), collateral_token_count)
          # Sell all outcomes
          event.sellAllOutcomes(collateral_token_count, sender=keys[buyer])
          self.assertEqual(self.ether_token.balanceOf(accounts[buyer]), collateral_token_count)
          self.assertEqual(self.ether_token.balanceOf(event_address), 0)
      self.assertEqual(outcome_token_1.balanceOf(accounts[buyer]), 0)
      self.assertEqual(outcome_token_2.balanceOf(accounts[buyer]), 0)
    */
  }
);
