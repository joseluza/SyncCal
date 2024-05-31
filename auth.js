const CLIENT_ID = '1007808016979-rm131pqv458qpg0pk0qi1blhusdhfs5n.apps.googleusercontent.com';

let tokenClient;
let accessToken = null;

function handleClientLoad() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
        callback: handleAuthResponse, // Define callback function for handling responses
    });
}

function handleAuthResponse(response) {
    if (response.error !== undefined) {
        console.error('Error during authentication:', response.error);
        throw response;
    }
    accessToken = response.access_token;
    updateSigninStatus(true);
    loadCalendarEvents();
}

function handleAuthClick() {
    if (accessToken === null) {
        // Prompt the user to select an account and sign in.
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignoutClick() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken, () => {
            console.log('Access token revoked');
            updateSigninStatus(false);
        });
    }
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        document.getElementById('user-email').textContent = 'Signed in';
        document.getElementById('sign-in-btn').style.display = 'none';
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('sign-out-btn').style.display = 'inline-block';
    } else {
        document.getElementById('user-email').textContent = '';
        document.getElementById('sign-in-btn').style.display = 'inline-block';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('sign-out-btn').style.display = 'none';
        initializeEmptyCalendar();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    handleClientLoad();
});

function loadGapiClient() {
    gapi.load('client', () => {
        gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
        }).then(() => {
            console.log('GAPI client loaded for API');
        }).catch((error) => {
            console.error('Error loading GAPI client for API', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    handleClientLoad();
    loadGapiClient(); // Ensure GAPI client is loaded
});
