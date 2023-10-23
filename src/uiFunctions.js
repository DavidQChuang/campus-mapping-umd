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
        waypointElement.querySelector('input').value = waypoint[0].toFixed(5) + ", " + waypoint[1].toFixed(5);

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

    startLoading(text) {
        var loadingPanel = document.getElementById("loading-panel");
        var loadingText = document.getElementById("loading-text");

        loadingPanel.removeAttribute("hidden");
        loadingText.innerHTML = text;
    },

    stopLoading() {
        var loadingPanel = document.getElementById("loading-panel");
        setTimeout(() => {
            loadingPanel.setAttribute("hidden", '');
        }, 400);
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
    UI.startLoading("Finding user location.");
    getUserLocation((pos) => {
        var point = [pos.coords.longitude, pos.coords.latitude];

        UI.setWaypoint(idx, point);
        Waypoints.renderWaypoints(UI.userEndpoints, UI.pathEndpoints);
        UI.stopLoading();
    });
}

function queryConstructionAt(waypoint) {
    getUserLocation((pos) => {
        // find surrounding footpaths within 0.03km
        GeoData.getSurroundingFootpaths(pos, 0.03);

    });
}

const SetWaypointOnClick = {

    setWaypointAndUpdateCallback(self, idx) {
        return ((self, idx) => (e) => {
            UI.setWaypoint(idx, [e.lngLat["lng"], e.lngLat["lat"]]);
            Waypoints.unrenderUserEndpoints();
            Waypoints.renderPathEndpoints(UI.pathEndpoints);
            SetWaypointOnClick.off(self, idx);
        })(self, idx);
    },

    onMouseMoves: {},
    onMouseMove(self, idx) {
        if(!(idx in this.onMouseMoves)) {
            this.onMouseMoves[idx] = ((self) => (e) => {
                var userEndpoints = UI.userEndpoints;
                userEndpoints[idx] = [e.lngLat["lng"], e.lngLat["lat"]]
                Waypoints.renderUserEndpoints(userEndpoints);
            })(self);
        }
        return this.onMouseMoves[idx];
    },
    onTouchEnds: {},
    onTouchEnd(self, idx) {
        if(!(idx in this.onTouchEnds)) {
            this.onTouchEnds[idx] = this.setWaypointAndUpdateCallback(self, idx);
        }
        return this.onTouchEnds[idx];
    },
    onClicks: {},
    onClick(self, idx) {
        if(!(idx in this.onClicks)) {
            this.onClicks[idx] = this.setWaypointAndUpdateCallback(self, idx);
        }
        return this.onClicks[idx];
    },
    
    activeEvents: {},
    on(self, idx) {
        var existsAlready = false;
        for(var event of Object.values(this.activeEvents)) {
            this.off(event.self, event.idx);
            if(event.idx == idx)
                existsAlready = true;
        }
        this.activeEvents = {};

        if(!existsAlready) {
            this.activeEvents[idx] = {self, idx};

            self.setAttribute('selected', '');
            map
                .on('touchend', this.onTouchEnd(self, idx))
                .on('mousemove', this.onMouseMove(self, idx))
                .on('click', this.onClick(self, idx));
        }
    },
    off(self, idx) {
        delete this.activeEvents[idx];
        self.removeAttribute('selected');
        map
           .off('touchend', this.onTouchEnd(self, idx))
           .off('mousemove', this.onMouseMove(self, idx))
           .off('click', this.onClick(self, idx));
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
    UI.startLoading("Finding route.")

    var start = GeoData.nodes[endpoints[0].node];
    var goal = GeoData.nodes[endpoints[1].node];

    const {
        path, pathLength, pathTime,
        runTime, tickSize, iters
    } = await algorithm(start, goal);
    
    if(path != undefined) {
        UI.writePathInfo({ pathLength, pathTime })
        UI.stopLoading();
    } else {
        UI.writePathInfo({ pathLength: 0, pathTime: 0 });
        UI.startLoading("Failed to find route, please choose another nearby route.")
        setTimeout(() => {
            UI.stopLoading();
        }, 5000);
    }
}