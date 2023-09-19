Waypoints = {
    coordinates: [],
    addWaypoint(waypoint) {
        console.log(this)
        this.coordinates.push(waypoint);
        if(this.coordinates.length > 2) {
            this.coordinates.splice(0, 1);
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
            map.getSource('user-waypoints-path').setData(Waypoints.lineFeature());
        }
    }
}

function drawWaypointRoute() {

}

map.on('click', (e) => {
    addWaypoint([e.lngLat["lng"], e.lngLat["lat"]]);
    document.getElementById('waypoints-display').innerHTML = 
    JSON.stringify(Waypoints.getWaypoints())
});