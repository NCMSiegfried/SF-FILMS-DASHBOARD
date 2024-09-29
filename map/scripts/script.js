// Initialize  map
var map = L.map('map',{
    zoomControl: false,
    zoomSnap: 0,
    wheelDebounceTime: 100,
    zoomDelta:0.5,
    wheelPxPerZoomLevel:80,
    scrollWheelZoom: false
    }).setView([37.76, -122.48], 12.5);
map.scrollWheelZoom = true;

//position zoom buttons on top right
L.control.zoom({
    position:'topright',
}).addTo(map);

//Set Map Bounds
var bayAreaBounds = [
    [36.8, -123.3],
    [38.6, -121.5]
];
map.setMaxBounds(bayAreaBounds);

//Add 'smooth dark' tile layer from stadia maps with min zoom
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=8ff5f85d-e7f5-44fa-90bd-df95edd37619', {
  minZoom: 10,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
}).addTo(map);

//create variables for map markers
var defaultMarkerOptions = {
    radius: 3,
    fillColor: "#e6409e", //purplish
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
//create highlight colors
var highlightMarkerOptions = {
    radius: 5,
    fillColor: "#ffde21", //yellowish
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 1
};

var highlightedLayer = null;
var geojsonData;
var namesData;
var uniqueDirectors = new Set();
var uniqueProdCompanies = new Set();


// populate the directors dropdown
function populateDirectorDropdown() {
    var directorDropdown = document.getElementById("directorFilter");
    uniqueDirectors = Array.from(uniqueDirectors).sort();

    uniqueDirectors.forEach(function(director) {
        var option = document.createElement("option");
        option.value = director;
        option.text = director;
        directorDropdown.appendChild(option);
    });
}
// populate the production companies dropdown
function populateProdCompanyDropdown() {
    var ProdCompanyDropdown = document.getElementById("prodCompanyFilter");
    uniqueProdCompanies = Array.from(uniqueProdCompanies).sort();

    uniqueProdCompanies.forEach(function(prodCompany) {
        var option = document.createElement("option");
        option.value = prodCompany;
        option.text = prodCompany;
        ProdCompanyDropdown.appendChild(option);
    });
}


// Function to filter markers based on the selected director
function filterMarkersByDirector(director) {
    // Clear the existing layers before applying the filter
    map.eachLayer(function(layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Add the filtered markers
    console.log(director)
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, defaultMarkerOptions);
        },
        filter: function(feature) {
            // Show all markers if no director is selected
            if (!director) return true;

            // Otherwise, filter by the selected director
            return feature.properties.director1_name === director || feature.properties.director2_name === director;
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function () {
                resetHighlight();
                highlightedLayer = layer;
                layer.setStyle(highlightMarkerOptions);
                var coords = feature.geometry.coordinates;
                var properties = feature.properties;
                updateSidePanel(properties, coords, namesData);
            });
        }
    }).addTo(map);
}

// Function to filter markers based on the selected production company
function filterMarkersByProdCompany(prodCompany) {
    // Clear the existing layers before applying the filter
    map.eachLayer(function(layer) {
        if (layer instanceof L.CircleMarker) {
            map.removeLayer(layer);
        }
    });

    // Add the filtered markers
    L.geoJSON(geojsonData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, defaultMarkerOptions);
        },
        filter: function(feature) {
            // Show all markers if no director is selected
            if (!prodCompany) return true;

            // Otherwise, filter by the selected director
            return feature["properties"]["Production Company"] === prodCompany;
        },
        onEachFeature: function (feature, layer) {
            layer.on('click', function () {
                resetHighlight();
                highlightedLayer = layer;
                layer.setStyle(highlightMarkerOptions);
                var coords = feature.geometry.coordinates;
                var properties = feature.properties;
                updateSidePanel(properties, coords, namesData);
            });
        }
    }).addTo(map);
}

// Function to reset the highlight of all markers
function resetHighlight() {
    if (highlightedLayer) {
        highlightedLayer.setStyle(defaultMarkerOptions);
        highlightedLayer = null;
    }
}
//function for pop up
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Function to update the side panel with default content on page load
function sidePanelHome() {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `
        <h2>Welcome to the SF Films Map</h2>
        <p>Click on any marker to view film details.</p>
        <p>Select Film by Director</p>
        <select id="directorFilter">
            <option value="">All Directors</option>
        </select>
        <select id="prodCompanyFilter">
            <option value="">All Production Companies</option>
        </select>
    `;
    populateDirectorDropdown();
    populateProdCompanyDropdown();
    document.getElementById('directorFilter').addEventListener('change', function() {
    var selectedDirector = this.value;
    filterMarkersByDirector(selectedDirector);
    });
    document.getElementById('prodCompanyFilter').addEventListener('change', function() {
    var selectedProdCompany = this.value;
    filterMarkersByProdCompany(selectedProdCompany);
    });
}

function updateSidePanel(properties, coords, namesData) {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `
        <button id="back-button">
            Back
        </button>
        <p><a href="https://www.imdb.com/title/${properties.tconst}/" target= "_blank" rel="noopener noreferrer">
            <img src="images/${properties.tconst}/Image_1.jpg"/>
        </a></p>
        <table>
            <thead>
                <tr>
                    <th class="th-text" scope="col" colspan="2">${properties.Title || ''}</th>
                </tr>
            </thead>
            <tbody id="detailsTableBody">
            </tbody>
        </table>
        <div class="MoreInfoButton">
            <button id="MoreInfoButton">More Information</button>
        </div>
    `;
    appendMovieTable(properties);

    // Add event listener to the "More Information" button
    document.getElementById('MoreInfoButton').addEventListener('click', function() {
        // Hide the "More Information" button
        this.style.display = 'none';
        // Show additional details in the side panel
        showMoreDetails(properties, coords, namesData);
    });

    // Add event listener to the "Back" button
    document.getElementById('back-button').addEventListener('click', function() {
        // Go back to the default side panel content
        sidePanelHome();
        resetHighlight();
    });
}

function appendMovieTable(properties) {
    var tableBody = document.getElementById('detailsTableBody');
    if (properties['Release Year']) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Year Released</strong>";
        cell2.innerHTML = properties['Release Year'];
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    if (properties.genres) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Genre(s)</strong>";
        cell2.innerHTML = properties.genres;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');

    }
    if (properties.Locations) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Location</strong>";
        cell2.innerHTML = properties.Locations;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
}

function showMoreDetails(properties, coords, namesData) {
    var testing = properties.director1_nconst;
    console.log("Additional data loaded:", testing);
    console.log("Additional data loaded:", properties);

    var tableBody = document.getElementById('detailsTableBody');

    // Function to add a new row with slide-down animation
    function addRowWithSlideDown(label, value, delay, idx) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = `<strong>${label}</strong>`;
        cell2.innerHTML = value;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    let delay = 0;
    let idx = 0;

    if (properties['Production Company']) {
        addRowWithSlideDown("Production Company", properties['Production Company']);
    }

    if (properties.Distributor) {
        addRowWithSlideDown("Distributor", properties.Distributor);
    }

    if (properties.run_time) {
        addRowWithSlideDown("Run Time", properties.run_time + " minutes");
    }

    if (properties.avg_rating) {
        addRowWithSlideDown("Average IMDB Rating", properties.avg_rating);
    }

    if (properties.numVotes_comma) {
        addRowWithSlideDown("Number of IMDB Votes", properties.numVotes_comma);
    }

    if (properties.director1_name) {
        var directorNames = `
            <span class="director-link" data-nconst="${properties.director1_nconst}">${properties.director1_name}</span>
            ${properties.director2_name ? `, <span class="director-link" data-nconst="${properties.director2_nconst}">${properties.director2_name}</span>` : ''}
        `;
        addRowWithSlideDown("Director(s)", directorNames);
    }

    if (properties.writer1_name) {
        var writerNames = `
            <span class="writer-link" data-nconst="${properties.writer1_nconst}">${properties.writer1_name}</span>
            ${properties.writer2_name ? `, <span class="writer-link" data-nconst="${properties.writer2_nconst}">${properties.writer2_name}</span>` : ''}
            ${properties.writer3_name ? `, <span class="writer-link" data-nconst="${properties.writer3_nconst}">${properties.writer3_name}</span>` : ''}
        `;
        addRowWithSlideDown("Writer(s)", writerNames);
    }

    // Adding event listeners for directors links
    document.querySelectorAll('.director-link').forEach(function(element) {
        element.addEventListener('click', function() {
            var nconst = this.getAttribute('data-nconst');
            showNameDetails(properties, coords, nconst, namesData);
        });
    });

    // Adding event listeners for writers links
    document.querySelectorAll('.writer-link').forEach(function(element) {
        element.addEventListener('click', function() {
            var nconst = this.getAttribute('data-nconst');
            showNameDetails(properties, coords, nconst, namesData);
        });
    });

    // Add event listener to the "Back" button
    document.getElementById('back-button').addEventListener('click', function() {
        // Go back to the previous state of the side panel
        sidePanelHome();
        resetHighlight();
    });
}


function appendNameTable(nconst, namesData) {
    var tableBody = document.getElementById('detailsTableBody');
    if (namesData[nconst].birthYear && namesData[nconst].birthYear !== 'null') {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Born</strong>";
        cell2.innerHTML = namesData[nconst].birthYear;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    if (namesData[nconst].deathYear && namesData[nconst].deathYear !== 'null') {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Death</strong>";
        cell2.innerHTML = namesData[nconst].deathYear;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    if (namesData[nconst].primaryProfession) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Primary Professions</strong>";
        cell2.innerHTML = namesData[nconst].primaryProfession;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
    if (namesData[nconst].KnowForTitleNames) {
        var row = tableBody.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.innerHTML = "<strong>Notable Works:</strong>";
        cell2.innerHTML = namesData[nconst].KnowForTitleNames;
        cell1.classList.add('cell1-text');
        cell2.classList.add('cell2-text');
    }
}

function showNameDetails(properties, coords, nconst, namesData) {
    // Check if the nconst exists in namesData and access the primaryName
    if (namesData[nconst]) {
        var sidePanel = document.getElementById('sidePanel');
        sidePanel.innerHTML = `
            <button id="back-button">
                Back
            </button>
            <p><a href="https://www.imdb.com/name/${nconst}/" target= "_blank" rel="noopener noreferrer">
                <img src="images/${nconst}/Image_1.jpg"/>
            </a></p>
            <table>
                <thead>
                    <tr>
                        <th scope="col" colspan="2">${namesData[nconst].primaryName}</th>
                    </tr>
                </thead>
                <tbody id="detailsTableBody">
                </tbody>
            </table>
        `;
        appendNameTable(nconst, namesData);

        // Add event listener to the "Back" button
        document.getElementById('back-button').addEventListener('click', function() {
            // Go back to the previous side panel state with film details
            updateSidePanel(properties, coords, namesData);
            document.getElementById( 'MoreInfoButton' ).style.display = 'none';
            showMoreDetails(properties, coords, namesData);
        });
    } else {
        console.error("Director details not found for nconst:", nconst);
    }
}

// Load the additional JSON file
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/refs/heads/main/map/data/Names.json", function(data) {
    namesData = data;
    console.log("Additional data loaded:", namesData);
}).fail(function(textStatus, error) {
    var err = textStatus + ", " + error;
    console.error('Error loading additional JSON file: ' + err);
});

// Load GeoJSON from github, pass data through functions
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/main/map/data/data.geojson", function(data) {
    geojsonData = data;
    // Load GeoJSON data into the map
    var geojsonLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, defaultMarkerOptions);
        },
        onEachFeature: function (feature, layer) {
            // Extract director names and add them to the Set
            if (feature.properties.director1_name) {
                uniqueDirectors.add(feature.properties.director1_name);
            }
            if (feature.properties.director2_name) {
                uniqueDirectors.add(feature.properties.director2_name);
            }
            if (feature["properties"]["Production Company"]) {
                uniqueProdCompanies.add(feature["properties"]["Production Company"]);
            }
            // Attach click event listener to each feature (point)
            layer.on('click', function () {
                resetHighlight(); // Reset highlight of previously selected marker
                highlightedLayer = layer; // Set the currently clicked layer as highlighted
                layer.setStyle(highlightMarkerOptions);
                var coords = feature.geometry.coordinates;
                var properties = feature.properties;
                // Update the side panel when the point is clicked
                updateSidePanel(properties, coords, namesData);
            });
        }
    }).addTo(map);
    sidePanelHome();
}).fail(function() {
    console.error('Error loading GeoJSON file');
});


// Prevent map clicks when interacting with the side panel
document.getElementById('sidePanel').addEventListener('mouseover', function(event) {
    map.dragging.disable();  // Stops event from bubbling to the map
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
});
// Enable map clicks again when mouse is outside of panel
document.getElementById('sidePanel').addEventListener('mouseout', function(event) {
    map.dragging.enable();  // Stops event from bubbling to the map
    map.doubleClickZoom.enable();
    map.touchZoom.enable();
//    map.scrollWheelZoom.enable() //FIX
});


