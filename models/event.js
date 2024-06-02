const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config({ path: 'auth_mongodb.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to Database');
}).catch((err) => {
    console.error('Failed to connect to Database:', err);
});

// Definir el esquema de eventos
const eventSchema = new mongoose.Schema({
    title: String,
    start: String,
    end: String,
    description: String,
    link: String,
    course: String,
    delivery: String,
    importance: String,
});

const Event = mongoose.model('Event', eventSchema);

// Ruta para obtener todos los eventos
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Ruta para crear un nuevo evento
app.post('/events', async (req, res) => {
    const newEvent = new Event(req.body);
    try {
        const savedEvent = await newEvent.save();
        res.json(savedEvent);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Ruta para actualizar un evento existente
app.put('/events/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEvent);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Ruta para eliminar un evento
app.delete('/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
