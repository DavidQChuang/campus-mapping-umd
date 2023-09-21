Waypoints = {
    userEndpoints: [],
    pathEndpoints: [],
    pathRoute: [],
    addWaypoint(waypoint) {
        this.userEndpoints.push(waypoint);
        this.pathEndpoints.push();

        if(this.userEndpoints.length > 2) {
            this.userEndpoints.splice(0, 2);
            this.pathEndpoints.splice(0, 2);
        }
    },
    getUserEndpoints() {
        return this.userEndpoints;
    },
    getPathEndpoints() {
        return this.pathEndpoints;
    },
    getPathRoute() {
        return this.pathRoute;
    },
    userPointFeature() {
        return {
            "type": "FeatureCollection",
            "features": 
                this.userEndpoints.map((x, idx) => {return {
                    "type": "Feature",
                    "properties": {
                        "text": String.fromCharCode("A".charCodeAt() + idx)
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": x
                    }
                }})
        }
    },
    userLineFeature() {
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": this.userEndpoints
            }
        }
    },
    pathPointFeature() {
        return {
            "type": "FeatureCollection",
            "features": 
                this.pathCoordinates.map((x, idx) => {return {
                    "type": "Feature",
                    "properties": {
                        "text": String.fromCharCode("A".charCodeAt() + idx)
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": x
                    }
                }})
        }
    },
    pathLineFeature() {
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": this.pathRoute
            }
        }
    },
};

function addWaypoint(waypoint) {
    Waypoints.addWaypoint(waypoint);

    // Update/create waypoints
    if(Waypoints.getUserEndpoints().length > 0) {
        // Waypoint style
        if(map.getSource('user-waypoints') == undefined) {
            map.addSource('user-waypoints', { 
                "type": "geojson", "data": Waypoints.userPointFeature() });
            map.addLayer({
                'id': 'user-waypoints-text',
                'type': 'symbol',
                'source': 'user-waypoints',
                "layout": {
                    'text-field': ['get', 'text'],
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                },
                'paint': {
                    'text-color': '#fff'
                }
            });
            map.addLayer({
                'id': 'user-waypoints',
                'type': 'circle',
                'source': 'user-waypoints',
                'paint': {
                    'circle-color': '#294680',
                    'circle-radius': 8
                }
            }, "user-waypoints-text");
        } else {
            map.getSource('user-waypoints').setData(Waypoints.userPointFeature());
        }
    }

    if(Waypoints.getUserEndpoints().length == 2) {
        if(map.getSource('user-waypoints-path') == undefined) {
            map.addSource('user-waypoints-path', {
                type: 'geojson', data: Waypoints.userLineFeature() });
            map.addLayer({
                'id': 'user-waypoints-path',
                'type': 'line',
                'source': 'user-waypoints-path',
                'paint': {
                    'line-color': '#aae',
                    'line-opacity': 0.75,
                    'line-width': 3,
                    'line-dasharray': [3, 1]
                }
            }, "user-waypoints");
        } else {
            map.setLayoutProperty('user-waypoints-path', 'visibility', 'visible');
            map.getSource('user-waypoints-path').setData(Waypoints.userLineFeature());
        }
    } else {
        map.setLayoutProperty('user-waypoints-path', 'visibility', 'none');
    }
}

function drawWaypointRoute() {
    if(Waypoints.getUserEndpoints().length != 2) {
        return;
    }

    var targetA = turf.point(Waypoints.getUserEndpoints()[0]);
    console.log(map);
}

map.on('click', (e) => {
    addWaypoint([e.lngLat["lng"], e.lngLat["lat"]]);
    document.getElementById('waypoints-display').innerHTML = 
    "Waypoints:<br>" +
    JSON.stringify(Waypoints.getUserEndpoints()())
});