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

function loadCalendarEvents() {
    if (accessToken === null) {
        console.log('No access token available');
        return;
    }

    gapi.client.setToken({ access_token: accessToken });
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': new Date().toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 100,
        'orderBy': 'startTime'
    }).then((response) => {
        var events = response.result.items.map(event => {
            return {
                id: event.id,
                title: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                description: event.description,
                location: event.location,
                attachments: event.attachments,
                link: event.htmlLink,
                course: event.extendedProperties ? event.extendedProperties.shared.course : ''
            };
        });
        calendar.addEventSource(events);
    }).catch((error) => {
        console.error('Error fetching calendar events:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeEmptyCalendar();
    loadCalendarEvents();
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
    document.getElementById('modal-event-link').textContent = event.link;
    document.getElementById('modal-event-link').href = event.link;
    document.getElementById('modal-event-course').textContent = event.extendedProps.course;

    const attachmentsList = document.getElementById('modal-event-attachments');
    attachmentsList.innerHTML = '';
    if (event.extendedProps.attachments) {
        event.extendedProps.attachments.forEach(attachment => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = attachment;
            a.textContent = attachment;
            a.target = '_blank';
            li.appendChild(a);
            attachmentsList.appendChild(li);
        });
    }

    const eventDetailsModal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
    eventDetailsModal.show();
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
    const eventAttachments = Array.from(document.getElementById('modal-event-attachments').children).map(li => li.textContent);

    document.getElementById('event-title').value = eventTitle;
    document.getElementById('event-start').value = new Date(eventStart).toISOString().slice(0, 16);
    document.getElementById('event-end').value = new Date(eventEnd).toISOString().slice(0, 16);
    document.getElementById('event-location').value = eventLocation;
    document.getElementById('event-description').value = eventDescription;
    document.getElementById('event-link').value = eventLink;
    document.getElementById('event-course').value = eventCourse;
    document.getElementById('event-attachments').dataset.attachments = JSON.stringify(eventAttachments);

    document.getElementById('event-form').style.display = 'block';
    const eventDetailsModal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
    eventDetailsModal.hide();

    document.getElementById('event-form').dataset.editing = true;
}

document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const isEditing = document.getElementById('event-form').dataset.editing === 'true';

    const updatedEvent = {
        id: document.getElementById('modal-event-title').dataset.id,
        title: document.getElementById('event-title').value,
        start: document.getElementById('event-start').value,
        end: document.getElementById('event-end').value,
        location: document.getElementById('event-location').value,
        description: document.getElementById('event-description').value,
        attachments: JSON.parse(document.getElementById('event-attachments').dataset.attachments || '[]'),
        link: document.getElementById('event-link').value,
        course: document.getElementById('event-course').value
    };

    if (isEditing) {
        // Lógica para actualizar un evento existente en IndexedDB y Google Calendar
        updateEventInIndexedDB(updatedEvent);
        updateEventInGoogleCalendar(updatedEvent);
    } else {
        // Lógica para añadir un nuevo evento
        addEventToIndexedDB(updatedEvent);
        saveEventToGoogleCalendar(updatedEvent);
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
            // Actualizar el evento en el calendario
            const calendarEvent = calendar.getEventById(event.id);
            if (calendarEvent) {
                calendarEvent.setProp('title', event.title);
                calendarEvent.setStart(event.start);
                calendarEvent.setEnd(event.end);
                calendarEvent.setExtendedProp('description', event.description);
                calendarEvent.setExtendedProp('location', event.location);
                calendarEvent.setExtendedProp('attachments', event.attachments);
                calendarEvent.setExtendedProp('link', event.link);
                calendarEvent.setExtendedProp('course', event.course);
            }
        };

        request.onerror = () => {
            console.error('Error al actualizar el evento en la base de datos.');
        };
    };

    request.onerror = (event) => {
        console.error('Error en la base de datos: ' + event.target.errorCode);
    };
}

function updateEventInGoogleCalendar(event) {
    if (accessToken === null) {
        console.log('No access token available');
        return;
    }

    const googleEvent = {
        id: event.id,
        summary: event.title,
        location: event.location,
        description: event.description,
        start: {
            dateTime: event.start,
            timeZone: 'America/Los_Angeles' // Ajustar según tu zona horaria
        },
        end: {
            dateTime: event.end,
            timeZone: 'America/Los_Angeles' // Ajustar según tu zona horaria
        },
        attachments: event.attachments.map(fileName => ({
            fileUrl: fileName, // Esto asume que tienes una URL para los archivos adjuntos
            title: fileName
        })),
        extendedProperties: {
            shared: {
                course: event.course
            }
        }
    };

    gapi.client.calendar.events.update({
        'calendarId': 'primary',
        'eventId': event.id,
        'resource': googleEvent
    }).then(response => {
        console.log('Evento actualizado en Google Calendar:', response);
    }).catch(error => {
        console.error('Error al actualizar el evento en Google Calendar:', error);
    });
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
            attachments: event.attachments,
            course: event.course
        }
    });
}

function saveEventToGoogleCalendar(event) {
    if (accessToken === null) {
        console.log('No access token available');
        return;
    }

    const googleEvent = {
        summary: event.title,
        location: event.location,
        description: event.description,
        start: {
            dateTime: event.start,
            timeZone: 'America/Los_Angeles' // Ajustar según tu zona horaria
        },
        end: {
            dateTime: event.end,
            timeZone: 'America/Los_Angeles' // Ajustar según tu zona horaria
        },
        attachments: event.attachments.map(fileName => ({
            fileUrl: fileName, // Esto asume que tienes una URL para los archivos adjuntos
            title: fileName
        })),
        extendedProperties: {
            shared: {
                course: event.course
            }
        }
    };

    gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': googleEvent
    }).then(response => {
        console.log('Evento guardado en Google Calendar:', response);
    }).catch(error => {
        console.error('Error al guardar el evento en Google Calendar:', error);
    });
}
