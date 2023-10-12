// Contains functions for use in buttons and menus.


const UI = {
    writePathInfo({ pathLength, time }) {
        var pathDistance = document.getElementById("path-distance");
        var pathTime = document.getElementById("path-time");

        pathDistance.innerHTML = (0.621371 * pathLength).toFixed(2) + "mi";
        pathTime.innerHTML = (Math.ceil(time * 60)) + "min";
    }
};

var x = document.getElementById("geolocation");

function getLocation() {
  if (navigator.geolocation) {
    x.innerHTML = "Locating...";
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

// TODO: notify apple users to enable location services
function showPosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude + 
  "<br>Longitude: " + position.coords.longitude;
  const marker = new mapboxgl.Marker()
    .setLngLat([position.coords.longitude, position.coords.latitude])
    .addTo(map);
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}

function drawWaypointRoute(algorithm) {
    if (Waypoints.getUserEndpoints().length != 2) {
        return;
    }

    var endpoints = Waypoints.getPathEndpoints();
    // console.log("Pathing from " + JSON.stringify(endpoints[0]) + " to " + JSON.stringify(endpoints[1]));

    var start = GeoData.nodes[endpoints[0].node];
    var goal = GeoData.nodes[endpoints[1].node];

    var route = algorithm(start, goal);

    if (route != false) {
        console.log("Routed: ", route);
    } else {
        console.log("Failed routing.")
    }
}