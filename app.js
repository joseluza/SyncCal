const CLIENT_ID = '1007808016979-rm131pqv458qpg0pk0qi1blhusdhfs5n.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDdKNxOkM7gT9K50qTRQjhR-nW_C_MS_8c';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// Load the API client and auth2 library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function(error) {
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
    }).then(function(response) {
        const events = response.result.items;
        renderCalendar(events);
    });
}

function renderCalendar(events) {
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = ''; // Clear previous events

    events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event';
        const when = event.start.dateTime || event.start.date;
        eventDiv.innerText = `${event.summary} (${when})`;
        calendarDiv.appendChild(eventDiv);
    });
}

function filterByDate() {
    // Implement filter logic by date
}

function filterByCourse() {
    // Implement filter logic by course
}

function filterByImportance() {
    // Implement filter logic by importance
}

document.addEventListener('DOMContentLoaded', function() {
    handleClientLoad();
});
