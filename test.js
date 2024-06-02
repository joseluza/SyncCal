const mongoose = require('mongoose');
require('dotenv').config();

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

const testEvent = new Event({
    id: 'test123',
    title: 'Test Event',
    start: '2024-06-01T00:00:00',
    end: '2024-06-01T23:59:59',
    description: 'This is a test event',
    link: 'https://example.com',
    course: 'Test Course',
    delivery: 'no',
    importance: 'media'
});

testEvent.save().then(() => {
    console.log('Test event saved successfully!');
    mongoose.connection.close();
}).catch(error => {
    console.error('Error saving test event:', error);
    mongoose.connection.close();
});
