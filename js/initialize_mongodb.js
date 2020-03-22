const mongodb = {
    host:process.env["MONGODB_HOST"],
    port:process.env["MONGODB_PORT"]
};

console.debug(mongodb);

const MongoClient = require('mongodb').MongoClient;

const url = `mongodb://${mongodb.host}:${mongodb.port}`;
const client = new MongoClient(url, {
    useUnifiedTopology: true
});

async function startMongoDb() {

    await client.connect();

    const db = client.db('beamtimedb');

    const collection = db.collection('beamtimes');

    return {
        db,
        client,
        collection
    }
}

module.exports.startMongoDb = startMongoDb;