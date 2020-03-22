const kBeamtimeMetadataFileNamePattern = /beamtime-metadata-(\d{8}).txt/gi;
const kBeamtimeScanNexusFilePattern = /(\.*)_nexus.h5/gi;

const argv = require('yargs')
    .option('gpfsBeamtimeDataRoot', {
        desc: 'GPFS Beamtime root'
    })
    .demandOption(["gpfsBeamtimeDataRoot"])
    .argv;

const fs = require('fs');
const walk = require('walk');
const path = require('path');

(async function() {
    const mongodb = await require('./initialize_mongodb').startMongoDb();

    const walker = walk.walk(argv.gpfsBeamtimeDataRoot, {});

    walker.on('directory', function (root, stats, next) {
        console.debug(stats.name);
        next();
    });

    const extractJson = require('./spawn.js').extractJson;
    const importDoorBeamtime = require("./import_door_beamtime_json.js").importDoorBeamtime;

    //import DOOR Json
    walker.on('file', function (root, stats, next) {
        if (/beamtime-metadata-(\d{8}).txt/gi.test(stats.name)) {
            console.log(`Processing ${root}/${stats.name}`);
            extractJson(`${root}/${stats.name}`, `/tmp/${stats.name}`, async function () {
                const beamtime = await importDoorBeamtime(`/tmp/${stats.name}`);
                mongodb.collection.findOneAndUpdate({beamtimeId: beamtime.beamtimeId}, {$set: beamtime}, {
                    upsert: true,
                    returnNewDocument: true
                }).then(() => {
                    console.log(`Successfully imported beamtime metadata ${stats.name}`);
                    next();
                });

            });
        } else {
            next();
        }
    });

    const importHdf5 = require("./import_nexus_file.js").importHdf5;

    //import scan h5
    walker.on('file', function (root, stats, next) {
        if (/(\.*)_nexus.h5/gi.test(stats.name)) {
            console.log(`Processing ${root}/${stats.name}`);
            const scanName = stats.name.replace('_nexus.h5','');

            const scan = importHdf5(`${root}/${stats.name}`);

            const splitPath = path.dirname(root).split(path.sep);
            splitPath.pop(); //skip 'raw'
            const beamtimeId = splitPath.pop();

            scan.subscribe(scan => {
                mongodb.collection.findOne({beamtimeId: beamtimeId})
                    .then(beamtime => {
                        if(beamtime.scans === undefined) beamtime.scans = {};

                        scan.recos = {};
                        beamtime.scans[scan.name] = scan;
                        return beamtime;
                    }).then(beamtime=> {
                        mongodb.collection.findOneAndUpdate({beamtimeId: beamtime.beamtimeId}, {$set: beamtime}, {
                            upsert: true,
                            returnNewDocument: true
                        }).then(() => {
                            console.log(`Successfully imported beamtime  scan h5 ${stats.name}`);
                            next();
                        });
                    });
            })
        } else {
            next();
        }
    });

    const parseReco = require("./parse_reco_log.js").parse;

    //import reco
    walker.on('file', function(root, stats, next){
        if (path.extname(stats.name) === '.log' && root.includes('processed')) {
            console.log(`Processing ${root}/${stats.name}`);


            const recoName = path.basename(stats.name, path.extname(stats.name));
            parseReco(`${root}/${stats.name}`).then(reco => {
                mongodb.collection.findOne({beamtimeId: reco.beamtime_id})
                    .then(beamtime => {
                        if(beamtime.scans === undefined) beamtime.scans = {};
                        if(beamtime.scans[reco.scan_name] === undefined) beamtime.scans[reco.scan_name] = { recos: {}};

                        beamtime.scans[reco.scan_name].recos[recoName] = reco;
                        return beamtime;
                    }).then(beamtime=> {
                    mongodb.collection.findOneAndUpdate({beamtimeId: beamtime.beamtimeId}, {$set: beamtime}, {
                        upsert: true,
                        returnNewDocument: true
                    }).then(() => {
                        console.log(`Successfully imported beamtime scan reco ${stats.name}`);
                        next();
                    });
                });

                next();
            })

        } else {
            next();
        }
    });


    walker.on("end", function () {
        mongodb.client.close();
        console.log("All done!");
    });
})();

