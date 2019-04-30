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


module.exports = async function(deployer, network, accounts) {
    let nonce = 0;

    Lib.network = (network || '').replace('-fork', '');
    if (_.isUndefined(networkOptions[Lib.network])) {
        Lib.network = 'local';
    }

    const owner = accounts[0]; // process.env[`${_.toUpper(Lib.network)}_OWNER_ACCOUNT`];
    const options = networkOptions[Lib.network];

    const _getTxOptions = () => {
        return {from: owner, nonce: nonce++, gasPrice: options.gasPrice};
    };

    try {
        nonce = (await Lib.getTxCount(owner)) || 0;

        const cryptoCardsPayroll = await deployer.deploy(CryptoCardsPayroll, _getTxOptions());
    }
    catch (err) {
        console.log(err);
    }
};
