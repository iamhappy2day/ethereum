const HdWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledFactory = require('../build/factory.json');

const provider = new HdWalletProvider(
    'garden humble mix veteran major step matrix expire crystal bar nothing require',
    'https://rinkeby.infura.io/v3/dbed25d4ad7a4b138c89ba105a815f94'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts()

    console.log('Attempting to deploy from', accounts[0])

    const result = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({data: compiledFactory.evm.bytecode.object }) // arguments must be here if needed
        .send({gas: "10000000", gasPrice:"2000000000", from: accounts[0] });

    console.log( 'Address of deployed contract', result.options.address)
    // provider.engine.stop()
};

deploy()