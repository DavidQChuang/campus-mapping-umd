// Contains functions for use in buttons and menus.


const UI = {
    userEndpoints: [],
    pathEndpoints: [],
    waypointElements: [],

    setWaypoint(idx, waypoint) {
        console.log(idx, this.waypointElements.length)
        if(idx >= this.waypointElements.length) {
            this.ensureWaypointCount(idx+1);
        }

        var waypointElement = this.waypointElements[idx];
        waypointElement.querySelector('input').value = waypoint.toString();

        this.userEndpoints[idx] = waypoint;
        this.pathEndpoints[idx] = GeoData.nearestFootpath(waypoint); // may be undefined
    },

    ensureWaypointCount(count) {
        count = Math.max(2, count);
        
        var waypointList = document.getElementById('map-waypoint-list');
        var waypointElements = waypointList.querySelectorAll('.map-waypoint');
        console.log(waypointElements);
        var oldUserEndpoints = this.userEndpoints;
        var oldPathEndpoints = this.pathEndpoints;

        this.waypointElements = [];
        this.userEndpoints = [];
        for(var i = 0; i < waypointElements.length; i++) {
            if(i >= count) {
                waypointElements[i].remove();
            } else {
                this.waypointElements.push(waypointElements[i]);

                if(i < oldUserEndpoints.length) {
                    this.userEndpoints.push(oldUserEndpoints[i]);
                    this.pathEndpoints.push(oldPathEndpoints[i]
                        ?? GeoData.nearestFootpath(oldUserEndpoints));
                }else {
                    this.userEndpoints.push(undefined);
                    this.pathEndpoints.push(undefined);
                }
            }
        }
    },

    writePathInfo({ pathLength, pathTime }) {
        var pathDistanceLabel = document.getElementById("path-distance");
        var pathTimeLabel = document.getElementById("path-time");

        pathDistanceLabel.innerHTML = (0.621371 * pathLength).toFixed(2) + "mi";
        pathTimeLabel.innerHTML = (Math.ceil(pathTime * 60)) + "min";
    }
};

var x = document.getElementById("geolocation");

function getUserLocation(callback) {
  if (navigator.geolocation) {
    x.innerHTML = "Locating...";
    navigator.geolocation.getCurrentPosition(callback, showError);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

// TODO: notify apple users to enable location services
function markerAtUserLocation() {
    getUserLocation((pos) => {
        x.innerHTML = "Latitude: " + pos.coords.latitude + 
        "<br>Longitude: " + pos.coords.longitude;
        const marker = new mapboxgl.Marker()
          .setLngLat([pos.coords.longitude, pos.coords.latitude])
          .addTo(map);
    })
}

function setWaypointAtUserLocation(idx) {
    getUserLocation((pos) => {
        UI.setWaypoint(idx, [pos.coords.longitude, pos.coords.latitude]);
    });
}

const SetWaypointOnClick = {
    onTouchStart() {
        $(this).data('moved', '0');
    },
    onTouchMove() {
        $(this).data('moved', '1');
    },
    onTouchEnds: {},
    onTouchEnd(idx) {
        if(!(idx in this.onTouchEnds)) {
            this.onTouchEnds[idx] = (e) => {
                if($(this).data('moved') == 0){
                    UI.setWaypoint(idx, [e.lngLat["lng"], e.lngLat["lat"]]);
                    Waypoints.renderWaypoints(UI.userEndpoints, UI.pathEndpoints);
                    SetWaypointOnClick.off(idx);
                }
            };
        }
        return this.onTouchEnds[idx];
    },
    onClicks: {},
    onClick(idx) {
        if(!(idx in this.onClicks)) {
            this.onClicks[idx] = (e) => {
                UI.setWaypoint(idx, [e.lngLat["lng"], e.lngLat["lat"]]);
                Waypoints.renderWaypoints(UI.userEndpoints, UI.pathEndpoints);
                SetWaypointOnClick.off(idx);
            };
        }
        return this.onClicks[idx];
    },
    
    on(idx) {
        map.on('touchstart', this.onTouchStart)
           .on('touchmove', this.onTouchMove)
           .on('touchend', this.onTouchEnd(idx))
           .on('click', this.onClick(idx));
    },
    off(idx) {
        map.off('touchstart', this.onTouchStart)
           .off('touchmove', this.onTouchMove)
           .off('touchend', this.onTouchEnd(idx))
           .off('click', this.onClick(idx));
    }
};

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

async function drawWaypointRoute(algorithm) {
    var endpoints = Waypoints.getValidEndpoints(UI.pathEndpoints);

    if (endpoints.length < 2) {
        return;
    }

    // console.log("Pathing from " + JSON.stringify(endpoints[0]) + " to " + JSON.stringify(endpoints[1]));

    var start = GeoData.nodes[endpoints[0].node];
    var goal = GeoData.nodes[endpoints[1].node];

    const {
        path, pathLength, pathTime,
        runTime, tickSize, iters
    } = await algorithm(start, goal);
    
    if(path != undefined) {
        UI.writePathInfo({ pathLength, pathTime })
    } else {
        UI.writePathInfo({ pathLength: 0, pathTime: 0 });
    }
}