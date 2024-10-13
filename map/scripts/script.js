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

//FILTER VARIABLES
var uniqueDirectors = new Set();
var uniqueProdCompanies = new Set();
var uniqueDistributors = new Set();
var uniqueWriters = new Set();
var uniqueGenres = new Set();

var selectedDirector = null;
var selectedProdCompany = null;
var selectedDistributor = null;
var selectedWriter = null;
var selectedGenre = null;

var uniqueDirectorsSelected = new Set();
var uniqueProdCompaniesSelected = new Set();
var uniqueDistributorsSelected = new Set();
var uniqueWritersSelected = new Set();
var uniqueGenresSelected = new Set();

var filterIndexing = new Set();


//TRIAL: POPULATE DROP DOWNS DYNAMICALLY
function populateDropdown(dropdownId, dataSet, savedValue) {
    const dropdown = document.getElementById(dropdownId);
    const sortedData = Array.from(dataSet).sort();
    dropdown.length = 0;
    const option = document.createElement("option");
    option.value = '';
    if (dropdownId == "directorFilter"){
        option.text = 'Select Director';
        dropdown.appendChild(option);
    } else if (dropdownId == "prodCompanyFilter"){
        option.text = 'Select Production Company';
        dropdown.appendChild(option);
    } else if (dropdownId == "distributorFilter"){
        option.text = 'Select Distributor';
        dropdown.appendChild(option);
    } else if (dropdownId == "writerFilter"){
        option.text = 'Select Writer';
        dropdown.appendChild(option);
    } else if (dropdownId == "genreFilter"){
        option.text = 'Select Genre';
        dropdown.appendChild(option);
    }
    //console.log(dropdownId, dataSet, savedValue, dropdown)
    dropdown.appendChild(option);
    sortedData.forEach(function(item) {
        const option = document.createElement("option");
        option.value = item;
        option.text = item;
        dropdown.appendChild(option);
    });
    if (savedValue) {
        dropdown.value = savedValue;
    }
}

// Use the function to populate both dropdowns
function populateDropDowns() {
    populateDropdown("directorFilter", uniqueDirectors, selectedDirector);
    populateDropdown("prodCompanyFilter", uniqueProdCompanies, selectedProdCompany);
    populateDropdown("distributorFilter", uniqueDistributors, selectedDistributor);
    populateDropdown("writerFilter", uniqueWriters, selectedWriter);
    populateDropdown("genreFilter", uniqueGenres, selectedGenre);
}

// Function to filter markers based on the selected director or production company
function filterMarkers(director, prodCompany, distributor, writer, genre) {
    uniqueProdCompaniesSelected.clear();
    uniqueDirectorsSelected.clear();
    uniqueDistributorsSelected.clear();
    uniqueWritersSelected.clear();
    uniqueGenresSelected.clear();

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
            // Show all markers if no filters are selected
            if (!director && !prodCompany && !distributor && !writer && !genre) return true;

            // Check each filter condition independently
            let matchesDirector = true;
            let matchesProdCompany = true;
            let matchesDistributor = true;
            let matchesWriter = true;
            let matchesGenre = true;

            // Check for director match if a director is specified
            if (director) {
                matchesDirector = feature.properties.director1_name === director || feature.properties.director2_name === director;
            }

            // Check for production company match if a production company is specified
            if (prodCompany) {
                matchesProdCompany = feature.properties["Production Company"] === prodCompany;
            }

            // Check for distributor match if a distributor is specified
            if (distributor) {
                matchesDistributor = feature.properties.Distributor === distributor;
            }

            // Check for writer match if a writer is specified
            if (writer) {
                matchesWriter = feature.properties.writer1_name === writer ||
                                feature.properties.writer2_name === writer ||
                                feature.properties.writer3_name === writer;
                console.log(feature.properties.writer1_name === writer)
            }
            if (genre) {
                matchesGenre = feature.properties.genres.includes(genre);
            }
            // Return true only if all specified filters match
            return matchesDirector && matchesProdCompany && matchesDistributor && matchesWriter && matchesGenre;
        },
        onEachFeature: function (feature, layer) {
            // Update unique production companies and directors for the dropdowns
            if (feature.properties.director1_name) {
                uniqueDirectorsSelected.add(feature.properties.director1_name);
            }
            if (feature.properties.director2_name) {
                uniqueDirectorsSelected.add(feature.properties.director2_name);
            }
            uniqueProdCompaniesSelected.add(feature.properties["Production Company"]);
            uniqueDistributorsSelected.add(feature.properties.Distributor);
            if (feature.properties.writer1_name) {
                uniqueWritersSelected.add(feature.properties.writer1_name);
            }
            if (feature.properties.writer2_name) {
                uniqueWritersSelected.add(feature.properties.writer2_name);
            }
            if (feature.properties.writer3_name) {
                uniqueWritersSelected.add(feature.properties.writer3_name);
            }
            if (feature.properties.genres) {
                let genres = feature.properties.genres
                genres = genres.split(',')
                genres.forEach(function (item, index){
                uniqueGenresSelected.add(item.trim())
                })
            }
            // Add click event to highlight the marker and update the side panel
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

    // Update dropdowns with the unique values collected
    populateDropdown("prodCompanyFilter", uniqueProdCompaniesSelected, selectedProdCompany);
    populateDropdown("directorFilter", uniqueDirectorsSelected, selectedDirector);
    populateDropdown("distributorFilter", uniqueDistributorsSelected, selectedDistributor);
    populateDropdown("writerFilter", uniqueWritersSelected, selectedWriter);
    populateDropdown("genreFilter", uniqueGenresSelected, selectedGenre);

    // Log the updated sets for debugging
    console.log("Filtered Production Companies:", uniqueProdCompaniesSelected);
    console.log("Filtered Directors:", uniqueDirectorsSelected);
    console.log("Filtered Distributor:", uniqueDistributorsSelected);
    console.log("Filtered Writer:", uniqueWritersSelected);
    console.log("Filtered Genre:", uniqueGenresSelected);
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
        <h2>San Francisco Films Map</h2>
        <p>Click on any marker to view film details.</p>
        <p>Select Film by Director</p>
        <div id="filterContainer">
            <select class= "dropdown hidden" id="directorFilter">
            </select>
            <select class= "dropdown hidden" id="prodCompanyFilter">
            </select>
            <select class= "dropdown hidden" id="distributorFilter">
            </select>
            </select>
            <select class= "dropdown hidden" id="writerFilter">
            </select>
            </select>
            <select class= "dropdown hidden" id="genreFilter">
            </select>
        </div>
        <div id="filterSelectorContainer">
            <br/>
            <select class="dropdown" id="filterSelector">
                <option value="">--Select--</option>
                <option value="directorFilter">Director</option>
                <option value="prodCompanyFilter">Production Company</option>
                <option value="distributorFilter">Distributor</option>
                <option value="writerFilter">Writer</option>
                <option value="genreFilter">Genre</option>
            </select>
        </div>
        <br/>
        <button id="reset-filter">
            Reset Filter
        </button>
    `;
    populateDropDowns();
    document.getElementById('directorFilter').addEventListener('change', function() {
        selectedDirector = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre);
    });
    document.getElementById('prodCompanyFilter').addEventListener('change', function() {
        selectedProdCompany = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre);
    });
    document.getElementById('distributorFilter').addEventListener('change', function() {
        selectedDistributor = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre);
    });
    document.getElementById('writerFilter').addEventListener('change', function() {
        selectedWriter = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre);
    });
    document.getElementById('genreFilter').addEventListener('change', function() {
        selectedGenre = this.value;
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre);
    });
    document.getElementById('reset-filter').addEventListener('click', function() {
        selectedDirector = null;
        selectedProdCompany = null;
        selectedDistributor = null;
        selectedWriter = null;
        selectedGenre = null;
        populateDropDowns();
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre);
    });
    if (selectedDirector || selectedProdCompany || selectedDistributor || selectedWriter || selectedGenre){
        filterMarkers(selectedDirector, selectedProdCompany, selectedDistributor, selectedWriter, selectedGenre);
    };
    if (filterIndexing.size > 0) {
        filterIndexing.forEach((val) => {
          const dropdown = document.getElementById(val);
          document.getElementById(val).style.display = 'block';
          document.getElementById('filterContainer').appendChild(dropdown);
          document.getElementById('filterSelector').querySelector(`option[value="${val}"]`).remove();
        });
    }
    document.getElementById('filterSelector').addEventListener('change', function() {
        const selectedValue = this.value;
        const selectedDropdown = document.getElementById(selectedValue);
        //Show filter and append it to filterContainer div
        document.getElementById(selectedValue).style.display = 'block';
        document.getElementById('filterContainer').appendChild(selectedDropdown);
        // add selected value to 'filterIndexing' set to reload filters when back button is pressed
        filterIndexing.add(selectedValue);
        // remove selected value from the filterSelector
        this.querySelector(`option[value="${selectedValue}"]`).remove();
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
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading JSON: ' + textStatus, errorThrown);
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
            if (feature.properties.Distributor) {
                uniqueDistributors.add(feature.properties.Distributor);
            }
            if (feature.properties.writer1_name) {
                uniqueWriters.add(feature.properties.writer1_name);
            }
            if (feature.properties.writer2_name) {
                uniqueWriters.add(feature.properties.writer2_name);
            }
            if (feature.properties.writer3_name) {
                uniqueWriters.add(feature.properties.writer3_name);
            }
            if (feature.properties.genres) {
                let genres = feature.properties.genres
                genres = genres.split(',')
                genres.forEach(function (item, index){
                uniqueGenres.add(item.trim())
                })
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


