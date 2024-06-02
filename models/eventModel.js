const { ObjectId } = require('mongodb');

const getEvents = (collection, email) => {
    return collection.find({ email: email }).toArray();
};

const saveEvent = (collection, event) => {
    return collection.insertOne(event);
};

const deleteEvent = (collection, eventId) => {
    return collection.deleteOne({ _id: new ObjectId(eventId) });
};

module.exports = { getEvents, saveEvent, deleteEvent };
