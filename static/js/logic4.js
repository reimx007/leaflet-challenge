
function chooseColor(magnitude){
      var fillColor = ""
      if ( magnitude > 8 ) fillColor = "#993404";
      else if ( magnitude > 6 ) fillColor = "#d95f0e";
      else if ( magnitude > 4 ) fillColor = "#fe9929e";
      else if ( magnitude > 2 ) fillColor = "#fed98e";
      // else if ( magnitude > 0 ) fillColor = "#ffffd4";
      else fillColor = "#ffffd4";  // no data
      return fillColor;
    }

function chooseRadius(magnitude){
      var radius = 0
      if ( magnitude > 8 ) radius = 12;
      else if ( magnitude > 6 ) radius = 10;
      else if ( magnitude > 4 ) radius = 8;
      else if ( magnitude > 2 ) radius = 6;
      // else if ( magnitude > 0 ) fillColor = "#ffffd4";
      else radius = 4;  // no data
      return radius;
    }
// Store API query variables
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";



d3.json("static/data/PB2002_plates.json", function(response1) {
  d3.json(url, function(response2) {
    var earthquakeData = response2.features;
    console.log(earthquakeData);
    var platesData = response1.features;
    console.log(platesData);
    createFeatures(earthquakeData, platesData)
    });
  });


function createFeatures(earthquakeData, platesData) {
  function oneachfeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }
  var mapStyle = {
    color: "orange",
    fillColor: "",
    fillOpacity: 0,
    weight: 2
  };
  var plates = L.geoJson(platesData, {
    // Passing in our style object
    style: mapStyle,
    onEachFeature: function( feature, layer ){
      layer.bindPopup( "<h3>Plate name: " + feature.properties.PlateName + "</h3>")
    }
  });

  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: oneachfeature,
    pointToLayer: function(feature,latlng){
	  return new L.CircleMarker(latlng, {
      radius: chooseRadius(feature.properties.mag),
      fillOpacity: 1,
      fillColor: chooseColor(feature.properties.mag),
      weight: .5,
      color: "#999"}); // feature.properties.mag
    }
  })//.addTo(myMap);

  function getColor(d) {
    return d > 8 ? '#993404' :
           d > 6  ? '#d95f0e' :
           d > 4  ? '#fed98e' :
           d > 2  ? '#FFEDA0' :
           d > 0   ? '#ffffd4' :
                      '#FFEDA0';
    }
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            mags = [0, 2, 4, 6, 8],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < mags.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
                mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
        }

        return div;
    };

  createMap(plates, earthquakes, legend);
}

function createMap(plates, earthquakes, legend){

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap
    };

    plates.setZIndex(5);
    earthquakes.setZIndex(4);

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      "Tectonic Plates" : plates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [darkmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    legend.addTo(myMap);

}
