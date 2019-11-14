/**
 *
 * @author Igor Khokhriakov <igor.khokhriakov@hzg.de>
 * @since 14.11.2019
 */
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'beamtimedb';

// Create a new MongoClient
const client = new MongoClient(url,{
    useUnifiedTopology: true
});

// Use connect method to connect to the Server
(async function(){
    await client.connect();

    const db = client.db(dbName);

    const collection = db.collection('beamtimes');

    const emptyBeamtime = {
        id: undefined
    };

    const response = await collection.insertOne(emptyBeamtime);

    console.log(response);

    client.close();
})();


