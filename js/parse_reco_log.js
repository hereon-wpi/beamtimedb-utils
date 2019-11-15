/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const util = require('util');
const fs = require('fs');
const eachLine = util.promisify(require('line-reader').eachLine);

const reco = Object.create(null);

module.exports.parse = async function(input) {
    await eachLine(input, (line) => {
        const split = line.split(' : ');
        reco[split[0]] = split[1];
    });

    return reco;
};