// models/event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    description: { type: String },
    link: { type: String },
    course: { type: String },
    delivery: { type: String },
    importance: { type: String }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
