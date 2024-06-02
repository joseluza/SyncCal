// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/event');

dotenv.config({ path: './auth_mongodb.env' });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to Database'))
  .catch((error) => console.error('Database connection error:', error));

// Ruta para obtener todos los eventos
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Ruta para crear un nuevo evento
app.post('/events', async (req, res) => {
    const newEvent = new Event(req.body);
    try {
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Ruta para actualizar un evento
app.put('/events/:id', async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Ruta para eliminar un evento
app.delete('/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
