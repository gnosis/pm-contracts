module.exports = {
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "script"
    },
    "env": {
        "node": true,
        "mocha": true,
    },
    "globals": {
        "assert": true,
        "artifacts": true,
        "contract": true
    }
};
