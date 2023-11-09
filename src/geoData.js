function polygonFromQuad(quadObj) {
    return [
        [quadObj.x, quadObj.y],
        [quadObj.x + quadObj.width, quadObj.y],
        [quadObj.x + quadObj.width, quadObj.y + quadObj.height],
        [quadObj.x, quadObj.y + quadObj.height],
        [quadObj.x, quadObj.y]
    ]
}

/**
 * An OSM Node in JSON format,
 * plus a list of Ways that contains it (not contained in the original OSM data).
 * Example:
 * ```json
 * {
 *   "type": "node",    // always "node"
 *   "id": 280525868,   // node ID
 *   "lat": 38.9849002, // node coordinates
 *   "lon": -76.9333648,
 *   "ways": [ ... ]    // integer way IDs
 * }
 * ```
 * @typedef {{
 *  type: string,
 *  id: number,
 *  lat: number,
 *  lon: number,
 *  ways: number[]
 * }} OSMNode
 */

/**
 * An OSM Way in JSON format. Example:
 * ```json
 * {
 *   "type": "way",    // always "way"
 *   "id": 123456,     // integer way ID
 *   "nodes": [ ... ], // integer node IDs
 *   "tags": {         // way OSM tags
 *       "foot": "yes",
 *       "highway": "footway",
 *       "lit": "yes"
 *   }
 * }
 * ```
 * @typedef {{
 *   type: string,
 *   id: number,
 *   nodes: number[],
 *   tags: Object.<string, string>
 * }} OSMWay
 */


/**
 * Contains functions for loading and querying map data.
 * @namespace GeoData
 */
const GeoData = {
    /**
     * Bounding box, used to set bounds of quadtree.
     * @memberof GeoData
     */
    bbox: [[-76.9599, 38.9962], [-76.9295, 38.9795]],
    /**
     * Contains {@link OSMWay}s in JSON format, indexed by ID. 
     * @memberof GeoData
     * @type {Object.<number, OSMWay>}
     */
    ways: {},
    /**
     * Contains the IDs of {@link OSMWay}s contained in {@link GeoData.ways}
     * in a quadtree, indexed by spatial location.
     * 
     * Example query:
     * ```js
     * // Retrieves nodes in quads intersecting a quad of width (0.001, 0.0008) at (long, lat).
     * var quad = {
     *    x: long,
     *    y: lat,
     *    width: 0.001,
     *    height:0.0008
     * };
     * var candidates = GeoData.footpathsQuadtree.retrieve(quad);​
     * ```
     * @memberof GeoData
     */
    nodesQuadtree: undefined,
    /**
     * Contains {@link OSMNode}s in JSON format, indexed by ID.
     * 
     * @memberof GeoData
     * @type {Object.<number, OSMNode>}
     */
    nodes: {},
    /**
     * Contains Node IDs of untraversable nodes.
     * 
     * @type {Set.<number>}
     */
    untraversableNodes: new Set(),

    /**
     * Gets a dictionary of {@link OSMWay}s in OSM JSON format.
     * @memberof GeoData
     * @returns {Object.<number, OSMWay>}
     */
    getFootpaths: () => this.footpaths,

    /**
     * Clears {@link GeoData.ways}, {@link GeoData.nodes}, and {@link GeoData.nodesQuadtree}.
     * @memberof GeoData
     * @returns {void}
     */
    initFootpaths() {
        this.ways = {};
        this.nodes = {};

        var width = this.bbox[1][0] - this.bbox[0][0];
        var x = this.bbox[0][0];
        if(width < 0) {
            width = -width;
            x = this.bbox[1][0];
        }

        var height = this.bbox[1][1] - this.bbox[0][1];
        var y = this.bbox[0][1];
        if(height < 0) {
            height = -height;
            y = this.bbox[1][1];
        }

        this.nodesQuadtree = new QT.QuadTree(new QT.Box(
            x, y, width, height
        ));
    },
    /**
     * Takes OSM JSON as input, and adds footpaths and nodes to
     * {@link GeoData.ways}, {@link GeoData.nodes}, and {@link GeoData.nodesQuadtree}.
     * 
     * Call before addConstruction.
     * @param {Object} json The OSM JSON data in Object format to load.
     */
    addFootpaths(json) {
        console.log("footpaths: Loading " + json.elements.length + " features");
        this.addWays(json, 
            (way) => {
                for (var nodeId of way.nodes) {
                    if (nodeId in this.nodes) {
                        // Add the ways to the node entry.
                        var node = this.nodes[nodeId];
                        var ways = node.ways;

                        if (ways == undefined) {
                            node.ways = [];
                        }
                        node.ways.push(way.id);
                    } else {
                        // Create a new node entry with only the ways,
                        // the rest of it will be filled in later.
                        this.nodes[nodeId] = {
                            ways: [way.id]
                        };
                    }
                }
                return way;
            },
            (node) => {
                var ways = [];
                // If node already has a list of ways, retrieve it.
                if (node.id in this.nodes) {
                    ways = this.nodes[node.id].ways;
                }
                
                node.ways = ways;
                return node;
            });
    },
    /**
     * Takes OSM JSON as input, and adds buildings and nodes to
     * {@link GeoData.ways}, {@link GeoData.nodes}, and {@link GeoData.nodesQuadtree}.
     * 
     * Call before addConstruction.
     * @param {Object} json The OSM JSON data in Object format to load.
     */
    addBuildings(json) {
        console.log("buildings: Loading " + json.elements.length + " features");
        this.addWays(json, 
            (way) => {
                for (var nodeId of way.nodes) {
                    if (nodeId in this.nodes) {
                        // Add the ways to the node entry.
                        var node = this.nodes[nodeId];
                        var ways = node.ways;

                        if (ways == undefined) {
                            node.ways = [];
                        }
                        node.ways.push(way.id);
                    } else {
                        // Create a new node entry with only the ways,
                        // the rest of it will be filled in later.
                        this.nodes[nodeId] = {
                            ways: [way.id]
                        };
                    }
                }
                return way;
            },
            (node) => {
                var ways = [];
                // If node already has a list of ways, retrieve it.
                if (node.id in this.nodes) {
                    ways = this.nodes[node.id].ways;
                }
                
                // If this is an entrance, add the node to the list of entrances in the way.
                if (node.tags != undefined && "entrance" in node.tags) {
                    for (var wayId of ways) {
                        var way = this.ways[wayId];
                        if ("building" in way.tags) {
                            if(way.entrances == undefined) {
                                way.entrances = [];
                            }
                            way.entrances.push(node.id);
                        }
                    }

                    node.ways = ways;
                    return node;
                }

                // Only add entrance nodes to node list
                // ? Maybe add but mark as untraversable, but for now 
                // there's no reason to, so just save memory
                return undefined;
            });
    },
    /**
     * Takes OSM JSON as input, and adds fields and nodes to
     * {@link GeoData.ways}, {@link GeoData.nodes}, and {@link GeoData.nodesQuadtree}.
     * 
     * Call before addConstruction.
     * @param {Object} json The OSM JSON data in Object format to load.
     */
    addFields(json) {
        console.log("fields: Loading " + json.elements.length + " features");
        this.addWays(json, 
            (way) => {
                for (var nodeId of way.nodes) {
                    if (nodeId in this.nodes) {
                        // Add the ways to the node entry.
                        var node = this.nodes[nodeId];
                        var ways = node.ways;

                        if (ways == undefined) {
                            node.ways = [];
                        }
                        node.ways.push(way.id);
                    } else {
                        // Create a new node entry with only the ways,
                        // the rest of it will be filled in later.
                        this.nodes[nodeId] = {
                            ways: [way.id]
                        };
                    }
                }
                return way;
            },
            (node) => {
                var ways = [];
                // If node already has a list of ways, retrieve it.
                if (node.id in this.nodes) {
                    ways = this.nodes[node.id].ways;
                }
                
                node.ways = ways;
                node.nearestFootpath = GeoData.nearestFootpath([node.lon, node.lat], false)?.node;
                if(node.nearestFootpath != undefined) {
                    GeoData.nodes[node.nearestFootpath].nearestGrass = node.id;
                }
                return node;
            });
    },
    /**
     * Takes GeoJSON as input and 
     * marks nodes in {@link GeoData.nodes} as untraversable if they overlap.
     * @param {*} json 
     */
    addConstruction(json) {
        console.log("construction: Loading " + json.features.length + " features");
        // this.constructionGeoJSON = json;
        for (var feature of json.features) {
            var bbox = turf.bbox(feature);
            var candidates = this.nodesQuadtree.query(new QT.Box(
                bbox[0],
                bbox[1],
                bbox[2] - bbox[0],
                bbox[3] - bbox[1]
            ));

            for (var candidate of candidates) {
                var candPoint = turf.point([candidate.x, candidate.y]);
                if (turf.booleanPointInPolygon(candPoint, feature)) {
                    GeoData.untraversableNodes.add(candidate.data);
                }
            }
        }
    },
    addWays(json, wayCallback, nodeCallback) {
        var start = new Date();

        var i = 0;
        var features = json['elements'];
        var failed = 0;
        // console.log(json);
        console.log("Loading " + features.length + " features");

        // Add all features (i.e. ways, nodes)
        for (var feature of features) {
            // Add way
            if (feature.type === 'way') {
                feature = wayCallback(feature);
                if(feature == undefined) continue;

                // Just add the way directly to the dictionary
                this.ways[feature.id] = feature;
            } 
            // Add node
            else if (feature.type === 'node') {
                feature = nodeCallback(feature);
                if(feature == undefined) continue;

                // Add the node to the dictionary..
                this.nodes[feature.id] = feature;

                // .. and the quadtree.
                var success = this.nodesQuadtree.insert(new QT.Point(
                    feature.lon,
                    feature.lat,
                    feature.id
                ));

                if(!success) {
                    if(!GeoData.nodesQuadtree.container.contains(new QT.Point(
                        feature.lon,
                        feature.lat
                    ))) {
                        failed++;
                    }
                }
            }

            i++;
        }

        console.log("Loaded " + Object.keys(this.nodes).length
            + " nodes, of which " + failed + " were not placed, and " 
            + Object.keys(this.ways).length + " ways in " + (new Date() - start) + "ms.");
    },
    wayIsBuilding(way) {
        return way.tags != undefined
            && "building" in way.tags && way.entrances != undefined;
    },
    wayIsGrass(way) {
        return way.tags != undefined
            && (("landuse" in way.tags && way.tags.landuse == "grass")
             || ("leisure" in way.tags && way.tags.leisure == "park"));
    },
    nodeIsBuilding(node) {
        for (var wayId of node.ways) {
            var way = GeoData.ways[wayId];
            if (this.wayIsBuilding(way)) {
                return true;
            }
        }
        return false;
    },
    nodeIsGrass(node) {
        for (var wayId of node.ways) {
            var way = GeoData.ways[wayId];
            if (this.wayIsGrass(way)) {
                return true;
            }
        }
        return false;
    },
    drawQuadtree: function (node) {
        var coords = [];
        this.drawQuadtreeRecursive(node, coords);

        var feature = {
            id: 'gpx-route',
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'MultiPolygon',
                coordinates: coords
            }
        };
        console.log("Drew " + coords.length + " rects.");
        Draw.add(feature);
    },
    drawQuadtreeRecursive: function (node, coords, includeObjects) {
        if (node == undefined) return;

        //no subnodes? draw the current node 
        if (node.nodes.length === 0) {
            coords.push([polygonFromQuad(node.bounds)]);

            if (includeObjects) {
                for (var obj of node.objects) {
                    coords.push([polygonFromQuad(obj)]);
                }
            }
            //has subnodes? drawQuadtree them!
        } else {
            for (var i = 0; i < node.nodes.length; i = i + 1) {
                this.drawQuadtreeRecursive(node.nodes[i], coords);
            }
        }
    },
    getSurroundingFootpaths(point, radius) {
        var candidates = this.getNearNodes(point, radius);

        if (!candidates || candidates.length == 0) {
            return [];
        } else {
            return candidates.filter(quad =>
                Algorithms.getDistance(
                    {lon: point[0], lat:point[1]},
                    GeoData.nodes[quad.data]) < radius );
        }
    },
    getNearNodes(point, width) {
        width ??= 0.001;
        var height = width * 0.8;
        return this.nodesQuadtree.query(new QT.Box(
            point[0] - width / 2,
            point[1] - height / 2,
            width,
            height
        )); 
    },
    /**
     * 
     * @param {number[]} point Long/lat coordinates in array form.
     * @returns {Object|undefined} A quad from the nodes quadtree, or undefined if not found.
     * See {@link GeoData.nodesQuadtree} for object layout.
     */
    nearestFootpath(point, allowGrass, allowUnwalkable) {
        var candidates = this.getNearNodes(point);

        if (!candidates || candidates.length == 0) {
            return undefined;
        } else {
            var minDist = 999999;
            var minQuad = candidates[0];

            for (var quad of candidates) {
                var dist = Algorithms.getDistance({lon: point[0], lat:point[1]}, GeoData.nodes[quad.data]);
                if ((allowGrass || !this.nodeIsGrass(GeoData.nodes[quad.data]))
                 && (allowUnwalkable || !this.untraversableNodes.has(quad.data))) {
                    if (dist < minDist) {
                        minDist = dist;
                        minQuad = quad;
                    }
                }
            }
            return {
                x: minQuad.x,
                y: minQuad.y,
                node: minQuad.data
            };
        }
    },
    loaded: false,
    onLoadListeners: [],
    onload(callback) {
        if(this.loaded) {
            callback();
        } else {
            this.onLoadListeners.push(callback);
        }
    }
};

async function fetchJson(path) {
    return fetch(path).then(response => response.json());
}

// Load GeoData
(async () => {
    GeoData.initFootpaths();
    GeoData.addFootpaths(await fetchJson('./res/footpaths/footpaths.min.json'));
    GeoData.addBuildings(await fetchJson('./res/buildings/buildings.min.json'));
    GeoData.addFields(await fetchJson('./res/fields/fields.min.json'));
    for(callback of GeoData.onLoadListeners) {
        callback();
    }
    GeoData.onLoadListeners = [];
    GeoData.loaded = true;
    // document.getElementById("loading-info-text").innerHTML = "Loaded.";
    // GeoData.addFootpaths(
    //     await fetch('./res/footpaths/footpaths.min.json').then(response => response.json()));
    // GeoData.setFootpathsXml('./res/footpaths.osm');
})();

var showNodeCheckbox = document.getElementById("show-path-nodes-checkbox");
showNodeCheckbox.addEventListener('change', (event) => {
    if (!event.currentTarget.checked) {
        Draw.delete('points');
    }
})
map.on('mousemove', (e) => {
    if (showNodeCheckbox.checked) {
        var point = [e.lngLat["lng"], e.lngLat["lat"]]
        var candidates = GeoData.getNearNodes(point);
        var traversableNodes = turf.multiPoint(candidates
            .filter(i => !GeoData.untraversableNodes.has(i.data))
            .map(i => [i.x, i.y]),
            {},
            { id: 'points' });
        var untraversableNodes = turf.multiPoint(candidates
            .filter(i => GeoData.untraversableNodes.has(i.data))
            .map(i => [i.x, i.y]), {
                color: "#ff0000"
            },
            { id: 'points-red' });
            
        var closestQuad = GeoData.nearestFootpath(point, true);
        var closestQuadFootpath = GeoData.nodes[closestQuad.node].nearestFootpath;
        var closestNodes = [
            turf.point([closestQuad.x, closestQuad.y], {
                color: "#00ff00",
                radius: 5
            },
            { id: 'points-closest' })
        ];
        if(closestQuadFootpath != undefined) {
            var closestQuadFootpathNode = GeoData.nodes[closestQuadFootpath];
            closestNodes.push(
                turf.point([closestQuadFootpathNode.lon, closestQuadFootpathNode.lat], {
                    color: "#00ffff",
                    radius: 5
                },
                { id: 'points-closest2' })
            );
        }

        var closestNode = turf.featureCollection(closestNodes);

        Draw.add(traversableNodes);
        Draw.add(untraversableNodes);
        Draw.add(closestNode);
        // console.log(untraversableNodes);
    }

    // var feature2 = {
    //     id: 'points2',
    //     type: 'Feature',
    //     properties: {},
    //     geometry: {
    //         type: 'Polygon',
    //         coordinates: [polygonFromQuad(quad)]
    //     }
    // };

    // Draw.add(feature2);
});