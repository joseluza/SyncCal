const CLIENT_ID = 'TU_CLIENT_ID'; // Reemplaza con tu ID de cliente de Google
const API_KEY = 'TU_API_KEY'; // Reemplaza con tu clave de API de Google
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// Cargar la biblioteca de cliente de la API y auth2
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        // Escuchar cambios en el estado de autenticación
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Manejar el estado de autenticación inicial
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, (error) => {
        console.error(JSON.stringify(error, null, 2));
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const profile = user.getBasicProfile();
        document.getElementById('user-email').textContent = `Signed in as: ${profile.getEmail()}`;
        document.getElementById('sign-in-btn').style.display = 'none';
        document.getElementById('sign-out-btn').style.display = 'inline-block';
        listUpcomingEvents();
    } else {
        document.getElementById('user-email').textContent = '';
        document.getElementById('sign-in-btn').style.display = 'inline-block';
        document.getElementById('sign-out-btn').style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut().then(() => {
        updateSigninStatus(false);
    });
}

function listUpcomingEvents() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then((response) => {
        const events = response.result.items;
        renderCalendar(events);
    });
}

function renderCalendar(events) {
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = ''; // Limpiar eventos anteriores

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        const when = event.start.dateTime || event.start.date;
        eventDiv.innerText = `${event.summary} (${new Date(when).toLocaleString()})`;
        calendarDiv.appendChild(eventDiv);
    });
}

function filterByDate() {
    // Implementar lógica de filtrado por fecha
}

function filterByCourse() {
    // Implementar lógica de filtrado por curso
}

function filterByImportance() {
    // Implementar lógica de filtrado por importancia
}

document.addEventListener('DOMContentLoaded', handleClientLoad);
