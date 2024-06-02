const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './auth_mongodb.env' });

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const { getEvents, saveEvent, deleteEvent } = require('./models/eventModel');

app.use(express.json());

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log("Connected to Database");
        const db = client.db("syncCalDB");
        const eventsCollection = db.collection("events");

        // Ruta para obtener todos los eventos de un usuario
        app.get('/events', (req, res) => {
            const userEmail = req.query.email;
            getEvents(eventsCollection, userEmail)
                .then(events => res.json(events))
                .catch(error => console.error(error));
        });

        // Ruta para crear un evento
        app.post('/events', (req, res) => {
            const event = req.body;
            saveEvent(eventsCollection, event)
                .then(result => res.json('Event added successfully'))
                .catch(error => console.error(error));
        });

        // Ruta para eliminar un evento
        app.delete('/events/:id', (req, res) => {
            const eventId = req.params.id;
            deleteEvent(eventsCollection, eventId)
                .then(result => res.json('Event deleted successfully'))
                .catch(error => console.error(error));
        });

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch(error => console.error(error));
