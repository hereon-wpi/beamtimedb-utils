/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 15.11.2019
 */
const hdf5 = require('hdf5').hdf5;
const h5lt = require('hdf5').h5lt;

const Access = require('hdf5/lib/globals').Access;
const CreationOrder = require('hdf5/lib/globals').CreationOrder;
const H5OType = require('hdf5/lib/globals').H5OType;

const groups = [
    "beamline",
    "beamtime",
    "sample",
    "scan",
    "scan/setup"
];

// === rxjs ===
const from = require('rxjs').from;
const of = require('rxjs').of;
const pipe = require('rxjs').pipe;
const map = require('rxjs/operators').map;
const filter = require('rxjs/operators').filter;
const mergeMap = require('rxjs/operators').mergeMap;
const reduce = require('rxjs/operators').reduce;
const finalize = require('rxjs/operators').finalize;

// === path ===
const path = require("path");

const SegfaultHandler = require('segfault-handler');
SegfaultHandler.registerHandler("crash.log", function(signal, address, stack) {
    debugger
});

module.exports.importHdf5 = importHdf5 = function(input) {
    const file = new hdf5.File(input, Access.ACC_RDONLY);
    return from(groups).pipe(
        map(groupName => {
            const group = file.openGroup(`entry/${groupName}`, CreationOrder.H5P_CRT_ORDER_TRACKED| CreationOrder.H5P_CRT_ORDER_TRACKED);
            return {name: groupName, hdf5group: group};
        }),
        map(group => Object.assign(group, {dataSets: group.hdf5group.getMemberNames()})),
        mergeMap(group =>
            from(group.dataSets).pipe(
                filter(dataSet => group.hdf5group.getChildType(dataSet) === H5OType.H5O_TYPE_DATASET),
                filter(dataSet => h5lt.readDataset(group.hdf5group.id, dataSet) !== undefined),
                map(dataSet => {
                    const result = {
                        hdf5group: group.hdf5group,
                        group: group.name,
                        name: dataSet
                    };

                    result.value = h5lt.readDataset(group.hdf5group.id, dataSet);
                    if (result.value.length === 1) [result.value] = result.value;
                    return result;
                }),
                finalize(() => {
                    console.log(`Closing H5Group ${group.name}`);
                    group.hdf5group.close();
                })
            )
        ),
        reduce((acc, dataset) => {
            const source = {
                [dataset.name]: dataset.value
            };
            if(acc[dataset.group])
                Object.assign(acc[dataset.group], source);
            else
                Object.assign(acc, {
                    [dataset.group]: source
                });
            return acc;
        }, {}),
        map(scan => Object.assign(scan, {name: path.basename(input).substring(0, path.basename(input).lastIndexOf("_nexus.h5"))   })),
        finalize(() => {
            console.log(`Closing ${input}`);
            file.close()
        })
    );
};




(async function(input){
    const MongoClient = require('mongodb').MongoClient;

    const client = new MongoClient('mongodb://localhost:27017',{
        useUnifiedTopology: true
    });

    await client.connect();

    const db = client.db('beamtimedb');

    const collection = db.collection('beamtimes');

    // const beamtime = await collection.insertOne({
    //     scans: [
    //         {}
    //     ]
    // });

    importHdf5(input).subscribe(dataSets => {
        const output = Object.assign({}, dataSets);
        console.log(output)
    });

    client.close();

})('beamtimedb/syn001_35R_Ti_8w_000_nexus.h5');
