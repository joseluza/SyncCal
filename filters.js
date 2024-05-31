function filterByDate() {
    let events = calendar.getEvents();
    let filteredEvents = events.filter(event => {
        let today = new Date();
        let eventDate = new Date(event.start);
        return eventDate >= today;
    });
    calendar.removeAllEvents();
    filteredEvents.forEach(event => calendar.addEvent(event));
}

function filterByCourse() {
    let course = prompt("Enter the course name to filter by:");
    let events = calendar.getEvents();
    let filteredEvents = events.filter(event => event.title.includes(course));
    calendar.removeAllEvents();
    filteredEvents.forEach(event => calendar.addEvent(event));
}

function filterByImportance() {
    let importance = prompt("Enter the importance level to filter by (e.g., High, Medium, Low):");
    let events = calendar.getEvents();
    let filteredEvents = events.filter(event => event.extendedProps.importance === importance);
    calendar.removeAllEvents();
    filteredEvents.forEach(event => calendar.addEvent(event));
}