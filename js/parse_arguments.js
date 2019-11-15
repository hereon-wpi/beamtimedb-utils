/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const argv = require('yargs')
    .option('doorBeamtimeJson', {
        desc: 'DOOR Beamtime Json'
    })
    .option('recoLogs', {
        type: 'array',
        desc: 'One or more reco logs'
    })
    .option('nexusFiles', {
        type: 'array',
        desc: 'One or more nexus files'
    })
    .default("recoLogs", [])
    .default("nexusFiles", [])
    .demandOption(["doorBeamtimeJson"])
    .argv;


module.exports.doorBeamtimeJson = argv.doorBeamtimeJson;//effectively first param
module.exports.recoLogs = argv.recoLogs;
module.exports.nexusFiles = argv.nexusFiles;