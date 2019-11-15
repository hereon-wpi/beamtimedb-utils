/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);

// Use connect method to connect to the Server
module.exports.importDoorBeamtime = async function(input){
    return JSON.parse(await readFile(input));
};