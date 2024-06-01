document.addEventListener('DOMContentLoaded', () => {
    initializeEmptyCalendar();
});

function showEventForm(dateStr) {
    const form = document.getElementById('event-form');
    form.style.display = 'block';
    document.getElementById('event-start').value = dateStr + "T00:00";
}

function showEventDetails(event) {
    document.getElementById('modal-event-title').textContent = event.title;
    document.getElementById('modal-event-start').textContent = formatDateTime(event.start);
    document.getElementById('modal-event-end').textContent = formatDateTime(event.end);
    document.getElementById('modal-event-location').textContent = event.location;
    document.getElementById('modal-event-description').textContent = event.description;
    document.getElementById('modal-event-link').textContent = event.extendedProps.link;
    document.getElementById('modal-event-link').href = event.extendedProps.link;
    document.getElementById('modal-event-course').textContent = event.extendedProps.course;
    document.getElementById('modal-event-delivery').textContent = event.extendedProps.delivery;
    document.getElementById('modal-event-importance').textContent = event.extendedProps.importance;

    const eventDetailsModal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
    eventDetailsModal.show();
    document.getElementById('delete-event-btn').onclick = () => deleteEvent(event.id);
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short',
        hour12: false
    });
}

function editEvent() {
    const eventTitle = document.getElementById('modal-event-title').textContent;
    const eventStart = document.getElementById('modal-event-start').textContent;
    const eventEnd = document.getElementById('modal-event-end').textContent;
    const eventLocation = document.getElementById('modal-event-location').textContent;
    const eventDescription = document.getElementById('modal-event-description').textContent;
    const eventLink = document.getElementById('modal-event-link').textContent;
    const eventCourse = document.getElementById('modal-event-course').textContent;
    const eventDelivery = document.getElementById('modal-event-delivery').textContent;
    const eventImportance = document.getElementById('modal-event-importance').textContent;

    document.getElementById('event-title').value = eventTitle;
    document.getElementById('event-start').value = new Date(eventStart).toISOString().slice(0, 16);
    document.getElementById('event-end').value = new Date(eventEnd).toISOString().slice(0, 16);
    document.getElementById('event-location').value = eventLocation;
    document.getElementById('event-description').value = eventDescription;
    document.getElementById('event-link').value = eventLink;
    document.getElementById('event-course').value = eventCourse;
    document.getElementById('event-delivery').value = eventDelivery;
    document.getElementById('event-importance').value = eventImportance;

    document.getElementById('event-form').style.display = 'block';
    const eventDetailsModal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
    eventDetailsModal.hide();

    document.getElementById('event-form').dataset.editing = true;
    document.getElementById('event-form').dataset.id = event.id;
}

document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const isEditing = document.getElementById('event-form').dataset.editing === 'true';

    const updatedEvent = {
        id: isEditing ? document.getElementById('event-form').dataset.id : Date.now().toString(),
        title: document.getElementById('event-title').value,
        start: document.getElementById('event-start').value,
        end: document.getElementById('event-start').value,
        location: document.getElementById('event-location').value,
        description: document.getElementById('event-description').value,
        link: document.getElementById('event-link').value,
        course: document.getElementById('event-course').value,
        delivery: document.getElementById('event-delivery').value,
        importance: document.getElementById('event-importance').value
    };

    if (isEditing) {
        updateEventInDatabase(updatedEvent);
    } else {
        addEventToDatabase(updatedEvent);
    }

    form.reset();
    form.style.display = 'none';
    delete form.dataset.editing;
});

function addEventToDatabase(event) {
    // Añadir la lógica para agregar el evento a la base de datos o API
}

function updateEventInDatabase(event) {
    // Añadir la lógica para actualizar el evento en la base de datos o API
}

function deleteEvent(eventId) {
    // Añadir la lógica para eliminar el evento de la base de datos o API
}

function addEventToPendingTasks(event) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItem = document.createElement('li');
    taskItem.textContent = `${event.title} - ${event.start}`;
    taskItem.className = `pending-task ${event.importance}`;
    if (event.delivery === 'si') {
        taskItem.classList.add('delivery');
    }
    taskList.appendChild(taskItem);
}

function removeEventFromPendingTasks(eventId) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItems = Array.from(taskList.children);
    const taskItem = taskItems.find(item => item.dataset.id === eventId);
    if (taskItem) {
        taskList.removeChild(taskItem);
    }
}
