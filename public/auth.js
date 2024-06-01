const CLIENT_ID = '1007808016979-rm131pqv458qpg0pk0qi1blhusdhfs5n.apps.googleusercontent.com';

let tokenClient;
let accessToken = null;
let userProfile = null;

function handleClientLoad() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile',
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
    getUserInfo(); // Fetch user profile information
}

function handleAuthClick() {
    if (accessToken === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
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
        document.getElementById('user-email').textContent = userProfile ? userProfile.email : 'Signed in';
        document.getElementById('user-profile-picture').src = userProfile.picture;
        document.getElementById('user-profile-picture').style.display = 'inline-block';
        document.getElementById('user-name').textContent = userProfile.name;
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('sign-in-btn').style.display = 'none';
        document.getElementById('sign-out-btn').style.display = 'inline-block';
    } else {
        document.getElementById('user-email').textContent = '';
        document.getElementById('user-profile-picture').style.display = 'none';
        document.getElementById('user-name').textContent = '';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('sign-in-btn').style.display = 'inline-block';
        document.getElementById('sign-out-btn').style.display = 'none';
        initializeEmptyCalendar();
    }
}

function getUserInfo() {
    gapi.client.request({
        'path': 'https://www.googleapis.com/oauth2/v3/userinfo',
        'method': 'GET',
        'headers': {
            'Authorization': `Bearer ${accessToken}`
        }
    }).then(response => {
        userProfile = response.result;
        updateSigninStatus(true); // Ensure status is updated after fetching user info
    }, error => {
        console.error('Error fetching user profile:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    handleClientLoad();
});
