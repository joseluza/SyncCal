document.addEventListener('DOMContentLoaded', () => {
    const request = indexedDB.open('SyncCalDB', 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const objectStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: false });
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('start', 'start', { unique: false });
        objectStore.createIndex('end', 'end', { unique: false });
        objectStore.createIndex('location', 'location', { unique: false });
        objectStore.createIndex('description', 'description', { unique: false });
        objectStore.createIndex('link', 'link', { unique: false });
        objectStore.createIndex('course', 'course', { unique: false });
        objectStore.createIndex('delivery', 'delivery', { unique: false });
        objectStore.createIndex('importance', 'importance', { unique: false });
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const form = document.getElementById('event-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const newEvent = {
                id: form.dataset.editing ? form.dataset.id : Date.now().toString(),
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

            if (form.dataset.editing) {
                updateEventInIndexedDB(newEvent);
            } else {
                addEventToIndexedDB(newEvent);
            }

            form.reset();
            form.style.display = 'none';
            delete form.dataset.editing;
        });
    };

    request.onerror = (event) => {
        console.error('Error en la base de datos: ' + event.target.errorCode);
    };
});
