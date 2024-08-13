// Load map data from the JSON file
fetch('data/maps.json')
  .then(response => response.json())
  .then(data => {
    window.mapsData = data; // Store data globally for easy access
    applyFilters(); // Apply initial filters and display maps
  });

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

  var filteredMaps = window.mapsData.filter(function(map) {
    var matchesFun = map.funRating >= minFun && map.funRating <= maxFun;
    var matchesDifficulty = map.hardRating >= minDifficulty && map.hardRating <= maxDifficulty;
    var matchesHoleInOne = holeInOne === "" || map.courseType === holeInOne;

    return matchesFun && matchesDifficulty && matchesHoleInOne;
  });

  displayFilteredMaps(filteredMaps);
}

function displayFilteredMaps(maps) {
  var mapSelectionContainer = document.getElementById('map-selection');
  mapSelectionContainer.innerHTML = ''; // Clear previous results

  maps.forEach(function(map) {
    createMapBox(map);
  });
}

function createMapBox(map) {
  var div = document.createElement('div');
  div.className = 'map-box';
  div.onclick = function() {
    displayMapDetails(map);
  };

  var img = document.createElement('img');
  img.src = map.imageUrl || 'https://via.placeholder.com/150';
  img.className = 'map-image';
  div.appendChild(img);

  var span = document.createElement('span');
  span.className = 'map-title';
  span.textContent = map.mapName;
  div.appendChild(span);

  var detailsDiv = document.createElement('div');
  detailsDiv.className = 'map-details';
  detailsDiv.innerHTML = 'Holes: ' + (map.numHoles || 'N/A') + '<br>' +
                         'Par: ' + (map.coursePar || 'N/A') + '<br>' +
                         'Avg Fun: ' + map.avgFun + '<br>' +
                         'Avg Hard: ' + map.avgHard;
  div.appendChild(detailsDiv);

  document.getElementById('map-selection').appendChild(div);
}

function displayMapDetails(map) {
  document.querySelector('.left-panel').style.width = '60%';
  document.getElementById('expanded-map-details').classList.add('expanded');

  document.getElementById('expanded-map-title').innerText = map.mapName;
  document.getElementById('expanded-map-info').innerHTML = ''; // Clear previous data

  var rowHtml = '<tr>' +
    '<td>' + (map.courseType || 'N/A') + '</td>' +
    '<td>' + (map.numHoles || 'N/A') + '</td>' +
    '<td>' + (map.coursePar || 'N/A') + '</td>' +
    '<td>' + (map.avgFun || 'N/A') + '</td>' +
    '<td>' + (map.avgHard || 'N/A') + '</td>' +
  '</tr>';
  document.getElementById('expanded-map-info').innerHTML += rowHtml;
}

function closeMapDetails() {
  document.getElementById('expanded-map-details').classList.remove('expanded');
  document.querySelector('.left-panel').style.width = '100%';
}
