
function chooseColor(magnitude){
      var fillColor = ""
      if ( magnitude > 8 ) fillColor = "#7f2704";
      else if ( magnitude > 6 ) fillColor = "#a63603";
      else if ( magnitude > 4 ) fillColor = "#fd8d3c";
      else if ( magnitude > 2 ) fillColor = "#fdae6b";
      // else if ( magnitude > 0 ) fillColor = "#ffffd4";
      else fillColor = "#fdd0a2";
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
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + (feature.properties.mag) + "</p>");
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
    return d > 8 ? '#7f2704' :
           d > 6  ? '#a63603' :
           d > 4  ? '#fd8d3c' :
           d > 2  ? '#fdae6b' :
           d > 0   ? '#fdd0a2' :
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

  earthquakes.bringToFront();
  plates.bringToBack();


  createMap(plates, earthquakes, legend);
}

function createMap(plates, earthquakes, legend){

    // Define streetmap and darkmap layers
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });

    var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Satellite": satellite,
      "Grey scale": grayscale,
      "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      "Tectonic Plates" : plates
    };

    earthquakes.bringToFront();
    plates.bringToBack();
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [satellite, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false,
      autoZIndex: true
    }).addTo(myMap);

    legend.addTo(myMap);

}
