Waypoints = {
    coordinates: [],
    addWaypoint(waypoint) {
        this.coordinates.push(waypoint);
        if(this.coordinates.length > 2) {
            this.coordinates.splice(0, 2);
        }
    },
    getWaypoints() {
        return this.coordinates;
    },
    pointFeature() {
        return {
            "type": "Feature",
            "geometry": {
                "type": "MultiPoint",
                "coordinates": this.coordinates
            }
        }
    },
    lineFeature() {
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": this.coordinates
            }
        }
    },
};

function addWaypoint(waypoint) {
    Waypoints.addWaypoint(waypoint);

    // Update/create waypoints
    if(Waypoints.getWaypoints().length > 0) {
        // Waypoint style
        if(map.getSource('user-waypoints') == undefined) {
            map.addSource('user-waypoints', { 
                "type": "geojson", "data": Waypoints.pointFeature() });
            map.addLayer({
                'id': 'user-waypoints',
                'type': 'circle',
                'source': 'user-waypoints',
                'paint': {
                    'circle-color': '#294680',
                    'circle-radius': 5
                }
            });
        } else {
            map.getSource('user-waypoints').setData(Waypoints.pointFeature());
        }
    }

    if(Waypoints.getWaypoints().length == 2) {
        if(map.getSource('user-waypoints-path') == undefined) {
            map.addSource('user-waypoints-path', {
                type: 'geojson', data: Waypoints.lineFeature() });
            map.addLayer({
                'id': 'user-waypoints-path',
                'type': 'line',
                'source': 'user-waypoints-path',
                'paint': {
                    'line-color': 'grey',
                    'line-opacity': 0.75,
                    'line-width': 5
                }
            });
        } else {
            map.setLayoutProperty('user-waypoints-path', 'visibility', 'visible');
            map.getSource('user-waypoints-path').setData(Waypoints.lineFeature());
        }
    } else {
        map.setLayoutProperty('user-waypoints-path', 'visibility', 'none');
    }
}

function drawWaypointRoute() {
    if(Waypoints.getWaypoints().length != 2) {
        return;
    }

    console.log(map);
}

map.on('click', (e) => {
    addWaypoint([e.lngLat["lng"], e.lngLat["lat"]]);
    document.getElementById('waypoints-display').innerHTML = 
    "Waypoints:<br>" +
    JSON.stringify(Waypoints.getWaypoints())
});