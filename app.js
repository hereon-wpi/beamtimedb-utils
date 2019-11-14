/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const reco = require('./js/parse_reco_log.js');

(async function(){
    await reco.parse();

    debugger
})();


const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'beamtimedb';

// Create a new MongoClient
const client = new MongoClient(url,{
    useUnifiedTopology: true
});

// Use connect method to connect to the Server
client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    client.close();
});
