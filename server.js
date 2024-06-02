const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const eventSchema = new mongoose.Schema({
    id: String,
    title: String,
    start: String,
    end: String,
    description: String,
    link: String,
    course: String,
    delivery: String,
    importance: String
});

const Event = mongoose.model('Event', eventSchema);

app.post('/api/events', async (req, res) => {
    const event = new Event(req.body);
    try {
        await event.save();
        res.status(201).send(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ id: req.params.id });
        if (!event) {
            return res.status(404).send();
        }
        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
