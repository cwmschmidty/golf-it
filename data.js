const apiUrl = 'https://us-central1-golf-it-432417.cloudfunctions.net/getSheetData'; // Replace with your actual Google Cloud Function URL

// Function to fetch map data from Google Cloud Function
async function fetchMapData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const mapData = await response.json();
        return mapData;
    } catch (error) {
        console.error('Failed to fetch map data:', error);
        return [];
    }
}

// Function to display the fetched map data on the webpage
function displayMapData(mapData) {
    const mapSelectionContainer = document.getElementById('map-selection');
    mapSelectionContainer.innerHTML = ''; // Clear previous content

    mapData.forEach((map) => {
        const mapBox = document.createElement('div');
        mapBox.className = 'map-box';
        mapBox.innerHTML = `
            <img src="${map.imageUrl}" alt="${map.name}" class="map-image">
            <span class="map-title">${map.name}</span>
            <div class="map-details">
                <p>Holes: ${map.holes}</p>
                <p>Par: ${map.par}</p>
                <p>Fun Rating: ${map.funRating}</p>
                <p>Difficulty Rating: ${map.difficultyRating}</p>
            </div>
        `;
        mapBox.addEventListener('click', () => {
            displayMapDetails(map);
        });
        mapSelectionContainer.appendChild(mapBox);
    });
}

// Function to display detailed information about a selected map
function displayMapDetails(map) {
    const expandedMapDetails = document.getElementById('expanded-map-details');
    document.querySelector('.left-panel').style.width = '60%'; // Adjust the width of the left panel
    expandedMapDetails.classList.add('expanded');
    expandedMapDetails.innerHTML = `
        <h2 id="expanded-map-title">${map.name}</h2>
        <img src="${map.imageUrl}" alt="${map.name}" class="map-image">
        <table class="map-info-table">
            <thead>
                <tr>
                    <th>Who the fuck are you?</th>
                    <th>Type of Course</th>
                    <th>Course Type</th>
                    <th>Aim Markers</th>
                    <th>Fun Rating</th>
                    <th>Hard Rating</th>
                    <th>Who was better at the course?</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${map.whoAreYou}</td>
                    <td>${map.typeOfCourse}</td>
                    <td>${map.courseType}</td>
                    <td>${map.aimMarkers}</td>
                    <td>${map.funRating}</td>
                    <td>${map.difficultyRating}</td>
                    <td>${map.whoWasBetter}</td>
                </tr>
            </tbody>
        </table>
        <button class="close-btn" onclick="closeMapDetails()">Close</button>
    `;
}

// Function to close the map details view
function closeMapDetails() {
    const expandedMapDetails = document.getElementById('expanded-map-details');
    expandedMapDetails.classList.remove('expanded');
    document.querySelector('.left-panel').style.width = '100%'; // Reset the width of the left panel
}

// Function to initialize the application
window.onload = async function() {
    const mapData = await fetchMapData();

    if (mapData.length > 0) {
        displayMapData(mapData);
    } else {
        console.error('No map data available.');
    }
}
