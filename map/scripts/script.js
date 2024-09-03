// Initialize the map
var map = L.map('map').setView([37.773972, -122.431297], 12);
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=8ff5f85d-e7f5-44fa-90bd-df95edd37619', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
}).addTo(map);

//var geojsonFeature = [{ "type": "Feature", "properties":
//{ "unique_id": "1", "Title": "Experiment in Terror", "Release Year": "1962", "Locations": "The Sea Captain's Chest (Fisherman's Wharf)", "Fun Facts": "", "Production Company": "Columbia Pictures Corporation", "Distributor": "Columbia Pictures", "Director": "Blake Edwards", "Writer": "The Gordons", "Actor 1": "Glenn Ford", "Actor 2": "Lee Remick", "Actor 3": "Stefanie Powers", "SF Find Neighborhoods": "99.0", "Analysis Neighborhoods": "23.0", "Current Supervisor Districts": "3.0", "query_location": "Fisherman's Wharf", "city": "San Francisco", "state": "California", "coordinates_final2": "37.808222, -122.415807", "lat_final2": "37.808222", "lon_final2": "-122.415807" }, "geometry": { "type": "Point", "coordinates": [ -122.415807, 37.808222 ] } },
//{ "type": "Feature", "properties": { "unique_id": "2", "Title": "Experiment in Terror", "Release Year": "1962", "Locations": "100 St. Germain Avenue", "Fun Facts": "", "Production Company": "Columbia Pictures Corporation", "Distributor": "Columbia Pictures", "Director": "Blake Edwards", "Writer": "The Gordons", "Actor 1": "Glenn Ford", "Actor 2": "Lee Remick", "Actor 3": "Stefanie Powers", "SF Find Neighborhoods": "47.0", "Analysis Neighborhoods": "38.0", "Current Supervisor Districts": "8.0", "query_location": "100 St. Germain Avenue", "city": "San Francisco", "state": "California", "coordinates_final2": "37.757651, -122.450525", "lat_final2": "37.757651", "lon_final2": "-122.450525" }, "geometry": { "type": "Point", "coordinates": [ -122.450525, 37.757651 ] } }
//]
//;
//L.geoJSON(geojsonFeature).addTo(map);

//var geojsonMarkerOptions = {
//    radius: 8,
//    fillColor: "#ff7800",
//    color: "#000",
//    weight: 1,
//    opacity: 1,
//    fillOpacity: 0.8
//};
//
//L.geoJSON('data/data.geojson', {
//    pointToLayer: function (feature, latlng) {
//        return L.circleMarker(latlng, geojsonMarkerOptions);
//    }
//}).addTo(map);

$.getJSON("data/data.geojson", function(data) {
            // Add the GeoJSON layer to the map
            L.geoJson(data).addTo(map);
        });
