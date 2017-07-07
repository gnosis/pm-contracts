const { spawn, spawnSync } = require('child_process');

const testrpc = spawn('testrpc')

new Promise((resolve, reject) => {
    testrpc.stdout.on('data', (data) => {
        if(data.includes('Listening on localhost:8545')) {
            resolve()
        }
    });

    let error = ''

    testrpc.stderr.on('data', (data) => {
        error += data
    })

    testrpc.on('close', (code) => {
        reject(new Error(`testrpc exited with code ${code} and the following error:\n\n${error}`));
    });

}).then(() => {
    const { status, error } = spawnSync('truffle', ['test'], { stdio: 'inherit' })
    testrpc.kill()
    if(status != 0) {
        return Promise.reject(new Error(`truffle test exited with code ${status} and the following error:\n\n${error}`))
    }
    return Promise.resolve()
})
