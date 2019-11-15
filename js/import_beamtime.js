/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 15.11.2019
 */

// === argv ===
const doorBeamtimeJson = require("./parse_arguments.js").doorBeamtimeJson;
const recoLogs = require("./parse_arguments.js").recoLogs;

// === rxjs ===
const from = require('rxjs').from;
const of = require('rxjs').of;
const pipe = require('rxjs').pipe;
const flatMap = require('rxjs/operators').flatMap;
const tap = require('rxjs/operators').tap;

of(doorBeamtimeJson).pipe(
    flatMap(doorBeamtimeJson => {
        return from(require("./import_door_beamtime_json.js").importDoorBeamtime(doorBeamtimeJson));
    })
).subscribe(beamtime => {
    from(recoLogs).pipe(
        flatMap(recoLog => {
            return from(require("./parse_reco_log.js").parse(recoLog))
        }),
        tap(reco => {
            if(beamtime["scans"] === undefined) {
                const scans = beamtime["scans"] = [];

                scans.push({
                    "name": reco.scan_name,
                    "scan_path": reco.scan_path,
                    recos: [reco]
                })
            }
            else {
                beamtime["scans"].push(reco);
            }
        })
    ).subscribe(x => console.log(beamtime))
});