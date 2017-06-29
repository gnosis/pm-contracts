exports.getParamFromTxEvent = function (transaction, paramName, contractFactory) {
    assert.isObject(transaction)
    assert.equal(transaction.logs.length, 1)
    let param = transaction.logs[0].args[paramName]
    if(contractFactory != null) {
        let contract = contractFactory.at(param)
        assert.isObject(contract, `getting ${paramName} failed for ${param}`)
        return contract
    } else {
        return param
    }
}

exports.assertRejects = async function(q, msg) {
    let res, catchFlag = false
    try {
        res = await q
    } catch(e) {
        catchFlag = true
    } finally {
        if(!catchFlag)
            assert.fail(res, null, msg)
    }
}
