function updateSliderValue(spanId, slider) {
    var value = slider.value;
    var sliderRect = slider.getBoundingClientRect();
    var thumbWidth = 20;
    var sliderWidth = sliderRect.width - thumbWidth;

    var min = slider.min;
    var max = slider.max;

    var position = ((value - min) / (max - min)) * sliderWidth;
    position = position + (thumbWidth / 2);

    var span = document.getElementById(spanId);
    span.innerText = value;

    if (value == min) {
        span.style.left = '0px';
    } else if (value == max) {
        span.style.left = (sliderWidth + thumbWidth) + 'px';
    } else {
        span.style.left = position + 'px';
    }
}

function applyFilters() {
    var minFun = document.getElementById('funRangeMin').value || 0;
    var maxFun = document.getElementById('funRangeMax').value || 10;
    var minDifficulty = document.getElementById('difficultyRangeMin').value || 0;
    var maxDifficulty = document.getElementById('difficultyRangeMax').value || 10;
    var holeInOne = document.getElementById('holeInOne').value || "";

    fetchMapData(minFun, maxFun, minDifficulty, maxDifficulty, holeInOne)
        .then(displayFilteredMaps)
        .catch(console.error);
}

function displayFilteredMaps(maps) {
    const mapSelection = document.getElementById('map-selection');
    mapSelection.innerHTML = '';

    if (!maps || maps.length === 0) {
        console.log("No maps matched the criteria.");
        return;
    }

    maps.forEach(function (map) {
        createMapBox(map);
    });
}

function createMapBox(map) {
    const mapSelection = document.getElementById('map-selection');

    const div = document.createElement('div');
    div.className = 'map-box';
    div.onclick = function () {
        displayMapDetails(map.mapName);
    };

    getMapImageUrl(map.mapName)
        .then(function (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.className = 'map-image';
            div.appendChild(img);

            const span = document.createElement('span');
            span.className = 'map-title';
            span.textContent = map.mapName;
            div.appendChild(span);

            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'map-details';
            detailsDiv.innerHTML = 'Holes: ' + (map.numHoles || 'N/A') + '<br>' +
                'Par: ' + (map.coursePar || 'N/A') + '<br>' +
                'Avg Fun: ' + map.avgFun + '<br>' +
                'Avg Hard: ' + map.avgHard;
            div.appendChild(detailsDiv);

            mapSelection.appendChild(div);
        })
        .catch(console.error);
}

function displayMapDetails(mapName) {
    document.querySelector('.left-panel').style.width = '60%';
    const expandedDetails = document.getElementById('expanded-map-details');
    expandedDetails.classList.add('expanded');

    fetchExpandedMapDetails(mapName)
        .then(function (data) {
            document.getElementById('expanded-map-title').innerText = mapName;
            const expandedMapInfo = document.getElementById('expanded-map-info');
            expandedMapInfo.innerHTML = '';

            data.forEach(function (row) {
                const rowHtml = '<tr>' +
                    '<td>' + (row[0] || 'N/A') + '</td>' +
                    '<td>' + (row[1] || 'N/A') + '</td>' +
                    '<td>' + (row[4] || 'N/A') + '</td>' +
                    '<td>' + (row[5] || 'N/A') + '</td>' +
                    '<td>' + (row[6] || 'N/A') + '</td>' +
                    '<td>' + (row[7] || 'N/A') + '</td>' +
                    '<td>' + (row[8] || 'N/A') + '</td>' +
                    '</tr>';
                expandedMapInfo.innerHTML += rowHtml;
            });
        })
        .catch(console.error);
}

function closeMapDetails() {
    const expandedDetails = document.getElementById('expanded-map-details');
    expandedDetails.classList.remove('expanded');
    document.querySelector('.left-panel').style.width = '100%';
}

window.onload = function () {
    updateSliderValue('funValueLabelMin', document.getElementById('funRangeMin'));
    updateSliderValue('funValueLabelMax', document.getElementById('funRangeMax'));
    updateSliderValue('difficultyValueLabelMin', document.getElementById('difficultyRangeMin'));
    updateSliderValue('difficultyValueLabelMax', document.getElementById('difficultyRangeMax'));

    applyFilters();
};
