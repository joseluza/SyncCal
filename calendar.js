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
    loadEventsFromIndexedDB();
}

function loadEventsFromIndexedDB() {
    const request = indexedDB.open('SyncCalDB', 1);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['events'], 'readonly');
        const objectStore = transaction.objectStore('events');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const events = event.target.result;
            events.forEach(event => {
                addEventToCalendar(event);
                addEventToPendingTasks(event);
            });
        };

        request.onerror = (event) => {
            console.error('Error al cargar eventos de IndexedDB: ' + event.target.errorCode);
        };
    };

    request.onerror = (event) => {
        console.error('Error en la base de datos: ' + event.target.errorCode);
    };
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
        updateEventInIndexedDB(updatedEvent);
    } else {
        addEventToIndexedDB(updatedEvent);
    }

    document.getElementById('event-form').reset();
    document.getElementById('event-form').style.display = 'none';
    delete document.getElementById('event-form').dataset.editing;
});

function updateEventInIndexedDB(event) {
    const request = indexedDB.open('SyncCalDB', 1);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['events'], 'readwrite');
        const objectStore = transaction.objectStore('events');
        const request = objectStore.put(event);

        request.onsuccess = () => {
            console.log('El evento ha sido actualizado en la base de datos.');
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
        };

        request.onerror = () => {
            console.error('Error al actualizar el evento en la base de datos.');
        };
    };

    request.onerror = (event) => {
        console.error('Error en la base de datos: ' + event.target.errorCode);
    };
}

function addEventToIndexedDB(event) {
    const request = indexedDB.open('SyncCalDB', 1);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['events'], 'readwrite');
        const objectStore = transaction.objectStore('events');
        const request = objectStore.add(event);

        request.onsuccess = () => {
            console.log('El evento ha sido añadido a la base de datos.');
            addEventToCalendar(event);
            addEventToPendingTasks(event);
        };

        request.onerror = () => {
            console.error('Error al añadir el evento a la base de datos.');
        };
    };

    request.onerror = (event) => {
        console.error('Error en la base de datos: ' + event.target.errorCode);
    };
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
}

function addEventToPendingTasks(event) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItem = document.createElement('li');
    taskItem.textContent = `${event.title} - ${event.start}`;
    taskItem.dataset.id = event.id;
    taskList.appendChild(taskItem);
}

function updateEventInPendingTasks(event) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItems = Array.from(taskList.children);
    const taskItem = taskItems.find(item => item.dataset.id === event.id);
    if (taskItem) {
        taskItem.textContent = `${event.title} - ${event.start}`;
    }
}

function filterByDate() {
    const today = new Date().toISOString().split('T')[0];
    const events = calendar.getEvents().filter(event => event.extendedProps.delivery === 'si' && event.start >= today);
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
        addEventToPendingTasks(event);
    });
}

// Función para eliminar eventos
function deleteEvent(eventId) {
    const request = indexedDB.open('SyncCalDB', 1);

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['events'], 'readwrite');
        const objectStore = transaction.objectStore('events');
        const deleteRequest = objectStore.delete(eventId);

        deleteRequest.onsuccess = () => {
            console.log('El evento ha sido eliminado de la base de datos.');
            const calendarEvent = calendar.getEventById(eventId);
            if (calendarEvent) {
                calendarEvent.remove();
            }
            removeEventFromPendingTasks(eventId);
        };

        deleteRequest.onerror = () => {
            console.error('Error al eliminar el evento de la base de datos.');
        };
    };

    request.onerror = (event) => {
        console.error('Error en la base de datos: ' + event.target.errorCode);
    };
}

// Función para eliminar eventos de la lista de tareas pendientes
function removeEventFromPendingTasks(eventId) {
    const taskList = document.getElementById('pending-tasks-list');
    const taskItems = Array.from(taskList.children);
    const taskItem = taskItems.find(item => item.dataset.id === eventId);
    if (taskItem) {
        taskList.removeChild(taskItem);
    }
}
