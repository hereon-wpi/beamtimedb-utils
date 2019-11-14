/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const MongoClient = require('mongodb').MongoClient;
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);


// Connection URL
const url = require('./defaults.js').url;

// Database Name
const dbName = require('./defaults.js').dbName;

// Create a new MongoClient
const client = new MongoClient(url,{
    useUnifiedTopology: true
});



// Use connect method to connect to the Server
(async function(input){
    await client.connect();

    const db = client.db(dbName);

    const collection = db.collection('beamtimes');

    const beamtime = JSON.parse(await readFile(input));

    const response = await collection.insertOne(beamtime);

    console.log(response);

    client.close();
})(input);
