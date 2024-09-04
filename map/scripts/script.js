

// Initialize the map
var map = L.map('map',{
    scrollWheelZoom: false,
    smoothWheelZoom: true,
    smoothSensitivity: 1,
    // 1 / 10th of the original zoom step
    //zoomSnap: 0,
    // Faster debounce time while zooming
    //wheelDebounceTime: 100,
    //zoomDelta:0.5,
    //wheelPxPerZoomLevel:80
    }).setView([37.773972, -122.431297], 12);
map.scrollWheelZoom = true;

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

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

$.getJSON("https://raw.githubusercontent.com/NCMSiegfried/SF-FILMS-DASHBOARD/main/map/data/data.geojson", function(data) {
            // Add the GeoJSON layer to the map
            L.geoJson(data, {
                        pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
        onEachFeature: function(feature, layer){
            layer.bindPopup("<b>Film: </b>" + feature.properties.Title);
        }
        }).addTo(map);
                });

