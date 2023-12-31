// Contains functions for use in buttons and menus.


const UI = {
    userEndpoints: [],
    pathEndpoints: [],
    waypointElements: [],
    currConstructionNode: 0,

    setWaypoint(idx, waypoint) {
        console.log(idx, this.waypointElements.length)
        if(idx >= this.waypointElements.length) {
            this.ensureWaypointCount(idx+1);
        }

        var waypointElement = this.waypointElements[idx];
        waypointElement.querySelector('input').value = waypoint[0].toFixed(5) + ", " + waypoint[1].toFixed(5);

        this.userEndpoints[idx] = waypoint;
        this.pathEndpoints[idx] = GeoData.nearestFootpath(waypoint, Algorithms.pathThroughGrass(), false); // may be undefined
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

    stopLoading(err) {
        var loadingPanel = document.getElementById("loading-panel");

        if(err == undefined) {
            setTimeout(() => {
                loadingPanel.setAttribute("hidden", '');
            }, 400);
        }
        else {
            UI.startLoading(err);
            setTimeout(() => {
                UI.stopLoading(undefined);
            }, 3000);
        }
    },

    writePathInfo({ pathLength, pathTime }) {
        var pathDistanceLabel = document.getElementById("path-distance");
        var pathTimeLabel = document.getElementById("path-time");

        pathDistanceLabel.innerHTML = (0.621371 * pathLength).toFixed(2) + "mi";
        pathTimeLabel.innerHTML = (Math.ceil(pathTime * 60)) + "min";
    },

    activeLayerCallbacks: new Set(),
    async toggleLayer(layerName, toggle) {
        var layer = MapLayers.layers[layerName];
        var checked = false;
        if (toggle instanceof HTMLElement) {
            toggle.toggleAttribute("checked");
            checked = toggle.hasAttribute("checked");
        } else {
            checked = toggle;
        }

        if (checked == true) {
            if(layer.callbacks != undefined && 
                !this.activeLayerCallbacks.has(layer.id)) {
                for(var callback of Object.entries(layer.callbacks)) {
                    map.on(callback[0], layer.id, callback[1]);
                }
                this.activeLayerCallbacks.add(layer.id);
            }

            if (map.getSource(layer.id) == undefined) {
                UI.startLoading("Loading map source.");
                try {
                    if(layer.id in Layers) {
                        var data = await fetchJson(layer.src);
                        map.addSource(layer.id, {
                            "type": "geojson",
                            "data": data
                        });
                        map.addLayer(Layers[layer.id]);
                        UI.stopLoading();
                    } else {
                        UI.stopLoading(`Failed to load map source: Layer ${layer.id} has no corresponding style.`);
                        console.log(`!! Layer ${layer.id} has no corresponding style.`);
                    }
                } catch(e) {
                    UI.stopLoading("Failed to load map source: "+e);
                    throw e;
                }
            } else {
                map.setLayoutProperty(layer.id, 'visibility', 'visible');
            }
        } else {
            // if(layer.callbacks != undefined && 
            //     this.activeLayerCallbacks.has(layer.id)) {
            //     for(var callback of Object.entries(layer.callbacks)) {
            //         map.off(callback[0], layer.id, callback[1]);
            //     }
            // }

            map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
    },
    async geocode(input, geocoderList) {
        var uuid;
        if(document.cookie.split(";").some((item) => item.trim().startsWith("mapbox_session_token="))) {
            uuid = document.cookie
                .split("; ")
                .find((row) => row.startsWith("mapbox_session_token="))
                .split("=")[1];
        }else {
            uuid = crypto.randomUUID();
            document.cookie = "mapbox_session_token=" + uuid;
        }
        console.log(input, geocoderList)
        console.log(geocoderList.children[0].innerHtml);
        var json = await fetchJson(
            ` https://api.mapbox.com/search/searchbox/v1/suggest?q=${input.value}
                &language=en
                &session_token=${uuid}
                &access_token=${mapboxgl.accessToken}`
        );

        console.log(json);
        geocoderList.children[0].innerHtml =json;
        geocoderList.removeAttribute('hidden')
    }
};

var x = document.getElementById("geolocation");

function getUserLocation(callback, errorCallback) {
  if (navigator.geolocation) {
    x.innerHTML = "Locating...";
    navigator.geolocation.getCurrentPosition(callback, errorCallback);
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
    }, showError)
}

function setWaypointAtUserLocation(idx) {
    UI.startLoading("Finding user location.");
    getUserLocation((pos) => {
        var point = [pos.coords.longitude, pos.coords.latitude];

        UI.setWaypoint(idx, point);
        Waypoints.renderWaypoints(UI.userEndpoints, UI.pathEndpoints);
        UI.stopLoading();
    },
    (err) => {
        UI.stopLoading(getError(err));
        showError(err);
    });
}

function queryConstructionAtUserLocation() {
    UI.startLoading("Finding user location.");
    getUserLocation((pos) => {
        var point = [pos.coords.longitude, pos.coords.latitude];

        UI.startLoading("Showing surrounding walkway nodes.");
        queryConstructionAt(point, 0.05);
        UI.stopLoading();
    }, showError);
}

function queryConstructionAt(waypoint, radius=0.03) {
    map.flyTo({center: waypoint, duration:1000, essential:true})
    // find surrounding footpaths within 0.03km
    var nodeQuads = GeoData.getSurroundingFootpaths(waypoint, radius);
    var untraversableNodes = new Set(
        nodeQuads.filter(quad => GeoData.untraversableNodes.has(quad.data)).map((quad) => quad.data)
    );
    console.log(untraversableNodes)

    var rebuildSource = (highlightNode) => {
        var nodes = nodeQuads.map((quad) => quad.data);
        var featureData = turf.featureCollection(nodeQuads.map((quad) => {
            return turf.point([quad.x, quad.y], {
                walkable: !untraversableNodes.has(quad.data),
                highlight: quad.data == highlightNode
            })
        }));

        Layers.setOrAddLayer('user-construction-points', featureData);
        Construction.drawPolygon(nodes.filter(x => untraversableNodes.has(x)));
    };
    
    rebuildSource(nodeQuads[0].data);
    Layers.setOrAddLayer('user-construction-bounds',
        turf.circle(waypoint, radius, {units:"kilometers"})
    );
    map.addLayer(Layers['user-construction-fill']);
    Layers.showLayer('user-construction-points');
    Layers.showLayer('user-construction-bounds');
    Layers.showLayer('user-construction-fill');

    UI.currConstructionNode = 0;
    rebuildSource(nodeQuads[UI.currConstructionNode].data);
    var constructionPanel = document.getElementById("query-construction-container");
    var navPanel = document.getElementById("navigation-panel");
    constructionPanel.removeAttribute("nodisplay");
    navPanel.setAttribute("nodisplay", "");

    var closePanel = (setUntraversableNodes) => {
        buttons[0].onclick = undefined;
        buttons[1].onclick = undefined;
        navPanel.removeAttribute("nodisplay");
        constructionPanel.setAttribute("nodisplay", "");
        Layers.hideLayer('user-construction-points');
        Layers.hideLayer('user-construction-bounds');
        Layers.hideLayer('user-construction-fill');

        if(setUntraversableNodes) {
            for(node of untraversableNodes) {
                GeoData.untraversableNodes.add(node);
            }
        }
    };

    buttons = constructionPanel.querySelectorAll(".go-button");

    buttons[2].onclick = closePanel;
    buttons[3].onclick = () => { closePanel();  };
    
    var yesClick = () => {
        var node = nodeQuads[UI.currConstructionNode].data;
        untraversableNodes.add(node);
        UI.currConstructionNode++;
        console.log(UI.currConstructionNode, nodeQuads.length);
        if(UI.currConstructionNode < nodeQuads.length){
            rebuildSource(nodeQuads[UI.currConstructionNode].data);
        }
        if(UI.currConstructionNode >= nodeQuads.length){
            closePanel();
        }
    };
    console.log(buttons[0])
    buttons[0].onclick = yesClick;

    var noClick = () => {
        var node = nodeQuads[UI.currConstructionNode].data;
        untraversableNodes.delete(node);
        UI.currConstructionNode++;
        if(UI.currConstructionNode < nodeQuads.length){
            rebuildSource(nodeQuads[UI.currConstructionNode].data);
        }
        if(UI.currConstructionNode >= nodeQuads.length){
            closePanel();
        }
    };
    buttons[1].onclick = noClick;

    var closeButton = document.getElementById('construction-close-button');
    closeButton.onclick = closePanel;
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

function getError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
        return "User denied the request for Geolocation.\nYou may need to enable location services.";
    case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable.";
    case error.TIMEOUT:
        return "The request to get user location timed out.";
    case error.UNKNOWN_ERROR:
        return "An unknown error occurred.";
  }
}

function showError(error) {
    x.innerHtml = getError(error);
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

map.on('load', async () => {
    UI.toggleLayer('-umdmaps-construction', true)
});