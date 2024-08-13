const CLIENT_ID = '202216913973-5h3kp24b4d7d8mud2mtvncktp3a1o13k.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBoduy8syGpUpEcM2pGVVd1maIC_qXmLzw';
const SPREADSHEET_ID = '13DEleKAdbmIKDrOwonoq9flTBw7CgmavfhnM2H7W4ZU';  // Replace with your actual Spreadsheet ID
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

// Function to fetch map data from the Google Sheets
function fetchMapData(minFun, maxFun, minDifficulty, maxDifficulty, holeInOne) {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Raw Data!B2:L' // Ensure this matches your actual sheet range
    }).then((response) => {
        const data = response.result.values;
        return data.filter(row => {
            const funRating = parseFloat(row[6]);
            const difficultyRating = parseFloat(row[7]);
            const courseType = row[1];

            let holeInOneMatch = true;
            if (holeInOne === "Yes") {
                holeInOneMatch = courseType === "Hole in One Capable";
            } else if (holeInOne === "No") {
                holeInOneMatch = courseType !== "Hole in One Capable";
            }

            return funRating >= minFun && funRating <= maxFun &&
                difficultyRating >= minDifficulty && difficultyRating <= maxDifficulty &&
                holeInOneMatch;
        }).map(row => ({
            mapName: row[9],
            funRating: row[6],
            difficultyRating: row[7],
            courseType: row[1],
            numHoles: row[3],
            coursePar: row[4]
        }));
    }).catch((error) => {
        console.error("Error fetching data from Google Sheets: ", error);
    });
}

// Function to update the UI with the filtered maps
function applyFilters() {
    const minFun = document.getElementById('funRangeMin').value || 0;
    const maxFun = document.getElementById('funRangeMax').value || 10;
    const minDifficulty = document.getElementById('difficultyRangeMin').value || 0;
    const maxDifficulty = document.getElementById('difficultyRangeMax').value || 10;
    const holeInOne = document.getElementById('holeInOne').value || "";

    fetchMapData(minFun, maxFun, minDifficulty, maxDifficulty, holeInOne).then((filteredMaps) => {
        displayFilteredMaps(filteredMaps);
    });
}

// Display filtered maps in the UI
function displayFilteredMaps(maps) {
    const mapContainer = document.getElementById('map-selection');
    mapContainer.innerHTML = '';  // Clear previous results

    if (!maps || maps.length === 0) {
        console.log("No maps matched the criteria.");
        return;
    }

    maps.forEach(map => {
        createMapBox(map);
    });
}

function createMapBox(map) {
    const mapContainer = document.getElementById('map-selection');

    const div = document.createElement('div');
    div.className = 'map-box';
    div.onclick = function() {
        displayMapDetails(map.mapName);
    };

    const span = document.createElement('span');
    span.className = 'map-title';
    span.textContent = map.mapName;
    div.appendChild(span);

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'map-details';
    detailsDiv.innerHTML = 'Holes: ' + (map.numHoles || 'N/A') + '<br>' +
                           'Par: ' + (map.coursePar || 'N/A') + '<br>' +
                           'Avg Fun: ' + map.funRating + '<br>' +
                           'Avg Hard: ' + map.difficultyRating;
    div.appendChild(detailsDiv);

    mapContainer.appendChild(div);
}

// Display map details in the expanded section
function displayMapDetails(mapName) {
    // Implement the logic to fetch and display the full details of the selected map
    // You may need another API call to get the full details, if necessary
    console.log("Displaying details for map: " + mapName);
}

window.onload = function() {
    // Call updateSliderValue for both the min and max sliders
    updateSliderValue('funValueLabelMin', document.getElementById('funRangeMin'));
    updateSliderValue('funValueLabelMax', document.getElementById('funRangeMax'));
    updateSliderValue('difficultyValueLabelMin', document.getElementById('difficultyRangeMin'));
    updateSliderValue('difficultyValueLabelMax', document.getElementById('difficultyRangeMax'));

    // Apply the filters and display the initial set of maps
    applyFilters();
};
