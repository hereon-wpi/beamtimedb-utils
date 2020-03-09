/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 15.11.2019
 */

// === argv ===
const doorBeamtimeJson = require("./parse_arguments.js").doorBeamtimeJson;
const recoLogs = require("./parse_arguments.js").recoLogs;
const nexusFiles = require("./parse_arguments.js").nexusFiles;

// === rxjs ===
const from = require('rxjs').from;
const of = require('rxjs').of;
const pipe = require('rxjs').pipe;
const flatMap = require('rxjs/operators').flatMap;
const mergeMap = require('rxjs/operators').mergeMap;
const map = require('rxjs/operators').map;

const mongodb = {
    host:process.env["mongodb.host"],
    port:process.env["mongodb.port"]
};


(async function() {
    const MongoClient = require('mongodb').MongoClient;

    const url = `mongodb://${mongodb.host}:${mongodb.port}`;
    const client = new MongoClient(url, {
        useUnifiedTopology: true
    });

    await client.connect();

    const db = client.db('beamtimedb');

    const collection = db.collection('beamtimes');

    of(doorBeamtimeJson).pipe(
        flatMap(doorBeamtimeJson => {
            return from(require("./import_door_beamtime_json.js").importDoorBeamtime(doorBeamtimeJson));
        }),
        mergeMap(beamtime =>
            from(recoLogs).pipe(
                flatMap(recoLog => {
                    return from(require("./parse_reco_log.js").parse(recoLog))
                }),
                map(reco => {
                    if (beamtime["scans"] === undefined) {
                        const scans = beamtime["scans"] = [];

                        scans.push({
                            "name": reco.scan_name,
                            "scan_path": reco.scan_path,
                            recos: [reco]
                        })
                    } else {
                        beamtime["scans"][reco.scan_name].recos.push(reco);
                    }
                    return beamtime;
                })
            )
        ),
        mergeMap(beamtime =>
            from(nexusFiles).pipe(
                flatMap(nexusFile => {
                    return require("./import_nexus_file.js").importHdf5(nexusFile);
                }),
                map(scan => {
                    Object.assign(beamtime.scans.find(_scan => _scan.name === scan.name), scan);
                    return beamtime;
                })
            )
        )
    ).subscribe(async beamtime => {
        try {
            await collection.findOneAndUpdate({beamtimeId: beamtime.beamtimeId}, { $set: beamtime}, {
                upsert: true,
                returnNewDocument: true
            });

            console.log(beamtime)
        }catch(e){
            console.error(e)
        } finally {
            console.log(`Closing ${url}`);
            await client.close();
        }
    });
})()