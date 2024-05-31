document.addEventListener('DOMContentLoaded', () => {
    // Inicializar IndexedDB
    const request = indexedDB.open('SyncCalDB', 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('start', 'start', { unique: false });
        objectStore.createIndex('end', 'end', { unique: false });
        objectStore.createIndex('location', 'location', { unique: false });
        objectStore.createIndex('description', 'description', { unique: false });
        objectStore.createIndex('attachments', 'attachments', { unique: false });
        objectStore.createIndex('link', 'link', { unique: false });
        objectStore.createIndex('course', 'course', { unique: false });
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const form = document.getElementById('event-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const newEvent = {
                title: document.getElementById('event-title').value,
                start: document.getElementById('event-start').value,
                end: document.getElementById('event-end').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-description').value,
                attachments: document.getElementById('event-attachments').files,
                link: document.getElementById('event-link').value,
                course: document.getElementById('event-course').value
            };

            const transaction = db.transaction(['events'], 'readwrite');
            const objectStore = transaction.objectStore('events');
            const request = objectStore.add(newEvent);

            request.onsuccess = () => {
                console.log('Event has been added to your database.');
                form.reset();
                addEventToCalendar(newEvent);
            };

            request.onerror = () => {
                console.error('Error adding event to database.');
            };
        });
    };

    request.onerror = (event) => {
        console.error('Database error: ' + event.target.errorCode);
    };
});

function addEventToCalendar(event) {
    if (!calendar) return;

    calendar.addEvent({
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
