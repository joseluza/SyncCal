const CLIENT_ID = 'TU_CLIENT_ID';
const API_KEY = 'TU_API_KEY';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

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
        const authInstance = gapi.auth2.getAuthInstance();
        authInstance.isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(authInstance.isSignedIn.get());
    }, (error) => {
        console.error(JSON.stringify(error, null, 2));
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const profile = user.getBasicProfile();
        userEmail = profile.getEmail();

        document.getElementById('user-email').textContent = `Signed in as: ${profile.getEmail()}`;
        document.getElementById('sign-in-btn').style.display = 'none';
        document.getElementById('sign-out-btn').style.display = 'inline-block';
        loadCalendarEvents();
    } else {
        userEmail = '';
        document.getElementById('user-email').textContent = '';
        document.getElementById('sign-in-btn').style.display = 'inline-block';
        document.getElementById('sign-out-btn').style.display = 'none';
        initializeEmptyCalendar();
    }
}

function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut().then(() => {
        updateSigninStatus(false);
    });
}

function loadCalendarEvents() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': new Date().toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 100,
        'orderBy': 'startTime'
    }).then((response) => {
        const events = response.result.items.map(event => {
            return {
                id: event.id,
                title: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                description: event.description,
                location: event.location,
                extendedProps: {
                    link: event.htmlLink,
                    course: '',
                    delivery: '',
                    importance: ''
                }
            };
        });

        events.forEach(event => {
            addEventToCalendar(event);
            addEventToPendingTasks(event);
        });
    }).catch((error) => {
        console.error('Error al cargar eventos de Google Calendar: ' + error);
    });
}
