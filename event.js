document.addEventListener('DOMContentLoaded', () => {
    initializeEmptyCalendar();
});

function showEventForm(dateStr) {
    const form = document.getElementById('event-form');
    form.style.display = 'block';
    document.getElementById('event-start').value = dateStr + "T00:00";
    document.getElementById('event-end').value = dateStr + "T23:59";
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

    const startDate = new Date(document.getElementById('event-start').value);
    const endDate = new Date(document.getElementById('event-end').value);
    const today = new Date();

    // Verificar que la fecha de inicio y finalización no sean en el pasado
    if (startDate < today || endDate < today) {
        alert('No se pueden crear eventos en fechas pasadas.');
        return;
    }

    const isEditing = document.getElementById('event-form').dataset.editing === 'true';

    const updatedEvent = {
        id: isEditing ? document.getElementById('event-form').dataset.id : Date.now().toString(),
        title: document.getElementById('event-title').value,
        start: document.getElementById('event-start').value,
        end: document.getElementById('event-end').value,
        location: document.getElementById('event-location').value,
        description: document.getElementById('event-description').value,
        link: document.getElementById('event-link').value,
        course: document.getElementById('event-course').value,
        delivery: document.getElementById('event-delivery').value,
        importance: document.getElementById('event-importance').value
    };

    if (isEditing) {
        updateEventInCalendar(updatedEvent);
    } else {
        addEventToCalendar(updatedEvent);
    }

    document.getElementById('event-form').reset();
    document.getElementById('event-form').style.display = 'none';
    delete document.getElementById('event-form').dataset.editing;
});

function addEventToCalendar(event) {
    if (!calendar) return;

    calendar.addEvent({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        description: event.description,
        location: event.location,
        extendedProps: {
            link: event.link,
            course: event.course,
            delivery: event.delivery,
            importance: event.importance
        }
    });
    addEventToPendingTasks(event);
}

function updateEventInCalendar(event) {
    const calendarEvent = calendar.getEventById(event.id);
    if (calendarEvent) {
        calendarEvent.setProp('title', event.title);
        calendarEvent.setStart(event.start);
        calendarEvent.setEnd(event.end);
        calendarEvent.setExtendedProp('description', event.description);
        calendarEvent.setExtendedProp('location', event.location);
        calendarEvent.setExtendedProp('link', event.link);
        calendarEvent.setExtendedProp('course', event.course);
        calendarEvent.setExtendedProp('delivery', event.delivery);
        calendarEvent.setExtendedProp('importance', event.importance);
    }
    updateEventInPendingTasks(event);
}

function deleteEvent(eventId) {
    const calendarEvent = calendar.getEventById(eventId);
    if (calendarEvent) {
        calendarEvent.remove();
    }
    removeEventFromPendingTasks(eventId);
}

function addEventToPendingTasks(event) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItem = document.createElement('li');
    taskItem.textContent = `${event.title} - ${event.start}`;
    taskItem.dataset.id = event.id;
    taskItem.classList.add('pending-task');

    if (event.delivery === 'si') {
        taskItem.classList.add('delivery');
    }

    switch (event.importance) {
        case 'baja':
            taskItem.classList.add('low');
            break;
        case 'media':
            taskItem.classList.add('medium');
            break;
        case 'alta':
            taskItem.classList.add('high');
            break;
        case 'muy-alta':
            taskItem.classList.add('very-high');
            break;
        default:
            taskItem.classList.add('none');
            break;
    }

    taskList.appendChild(taskItem);
}

function updateEventInPendingTasks(event) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItems = Array.from(taskList.children);
    const taskItem = taskItems.find(item => item.dataset.id === event.id);
    if (taskItem) {
        taskItem.textContent = `${event.title} - ${event.start}`;
        taskItem.className = 'pending-task'; // Reset classes

        if (event.delivery === 'si') {
            taskItem.classList.add('delivery');
        }

        switch (event.importance) {
            case 'baja':
                taskItem.classList.add('low');
                break;
            case 'media':
                taskItem.classList.add('medium');
                break;
            case 'alta':
                taskItem.classList.add('high');
                break;
            case 'muy-alta':
                taskItem.classList.add('very-high');
                break;
            default:
                taskItem.classList.add('none');
                break;
        }
    }
}

function removeEventFromPendingTasks(eventId) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItems = Array.from(taskList.children);
    const taskItem = taskItems.find(item => item.dataset.id === eventId);
    if (taskItem) {
        taskList.removeChild(taskItem);
    }
}

function clearPastEvents() {
    const today = new Date().toISOString().split('T')[0];
    const events = calendar.getEvents();
    events.forEach(event => {
        if (event.end < today) {
            event.remove();
            removeEventFromPendingTasks(event.id);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEmptyCalendar();
    clearPastEvents(); // Clear past events on load
});

