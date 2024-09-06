

// Initialize the map
var map = L.map('map',{
//    zoomControl: false
//    scrollWheelZoom: false,
//    smoothWheelZoom: true,
//    smoothSensitivity: 1,
//     1 / 10th of the original zoom step
    zoomSnap: 0,
////     Faster debounce time while zooming
    wheelDebounceTime: 100,
    zoomDelta:0.5,
    wheelPxPerZoomLevel:80
    }).setView([37.773972, -122.431297], 12);
map.scrollWheelZoom = true;

L.control.zoom({
     position:'topright'
}).addTo(map);


var bayAreaBounds = [
    [36.8, -123.3], // Southwest corner (latitude, longitude)
    [38.6, -121.5]  // Northeast corner (latitude, longitude)
];

// Set the max bounds
map.setMaxBounds(bayAreaBounds);

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=8ff5f85d-e7f5-44fa-90bd-df95edd37619', {
  minZoom: 10,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
}).addTo(map);


var geojsonMarkerOptions = {
    radius: 3,
    fillColor: "#DE3163",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var defaultMarkerOptions = {
    radius: 3,
    fillColor: "#DE3163",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var highlightMarkerOptions = {
    radius: 8,
    fillColor: "#FF6347", // Different color for highlight
    color: "#000",
    weight: 2,
    opacity: 1,
    fillOpacity: 1
};
var highlightedLayer = null;

// Function to reset the highlight of all markers
function resetHighlight() {
    if (highlightedLayer) {
        highlightedLayer.setStyle(defaultMarkerOptions);
        highlightedLayer = null;
    }
}

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Function to update side panel with point details
function updateSidePanel(properties, coords) {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.innerHTML = `
        <img src="images/${properties.Title} ${properties['Release Year']} poster/Image_1.jpg" style="width:200px;height:300px;"><br>
        <h2>${properties.Title}</h2>
        <p><strong>Film: </strong> ${properties.Title}</p>
        <p><strong>Year Released: </strong> ${properties['Release Year']}</p>
        <p><strong>"images/${properties.Title} ${properties['Release Year']} poster/Image_1.jpg"</strong></p>
    `;
}

//$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/main/map/data/data.geojson", function(data) {
//    // Add the GeoJSON layer to the map
//    L.geoJson(data, {
//        pointToLayer: function (feature, latlng) {
//            return L.circleMarker(latlng, geojsonMarkerOptions);
//        },
//        onEachFeature: function(feature, layer) {
//            layer.bindPopup(
//                '<img src="images/' + feature.properties.Title + ' ' + feature.properties['Release Year'] + ' poster/Image_1.jpg" style="width:200px;height:300px;"><br>'+
//                "<b>Film: </b>" + feature.properties.Title+
//                "<b>Year Released: </b>" + feature.properties['Release Year']
//            );
//        }
//    }).addTo(map);


// Load GeoJSON using jQuery's $.getJSON
$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/main/map/data/data.geojson", function(data) {
    // Load GeoJSON data into the map
    var geojsonLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
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
}).fail(function() {
    console.error('Error loading GeoJSON file');
});
