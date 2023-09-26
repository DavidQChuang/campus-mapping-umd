Waypoints = {
    userEndpoints: [],
    pathEndpoints: [],
    pathRoute: [],
    addWaypoint(waypoint) {
        this.userEndpoints.push(waypoint);

        var nearestFootpath = GeoData.nearestFootpath(waypoint);
        console.log("nearest footpath: " + nearestFootpath);
        if(nearestFootpath != undefined) {
            this.pathEndpoints.push(nearestFootpath);
        }

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
                this.pathEndpoints.map((x, idx) => {return {
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
    if(map.getSource('user-waypoints') == undefined) {
        if(Waypoints.getUserEndpoints().length > 0) {
            // Waypoint style
            map.addSource('user-waypoints', { 
                "type": "geojson", "data": Waypoints.userPointFeature() });
            map.addLayer(Layers['user-waypoints-text']);
            map.addLayer(Layers['user-waypoints'], "user-waypoints-text");
        }
    } else {
        map.getSource('user-waypoints').setData(Waypoints.userPointFeature());
    }

    if(map.getSource('user-waypoints-path') == undefined) {
        if(Waypoints.getUserEndpoints().length == 2) {
            map.addSource('user-waypoints-path', {
                type: 'geojson', data: Waypoints.userLineFeature() });
            map.addLayer(Layers['user-waypoints-path'], "user-waypoints");
        }
    } else {
        if(Waypoints.getUserEndpoints().length == 2) {
            map.setLayoutProperty('user-waypoints-path', 'visibility', 'visible');
            map.getSource('user-waypoints-path').setData(Waypoints.userLineFeature());
        } else {
            map.setLayoutProperty('user-waypoints-path', 'visibility', 'none'); 
        }
    }

    if(map.getSource('path-endpoints') == undefined) {
        if(Waypoints.getPathEndpoints().length > 0) {
            // Waypoint style
            console.log(Waypoints.pathPointFeature());
            map.addSource('path-endpoints', { 
                "type": "geojson", "data": Waypoints.pathPointFeature() });
            map.addLayer(Layers['path-endpoints-text']);
            map.addLayer(Layers['path-endpoints'], "path-endpoints-text");
        }
    } else {
        map.getSource('path-endpoints').setData(Waypoints.pathPointFeature());
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
    JSON.stringify(Waypoints.getUserEndpoints())+
    "<br><br>Path Endpoints:<br>" +
    JSON.stringify(Waypoints.getPathEndpoints())
});