// Store our API endpoint as a queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";
// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    // Create a popup that includes depth and magnitude.
    let popupContent = `<h3>${feature.properties.place}</h3><hr>`;
    popupContent += `<p>Date: ${new Date(feature.properties.time)}</p>`;
    popupContent += `<p>Magnitude: ${feature.properties.mag}</p>`;
    popupContent += `<p>Depth: ${feature.geometry.coordinates[2]}</p>`;
    
    // Bind the popup content to the layer.
    layer.bindPopup(popupContent);
  }

  // Create the earthquake icon, get coordinates.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng, {
        radius: calculateRadius(feature.properties.mag),
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
      });
    },
  });
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the topographical and earthquake layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [topo, earthquakes]
  });

  // Create a layer control and add to the map.
  // Pass it our baseMaps and overlayMaps.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

var map = L.map("mapid").setView([55.67, 12.57], 7);
L.tileLayer(
  "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
).addTo(map);

// Create a legend
var legend = L.control({ position: "bottomleft" });

legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  return div;
};

legend.addTo(map);


// Create bubble size and match to earthquake magnitude
function calculateRadius(magnitude) {
  return magnitude * 10000;
}

// Color bubbles matched from earthquake depth
function getColor(depth) {
  if (depth < 10) return "#00ff00"; // Green for shallow earthquakes
  else if (depth < 30) return "#ffff00"; // Yellow for moderate depth
  else return "#ff0000"; // Red for deep earthquakes
}
