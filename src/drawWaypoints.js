/**
 * Contains functions and fields for drawing waypoints from A to B on the map, 
 * and getting nearest nodes to those points.
 * @namespace Waypoints
 */
const Waypoints = {
    userEndpoints: [],
    pathEndpoints: [],
    pathRoute: [],

    unrenderUserEndpoints() {
        if (map.getSource('user-waypoints') != undefined) {
            map.setLayoutProperty('user-waypoints', 'visibility', 'none');
            map.setLayoutProperty('user-waypoints-text', 'visibility', 'none');
        }
        if (map.getSource('user-waypoints-path') != undefined) {
            map.setLayoutProperty('user-waypoints-path', 'visibility', 'none');
        }
    },

    unrenderPathEndpoints() {
        if (map.getSource('path-waypoints') != undefined) {
            map.setLayoutProperty('path-waypoints', 'visibility', 'none');
        }
    },

    renderUserEndpoints(userEndpoints) {
        // Render points A and B
        var validUserPointCount = this.getValidEndpoints(userEndpoints).length;
        if (map.getSource('user-waypoints') == undefined) {
            // Has to be at least one endpoint to render
            if (validUserPointCount > 0) {
                map.addSource('user-waypoints', {
                    "type": "geojson", "data": Waypoints.userPointFeature(userEndpoints)
                });
                map.addLayer(Layers['user-waypoints-text']);
                map.addLayer(Layers['user-waypoints'], "user-waypoints-text");
            }
        } else {
            // Has to be at least one endpoint to render
            if (validUserPointCount > 0) {
                map.setLayoutProperty('user-waypoints', 'visibility', 'visible');
                map.getSource('user-waypoints').setData(Waypoints.userPointFeature(userEndpoints));
            } else {
                map.setLayoutProperty('user-waypoints', 'visibility', 'none');
            }
        }

        // Render straight line from point A to B
        if (map.getSource('user-waypoints-path') == undefined) {
            // Has to be at least 2 endpoints to render
            if (validUserPointCount >= 2) {
                map.addSource('user-waypoints-path', {
                    type: 'geojson', data: Waypoints.userLineFeature(userEndpoints)
                });
                map.addLayer(Layers['user-waypoints-path'], "user-waypoints");
            }
        } else {
            // Has to be at least 2 endpoints to render
            if (validUserPointCount >= 2) {
                map.setLayoutProperty('user-waypoints-path', 'visibility', 'visible');
                map.getSource('user-waypoints-path').setData(Waypoints.userLineFeature(userEndpoints));
            } else {
                map.setLayoutProperty('user-waypoints-path', 'visibility', 'none');
            }
        }
    },

    renderPathEndpoints(pathEndpoints) {
        // Render path endpoints
        var validPathPointCount = this.getValidEndpoints(pathEndpoints).length;
        if (map.getSource('path-endpoints') == undefined) {
            if (validPathPointCount > 0) {
                // Waypoint style
                // console.log(Waypoints.pathPointFeature());
                map.addSource('path-endpoints', {
                    "type": "geojson", "data": Waypoints.pathPointFeature(pathEndpoints)
                });
                map.addLayer(Layers['path-endpoints-text']);
                map.addLayer(Layers['path-endpoints'], "path-endpoints-text");
            }
        } else {
            map.getSource('path-endpoints').setData(Waypoints.pathPointFeature(pathEndpoints));
        }
    },

    renderWaypoints(userEndpoints, pathEndpoints) {
        // Update/create waypoints
        this.renderUserEndpoints(userEndpoints);
        this.renderPathEndpoints(pathEndpoints);
    },
    // addWaypoint(waypoint) {
    //     var nearestFootpath = GeoData.nearestFootpath(waypoint);
    //     if(nearestFootpath == undefined){
    //         console.log("No footpath found; cannot set waypoint");
    //         return;
    //     }

    //     this.userEndpoints.push(waypoint);

    //     console.log("nearest footpath: " + [nearestFootpath.x, nearestFootpath.y]);
    //     if (nearestFootpath != undefined) {
    //         this.pathEndpoints.push(nearestFootpath);
    //     }

    //     if (this.userEndpoints.length > 2) {
    //         this.userEndpoints.splice(0, 2);
    //         this.pathEndpoints.splice(0, 2);
    //     }

    //     this.renderWaypoints();
    // },
    getValidEndpoints(pathEndpoints) {
        return pathEndpoints.filter(x => x != undefined);
    },
    userPointFeature(userEndpoints) {
        return {
            "type": "FeatureCollection",
            "features":
                userEndpoints.map((x, idx) => {
                    if(x == undefined) return undefined;
                    else return {
                        "type": "Feature",
                        "properties": {
                            "text": String.fromCharCode("A".charCodeAt() + idx)
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": x
                        }
                    }
                }).filter(x => x != undefined)
        }
    },
    userLineFeature(userEndpoints) {
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": userEndpoints.filter(x => x != undefined)
            }
        }
    },
    pathPointFeature(pathEndpoints) {
        return {
            "type": "FeatureCollection",
            "features":
                pathEndpoints.map((node, idx) => {
                    if(node == undefined) return undefined;
                    else return {
                        "type": "Feature",
                        "properties": {
                            "text": String.fromCharCode("A".charCodeAt() + idx)
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [node.x, node.y]
                        }
                    }
                }).filter(x => x != undefined)
        }
    },
    pathLineFeature(pathRoute) {
        return {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": pathRoute
            }
        }
    },
};

// map.on('click', (e) => {
//     Waypoints.addWaypoint([e.lngLat["lng"], e.lngLat["lat"]]);
//     // document.getElementById('waypoints-display').innerHTML = 
//     // "Waypoints:<br>" +
//     // JSON.stringify(Waypoints.getUserEndpoints())+
//     // "<br><br>Path Endpoints:<br>" +
//     // JSON.stringify(Waypoints.getPathEndpoints())
// });

// map.on('touchstart', (e) => {
//     Waypoints.addWaypoint([e.lngLat["lng"], e.lngLat["lat"]]);
// });

// console.log(map)