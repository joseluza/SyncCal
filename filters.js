function filterByDate() {
    const events = calendar.getEvents().filter(event => event.extendedProps.delivery === 'si');
    events.sort((a, b) => new Date(a.start) - new Date(b.start));
    updatePendingTasks(events);
}

function filterByCourse() {
    const course = prompt("Ingrese el nombre del curso para filtrar:");
    const events = calendar.getEvents().filter(event => event.extendedProps.course.includes(course));
    updatePendingTasks(events);
}

function filterByImportance() {
    const importance = prompt("Ingrese el nivel de importancia para filtrar (ninguna, baja, media, alta, A1):");
    const events = calendar.getEvents().filter(event => event.extendedProps.importance === importance);
    updatePendingTasks(events);
}

function updatePendingTasks(events) {
    const taskList = document.getElementById('pending-tasks-list');
    taskList.innerHTML = '';
    events.forEach(event => {
        const taskItem = document.createElement('li');
        taskItem.textContent = `${event.title} - ${event.start}`;
        taskList.appendChild(taskItem);
    });
}
