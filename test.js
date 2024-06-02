require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function run() {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

        await client.connect();
        console.log("Connected to Database");

        const database = client.db("syncCalDB");
        const collection = database.collection("events");

        const testEvent = {
            title: "Test Event",
            start: new Date(),
            end: new Date(),
            description: "This is a test event",
            link: "http://example.com",
            course: "Example Course",
            delivery: "no",
            importance: "none"
        };

        await collection.insertOne(testEvent);
        console.log("Test event saved successfully!");

        await client.close();
    } catch (e) {
        console.error(e);
    }
}

run();
