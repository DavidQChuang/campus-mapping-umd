Waypoints = {
    userEndpoints: [],
    pathEndpoints: [],
    pathRoute: [],
    addWaypoint(waypoint) {
        this.userEndpoints.push(waypoint);

        var nearestFootpath = GeoData.nearestFootpath(waypoint);
        console.log("nearest footpath: " + [nearestFootpath.x, nearestFootpath.y]);
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
                this.pathEndpoints.map((node, idx) => {return {
                    "type": "Feature",
                    "properties": {
                        "text": String.fromCharCode("A".charCodeAt() + idx)
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [node.x, node.y]
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

function getDistance(n1, n2) {
    var dx = n1.lon - n2.lon;
    var dy = n1.lat - n2.lat;
    return dx*dx + dy*dy;
}

function drawWaypointRoute() {
    if(Waypoints.getUserEndpoints().length != 2) {
        return;
    }

    var endpoints = Waypoints.getPathEndpoints();
    console.log("Pathing from " + JSON.stringify(endpoints[0]) + " to " + JSON.stringify(endpoints[1]));

    var start = GeoData.nodes[endpoints[0].node];
    var goal = GeoData.nodes[endpoints[1].node];

    var route = pathfindAstar(start, goal,
        node => getDistance(goal, node));

    if(route != false) {
        console.log("Routed: ", route);
    } else {
        console.log("Failed routing.")
    }
}

async function pathfindAstar(start, goal, h) {
    var cameFrom = {}
    
    // For node n,  gScore[n]: cost of cheapest path from start to n
    // Default value is infinity
    var gScore = {}
    gScore[start.id] = 0

    // For node n,  fScore[n]: gScore[n] + h(n).
    // fScore represents the best guess to how cheap a path could be from start 
    // to finish if it goes through n.
    var fScore = {}
    fScore[start.id] = h(start)

    const getFScore = ((fScoreArr) => {
                        return x => fScoreArr[x.id];
                    })(fScore);
    var openSet = new MinHeap(getFScore);
    openSet.push(start);

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const getPath = function(node) {
        var pathNodeId = node.id;
        var pathNodeIds = [];
        while(pathNodeId != start.id) {
            // console.log("Coming from " + pathNodeId +" to " + cameFrom[pathNodeId]);

            pathNodeIds.push(pathNodeId);
            pathNodeId = cameFrom[pathNodeId];

            if(pathNodeId === undefined) {
                console.log("Error")
                throw new RangeError("Node path does not exist");
            }
        }
        pathNodeIds.push(start.id);
        return pathNodeIds;
    }

    while(openSet.length != 0) {
        var curr = openSet.pop();
        // console.log("Checking node " + JSON.stringify(curr) + ", remaining: " + openSet.length);

        if(openSet.length > 250) {
            console.log("Too long.");
            return false;
        }

        // This is the goal. Path back using cameFrom to create the path.
        if(curr.id == goal.id) {
            return getPath(curr);
        }

        // Find neighbors by looking for adjacent nodes in ways.
        var neighbors = []
        for(var wayId of curr.ways) {
            var way = GeoData.footpaths[wayId];

            if(way === undefined)
                console.log("Error: way " + wayId + " not found.", curr);

            // console.log("  Found way " + wayId, way)
            // Push adjacent nodes in way
            for(var i = 0; i < way.nodes.length; i++) {
                if(way.nodes[i] == curr.id) {
                    // console.log("    Found original node. Pushing: " + way.nodes[i-1] + ", " + way.nodes[i+1] );
                    if(i-1 >= 0)
                        neighbors.push(way.nodes[i-1]);
                    if(i+1 < way.nodes.length)
                        neighbors.push(way.nodes[i+1]);
                    break;
                }
            }
        }
        // console.log("  Found neighbors " + JSON.stringify(neighbors));

        var path = getPath(curr);
        var feature = {
            id: 'gpx-route',
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: path.map(id => {
                    var node = GeoData.nodes[id];
                    return [ node.lon, node.lat ];
                })
            }
        };
        Draw.add(feature);
        await sleep(500);

        for(var neighborId of neighbors) {
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            var neighbor = GeoData.nodes[neighborId];
            var tempGScore = gScore[curr.id] + getDistance(curr, neighbor);

            var neighborGScore = 999999999;
            if(neighborId in gScore) {
                neighborGScore = gScore[neighborId];
            }

            if(tempGScore < neighborGScore) {
                // This path to neighbor is better than any previous one. Record it!
                cameFrom[neighborId] = curr.id;
                gScore[neighborId] = tempGScore;
                fScore[neighborId] = tempGScore + h(neighbor);

                if (!openSet.contains(neighbor, (x, y) => x.id == y.id)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    // Open set is empty but goal was never reached
    return false;
}

map.on('click', (e) => {
    addWaypoint([e.lngLat["lng"], e.lngLat["lat"]]);
    document.getElementById('waypoints-display').innerHTML = 
    "Waypoints:<br>" +
    JSON.stringify(Waypoints.getUserEndpoints())+
    "<br><br>Path Endpoints:<br>" +
    JSON.stringify(Waypoints.getPathEndpoints())
});