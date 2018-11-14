async function assertRejects(q, msg) {
  let res,
    catchFlag = false;
  try {
    res = await q;
  } catch (e) {
    catchFlag = true;
  } finally {
    if (!catchFlag) assert.fail(res, null, msg);
  }
}

function getParamFromTxEvent(
  transaction,
  paramName,
  contractFactory,
  eventName
) {
  assert.isObject(transaction);
  let logs = transaction.logs;
  if (eventName != null) {
    logs = logs.filter(l => l.event === eventName);
  }
  assert.equal(logs.length, 1, `expected one log but got ${logs.length} logs`);
  let param = logs[0].args[paramName];
  if (contractFactory != null) {
    let contract = contractFactory.at(param);
    assert.isObject(contract, `getting ${paramName} failed for ${param}`);
    return contract;
  } else {
    return param;
  }
}

Object.assign(exports, {
  assertRejects,
  getParamFromTxEvent
});
