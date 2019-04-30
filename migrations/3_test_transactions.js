/**
 * Phat Cats - Crypto-Cards
 *  - https://crypto-cards.io
 *  - https://phatcats.co
 *
 * Copyright 2019 (c) Phat Cats, Inc.
 */
'use strict';

require('dotenv').config();

// Required by zos-lib when running from truffle
global.artifacts = artifacts;
global.web3 = web3;

const { Lib } = require('./common');
const { networkOptions } = require('../config');
const _ = require('lodash');

const CryptoCardsPayroll = artifacts.require('CryptoCardsPayroll');

const _testAccounts = [
    {address: '0x20D403B0ed3755CdB2F4eA856644B3BE2718F754', shares: 50},
    {address: '0x7002FF8d83625DC59A2C23bCAb9e8939A201B0d6', shares: 25},
    {address: '0x4DE7C0BEEdD7286074fE2b9CeA08774ba55C991b', shares: 25}
];

const ETH = 1e18;

module.exports = async function(deployer, network, accounts) {
    let nonce = 0;
    let receipt;

    Lib.network = (network || '').replace('-fork', '');
    if (_.isUndefined(Lib.network) || _.isUndefined(networkOptions[Lib.network])) {
        Lib.network = 'local';
    }

    const owner = accounts[0];
    const options = networkOptions[Lib.network];

    const _getTxOptions = (value = 0) => {
        const opts = {from: owner, nonce: nonce++, gasPrice: options.gasPrice};
        if (value > 0) { opts.value = value; }
        return opts;
    };

    try {
        const cryptoCardsPayroll = await CryptoCardsPayroll.deployed(); // .at('0x89eC3f11E1600BEd981DD2d12404bAAF21c7699c');

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get Transaction Nonce
        nonce = (await Lib.getTxCount(owner)) || 0;

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Test Deposits
        Lib.log({spacer: true});
        Lib.log({msg: '-- Add Deposit via fallback function --'});
        receipt = await cryptoCardsPayroll.sendTransaction(_getTxOptions(10 * ETH));
        Lib.logTxResult(receipt);
        Lib.log({spacer: true});

        // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Add Payee Accounts
        Lib.log({msg: '-- Add Payee Accounts --'});
        for (let i = 0; i < _testAccounts.length; i++) {
            Lib.log({msg: `Account ${i}: ${_testAccounts[i].address}, Shares: ${_testAccounts[i].shares}`, indent: 1});
            receipt = await cryptoCardsPayroll.addNewPayee(_testAccounts[i].address, _testAccounts[i].shares, _getTxOptions());
            Lib.logTxResult(receipt);
            Lib.log({spacer: true});
        }
    }
    catch (err) {
        console.log(err);
    }
};
