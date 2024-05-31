const CLIENT_ID = '1007808016979-rm131pqv458qpg0pk0qi1blhusdhfs5n.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDdKNxOkM7gT9K50qTRQjhR-nW_C_MS_8c';
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
        loadCalendar();
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

function loadCalendar() {
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: false,
        eventLimit: true,
        events: function(start, end, timezone, callback) {
            gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': start.toISOString(),
                'timeMax': end.toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 100,
                'orderBy': 'startTime'
            }).then((response) => {
                var events = response.result.items.map(event => {
                    return {
                        title: event.summary,
                        start: event.start.dateTime || event.start.date,
                        end: event.end.dateTime || event.end.date,
                        description: event.description
                    };
                });
                callback(events);
            });
        },
        eventClick: function(event) {
            alert('Event: ' + event.title + '\nDescription: ' + event.description + '\nStart: ' + event.start.format() + '\nEnd: ' + event.end.format());
        }
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
