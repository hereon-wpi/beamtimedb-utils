/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const util = require('util');
const fs = require('fs');
const eachLine = util.promisify(require('line-reader').eachLine);

const input = require('./read_input_param.js').input;



const reco = Object.create(null);

module.exports.parse = async function() {
    await eachLine(input, (line) => {
        const split = line.split(' : ');
        reco[split[0]] = split[1];
    });
};

module.exports.reco = reco;





