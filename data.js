const CLIENT_ID = '202216913973-5h3kp24b4d7d8mud2mtvncktp3a1o13k.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBoduy8syGpUpEcM2pGVVd1maIC_qXmLzw';
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// Initialize the Google API client
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        gapiInited = true;
        checkAuthStatus();
    }, (error) => {
        console.error(JSON.stringify(error, null, 2));
    });
}

// Initialize the authorization flow
function gisInit() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',  // defined later
    });
    gisInited = true;
    checkAuthStatus();
}

function checkAuthStatus() {
    if (gapiInited && gisInited) {
        // Check if user is already signed in
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // If already signed in, fetch data
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
            updateSigninStatus(true);
        } else {
            // If not signed in, prompt sign-in
            promptSignIn();
        }
    }
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log("User signed in. Fetching data...");
        applyFilters(); // Fetch data after signing in
    } else {
        console.log("User not signed in.");
    }
}

function promptSignIn() {
    tokenClient.callback = (response) => {
        if (response.error !== undefined) {
            throw (response);
        }
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    };

    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
        updateSigninStatus(true);
    } else {
        tokenClient.requestAccessToken({prompt: 'consent'});
    }
}

// Load the Google API client library
gapi.load('client:auth2', initClient);
gisInit();
