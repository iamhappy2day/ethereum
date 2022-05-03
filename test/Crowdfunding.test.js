const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledCrowdfunding = require('../build/Crowdfunding.json');
const compiledFactory = require('../build/Factory.json');

let accounts;
let crowdfunding;
let crowdfundingAddress;
let factory;
let minCotribution = 100;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    factory = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({from: accounts[0], gas: 2000000});

    await factory.methods.createCampaign(minCotribution)
        .send({from: accounts[0], gas: 1000000});

    let campaignAddresses = await factory.methods.getDeployedCrowdfundings().call();
    crowdfundingAddress = campaignAddresses[0];

    crowdfunding = await new web3.eth.Contract(
        compiledCrowdfunding.abi,
        crowdfundingAddress
    );
});

describe('Crowdfunding', () => {
    it('deploys crowdfunding and factory contracts', () => {
        assert.ok(factory.options.address);
        assert.ok(crowdfunding.options.address);
    });
    it('check that manager is a correct address', async () => {
        const manager = await crowdfunding.methods.manager().call();
        assert.strictEqual(manager, accounts[0]);
    });
    it('allows people to send money and add them to contributors', async () => {
        const contributor = accounts[1];
        await crowdfunding.methods.contribute().send({
            from: contributor,
            value: minCotribution +1
        });
        const isContributor = await crowdfunding.methods.contributors(contributor).call();
        assert(isContributor);
    });
    it('check for minimum contribution', async () => {
        let executed;
        try {
            await crowdfunding.methods.contribute().send({
                from: accounts[1],
                value: minCotribution -1
            });
            executed = true;
        } catch (err) {
            executed = false;
        }
        assert.strictEqual(executed, false)
    });
    it('end2end process the request', async () => {
        await crowdfunding.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        await crowdfunding.methods
            .createRequest('test description',web3.utils.toWei('6', 'ether'), accounts[1])
            .send({  from: accounts[0], gas: 1000000 });

        await crowdfunding.methods.approveRequest(0).send({
            from: accounts[0],
            gas: 1000000
        });

        let initialBalance = await web3.eth.getBalance(accounts[1]);
        initialBalance = web3.utils.fromWei(initialBalance, 'ether');
        initialBalance = parseFloat(initialBalance);

        console.log('initialBalance',initialBalance)
        await crowdfunding.methods.confirmRequest(0).send({
            from: accounts[0],
            gas: 1000000
        });

        let finalBalance = await web3.eth.getBalance(accounts[1]);
        finalBalance = web3.utils.fromWei(finalBalance, 'ether');
        finalBalance = parseFloat(finalBalance);

        assert(finalBalance > initialBalance);
    })
})