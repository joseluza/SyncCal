const CLIENT_ID = '1007808016979-rm131pqv458qpg0pk0qi1blhusdhfs5n.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDdKNxOkM7gT9K50qTRQjhR-nW_C_MS_8c';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let calendar;

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
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
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
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: function(fetchInfo, successCallback, failureCallback) {
            gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': fetchInfo.startStr,
                'timeMax': fetchInfo.endStr,
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
                successCallback(events);
            });
        },
        eventClick: function(info) {
            alert('Event: ' + info.event.title + '\nDescription: ' + info.event.extendedProps.description + '\nStart: ' + info.event.start.toISOString() + '\nEnd: ' + info.event.end.toISOString());
        }
    });
    calendar.render();
}

function filterByDate() {
    let events = calendar.getEvents();
    let filteredEvents = events.filter(event => {
        let today = new Date();
        let eventDate = new Date(event.start);
        return eventDate >= today;
    });
    calendar.removeAllEvents();
    filteredEvents.forEach(event => calendar.addEvent(event));
}

function filterByCourse() {
    let course = prompt("Enter the course name to filter by:");
    let events = calendar.getEvents();
    let filteredEvents = events.filter(event => event.title.includes(course));
    calendar.removeAllEvents();
    filteredEvents.forEach(event => calendar.addEvent(event));
}

function filterByImportance() {
    let importance = prompt("Enter the importance level to filter by (e.g., High, Medium, Low):");
    let events = calendar.getEvents();
    let filteredEvents = events.filter(event => event.extendedProps.importance === importance);
    calendar.removeAllEvents();
    filteredEvents.forEach(event => calendar.addEvent(event));
}

document.addEventListener('DOMContentLoaded', handleClientLoad);
