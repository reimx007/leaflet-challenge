// Creating map object
var myMap = L.map("map", {
  center: [40.7, -73.95],
  zoom: 11
});

// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

// Store API query variables
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Grab the data with d3
d3.json(url, function(response) {
 var earthquakeData = response.features
 console.log(earthquakeData.length);
  // Create a new marker cluster group
  var markers = [];

  // Loop through data
  for (var i = 0; i < earthquakeData.length; i++) {

    // Set the data location property to a variable
    var location = earthquakeData[i].geometry.coordinates;

    // Check for location property
    if (location) {
      console.log(location);
      console.log(location[1]);

      // Add circles to map
      markers.addLayer(L.circle([location[1],location[0]], {
        fillOpacity: 0.75,
        color: "red",
        fillColor: "black",
        // Adjust radius
        radius: 10000
      }).bindPopup("<h3>" + earthquakeData.properties.place +
          "</h3><hr><p>" + new Date(earthquakeData.properties.time) + "</p>").addTo(myMap));

      // // Add a new marker to the cluster group and bind a pop-up
      // markers.addLayer(L.marker([location[1], location[0]])
      //   .bindPopup("<h3>" + earthquakeData.properties.place +
      //       "</h3><hr><p>" + new Date(earthquakeData.properties.time) + "</p>"));
    }

  }

  // Add our marker cluster layer to the map
  myMap.addLayer(markers);

});
