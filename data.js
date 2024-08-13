const CLIENT_ID = '202216913973-5h3kp24b4d7d8mud2mtvncktp3a1o13k.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBoduy8syGpUpEcM2pGVVd1maIC_qXmLzw';
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

// Add your spreadsheet ID here
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Initialize the Google API client
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(() => {
        console.log("Google API client initialized.");
    }, (error) => {
        console.error(JSON.stringify(error, null, 2));
    });
}

// Load the Google API client library
gapi.load('client:auth2', initClient);

function fetchMapData(minFun, maxFun, minDifficulty, maxDifficulty, holeInOne) {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Raw Data!B2:L'
    }).then((response) => {
        const data = response.result.values;
        // Implement your filtering logic based on the min/max fun, difficulty, and holeInOne values
        return data.filter(row => {
            const funRating = parseFloat(row[7]);
            const difficultyRating = parseFloat(row[8]);
            const courseType = row[3];  // Hole in One Capable

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
            mapName: row[10],
            funRating: row[7],
            difficultyRating: row[8],
            courseType: row[3],
            numHoles: row[4],
            coursePar: row[5]
        }));
    });
}

function fetchExpandedMapDetails(mapName) {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Raw Data!B2:L'
    }).then((response) => {
        const data = response.result.values;
        return data.filter(row => row[10] === mapName).map(row => [
            row[0],  // Who the fuck are you?
            row[2],  // Type of Course
            row[3],  // Number of Holes?
            row[4],  // Course Par?
            row[5],  // Course Type
            row[6],  // Aim Markers?
            row[7],  // Fun Rating
            row[8],  // Hard Rating
            row[9]   // Who was better at the course?
        ]);
    });
}

function getMapImageUrl(mapName) {
    // Here you would implement the logic to fetch the image URL
    // This could be a pre-stored URL in the Google Sheet or another service
    // For simplicity, return a placeholder image
    return new Promise((resolve) => {
        resolve('https://via.placeholder.com/150');
    });
}
