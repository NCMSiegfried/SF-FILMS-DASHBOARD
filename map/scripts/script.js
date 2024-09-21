

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
var namesData;

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
    `;
}

function updateSidePanel(properties, coords) {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `
        <button id="back-button">
            Back
        </button>
        <p><a href="https://www.imdb.com/title/${properties.tconst}/" target= "_blank" rel="noopener noreferrer">
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

    // Add event listener to the "More Information" button
    document.getElementById('MoreInfoButton').addEventListener('click', function() {
        // Hide the "More Information" button
        this.style.display = 'none';
        // Show additional details in the side panel
        showMoreDetails(properties, coords);
    });

    // Add event listener to the "Back" button
    document.getElementById('back-button').addEventListener('click', function() {
        // Go back to the default side panel content
        sidePanelHome();
    });
}

function showMoreDetails(properties, coords) {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML += `
        <div style="margin-top: 20px;">
            <p><strong>Director:</strong> ${properties['Production Company']}</p>
            <p><strong>Cast:</strong> ${properties.Distributor}</p>
            <p><strong>Synopsis:</strong> ${properties.Director}</p>
        </div>
    `;

    // Add event listener to the "Back" button
    document.getElementById('back-button').addEventListener('click', function() {
        // Go back to the previous state of the side panel
        sidePanelHome();
    });
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
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/refs/heads/main/map/data/Names.json", function(data) {
    namesData = data;
    console.log("Additional data loaded:", namesData);
}).fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.error('Error loading additional JSON file: ' + err);
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

