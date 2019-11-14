/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const input = process.argv[2];

if(input === undefined || input === null) throw new Error("Input json file name must be specified!");

module.exports.input = input;