function filterByDate() {
    const today = new Date().toISOString().split('T')[0];
    const events = calendar.getEvents().filter(event => event.extendedProps.delivery === 'si' && event.start >= today);
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    updatePendingTasks(events);
}

function filterByCourse() {
    const course = document.getElementById('event-course').value;
    const events = calendar.getEvents().filter(event => event.extendedProps.course === course);
    updatePendingTasks(events);
}

function filterByImportance() {
    const importance = document.getElementById('event-importance').value;
    const events = calendar.getEvents().filter(event => event.extendedProps.importance === importance);
    updatePendingTasks(events);
}

function updatePendingTasks(events) {
    const taskList = document.getElementById('pending-tasks-list');
    taskList.innerHTML = '';
    events.forEach(event => {
        addEventToPendingTasks(event);
    });
}
