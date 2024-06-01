let calendar;

function initializeEmptyCalendar() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        dateClick: function(info) {
            showEventForm(info.dateStr);
        },
        eventClick: function(info) {
            showEventDetails(info.event);
        }
    });
    calendar.render();
}

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
    const eventId = document.getElementById('modal-event-title').dataset.id;
    const event = calendar.getEventById(eventId);

    document.getElementById('event-title').value = event.title;
    document.getElementById('event-start').value = new Date(event.start).toISOString().slice(0, 16);
    document.getElementById('event-end').value = new Date(event.end).toISOString().slice(0, 16);
    document.getElementById('event-location').value = event.extendedProps.location;
    document.getElementById('event-description').value = event.extendedProps.description;
    document.getElementById('event-link').value = event.extendedProps.link;
    document.getElementById('event-course').value = event.extendedProps.course;
    document.getElementById('event-delivery').value = event.extendedProps.delivery;
    document.getElementById('event-importance').value = event.extendedProps.importance;

    document.getElementById('event-form').style.display = 'block';
    const eventDetailsModal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
    eventDetailsModal.hide();

    document.getElementById('event-form').dataset.editing = true;
    document.getElementById('event-form').dataset.id = eventId;
}

document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();

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

function deleteEvent(eventId) {
    const calendarEvent = calendar.getEventById(eventId);
    if (calendarEvent) {
        calendarEvent.remove();
    }
    removeEventFromPendingTasks(eventId);
}

function removeEventFromPendingTasks(eventId) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItems = Array.from(taskList.children);
    const taskItem = taskItems.find(item => item.dataset.id === eventId);
    if (taskItem) {
        taskList.removeChild(taskItem);
    }
}
