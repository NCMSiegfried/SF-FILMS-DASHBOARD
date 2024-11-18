

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
var markersLayer;
var geojsonData;
var additionalData;

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
    sidePanel.classList.remove('visible'); // Hide the panel before content change
    setTimeout(() => {
        sidePanel.innerHTML = `
            <h2>Welcome to the SF Films Map</h2>
            <p>Click on any marker to view film details.</p>
        `;
        sidePanel.classList.add('visible'); // Show the panel after content change
    }, 300); // Match this duration to the CSS transition time
}
<<<<<<< HEAD
// LOAD NAMES DATA JSON
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/NCMSiegfried.github.io/refs/heads/main/projects/San_Francisco_Films_Map/data/Names.json", function(data) {
    namesData = data;
    console.log("Additional data loaded:", namesData);
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading JSON: ' + textStatus, errorThrown);
});
=======
>>>>>>> b93a8a9f82053f6c0262c68c9293db4f215bcc39

function updateSidePanel(properties, coords) {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.classList.remove('visible');
    setTimeout(() => {
        sidePanel.innerHTML = `
            <button id="back-button">
                Back
            </button>
            <p><a href="https://www.imdb.com/title/${properties.tconst}/" target="_blank" rel="noopener noreferrer">
                <img src="images/${properties.tconst}/Image_1.jpg"/>
            </a></p>
            <h2>${properties.Title}</h2>
            <p><strong>Film: </strong> ${properties.Title}</p>
            <p><strong>Year Released: </strong> ${properties['Release Year']}</p>
            <p>${properties.genres}</p>
            <button id="MoreInfoButton">
                More Information
            </button>
        `;
        sidePanel.classList.add('visible'); // Show the panel after content change

        // Add event listener to the "More Information" button
        document.getElementById('MoreInfoButton').addEventListener('click', function() {
            this.style.display = 'none'; // Hide the button
            showMoreDetails(properties, coords);
        });

        // Add event listener to the "Back" button
        document.getElementById('back-button').addEventListener('click', function() {
            // Go back to the default side panel content
            sidePanelHome();
        });
    }, 300); // Match this duration to the CSS transition time
}

function showMoreDetails(properties, coords) {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.classList.remove('visible'); // Hide the panel before content change
    setTimeout(() => {
        sidePanel.innerHTML += `
            <div style="margin-top: 20px;">
                <button id="back-button">
                    Back
                </button>
                <p><strong>Director:</strong> ${properties['Production Company']}</p>
                <p><strong>Cast:</strong> ${properties.Distributor}</p>
                <p><strong>Synopsis:</strong> ${properties.Director}</p>
            </div>
        `;
        sidePanel.classList.add('visible'); // Show the panel after content change

        // Add event listener to the "Back" button
        document.getElementById('back-button').addEventListener('click', function() {
            // Go back to the previous state of the side panel
            sidePanelHome(properties, coords);
        });
    }, 300); // Match this duration to the CSS transition time
}
// Load GeoJSON from github, pass data through functions
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/main/map/data/data.geojson", function(data) {
    // Load GeoJSON data into the map
    var geojsonLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, defaultMarkerOptions);
        },
        onEachFeature: function (feature, layer) {
            // Attach click event listener to each feature (point)
            layer.on('click', function () {
                resetHighlight(); // Reset highlight of previously selected marker
                highlightedLayer = layer; // Set the currently clicked layer as highlighted
                layer.setStyle(highlightMarkerOptions);
                var coords = feature.geometry.coordinates;
                var properties = feature.properties;
                // Update the side panel when the point is clicked
                updateSidePanel(properties, coords);
            });
        }
    }).addTo(map);
    sidePanelHome();
}).fail(function() {
    console.error('Error loading GeoJSON file');
});

// Load the additional JSON file
//$.getJSON("https://example.com/path/to/your/additionalData.json", function(data) {
//    additionalData = data; // Store the loaded data in the variable
//    console.log("Additional data loaded:", additionalData);
//}).fail(function() {
//    console.error('Error loading additional JSON file');
//});

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

