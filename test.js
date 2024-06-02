require('dotenv').config({ path: './auth_mongodb.env' });  // Cambia el path si tu archivo .env tiene un nombre diferente
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
console.log('MONGODB_URI:', uri); // Añade esta línea para depuración

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
