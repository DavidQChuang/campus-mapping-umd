/**
 * Contains functions for running and visualizing algorithms
 * as well as helper methods for use in algorithms.
 * @namespace Algorithms
 */
const Algorithms = {
    Astar(start, goal) {
        return pathfindAstar(start, goal, node => Algorithms.getDistance(goal, node))
    },
    Dstar(start, goal) {
        return pathfindDstar(start, goal, node => Algorithms.getDistance(goal, node))
    },
    Dijkstra(start, goal) {
        return pathfindDijkstra(start, goal, node => Algorithms.getDistance(goal, node))
    },

    getTickDelay() {
        return document.getElementById("path-delay-checkbox").checked ? 10 : 0;
    },

    pathThroughBuildings() {
        return document.getElementById("path-buildings-checkbox").checked;
    },

    pathThroughGrass() {
        return document.getElementById("path-grass-checkbox").checked;
    },

    /**
     * Gets the neighbors of the current Node by traversing within and between Ways
     * by moving between neighbors and Ways connected by the same Node.
     * @param {OSMNode} node The current Node.
     * @returns {number[]} Array of Node IDs.
     */
    getNeighbors(node) {
        var neighbors = []
        var pathThroughBuildings = this.pathThroughBuildings();
        var pathThroughGrass = this.pathThroughGrass();
        // console.log("asdf", node);

        if (typeof node === "number")
            throw new Error("Received a number. Algorithms.getNeighbors accepts nodes, not node ids.");

        var nodeIsGrass = false;
        for (var wayId of node.ways) {
            var way = GeoData.ways[wayId];

            if (way === undefined) {
                console.log("Error: way " + wayId + " not found.", node);

            // way is building
            } else if(pathThroughBuildings && GeoData.wayIsBuilding(way)) {
                neighbors.push(...way.entrances);
            }
            else if(GeoData.wayIsGrass(way)) {
                nodeIsGrass = true;
                if(pathThroughGrass){
                    console.log("grass")
                    neighbors.push(...way.nodes);
                }
            }
            // way is footpath
            else {
                // console.log("  Found way " + wayId, way)
                // Push adjacent nodes in way
                for (var i = 0; i < way.nodes.length; i++) {
                    if (way.nodes[i] == node.id) {
                        // console.log("    Found original node. Pushing: " + way.nodes[i-1] + ", " + way.nodes[i+1] );
                        if (i - 1 >= 0){
                            var wayNode = way.nodes[i - 1];
                            if(!GeoData.untraversableNodes.has(wayNode))
                                neighbors.push(wayNode);
                        }
                        if (i + 1 < way.nodes.length){
                            var wayNode = way.nodes[i + 1];
                            if(!GeoData.untraversableNodes.has(wayNode))
                                neighbors.push(wayNode);
                        }
                        break;
                    }
                }
            }
        }

        // If this is a grass node, search for the nearest non-grass node
        // and add a bidirectional reference.
        if(nodeIsGrass) {
            if(node.nearestFootpath == undefined) {
                node.nearestFootpath = GeoData.nearestFootpath([node.lon, node.lat]).node;
                GeoData.nodes[node.nearestFootpath].nearestGrass = node.id;
            }
            if(node.nearestFootpath != undefined) {
                neighbors.push(node.nearestFootpath);
            }
        }

        // If able to walk through grass and this (non-grass) node is close to a grass node,
        // consider it a neighbor.
        if(pathThroughGrass && node.nearestGrass != undefined) {
            neighbors.push(node.nearestGrass);
        }

        return neighbors;
    },


    /**
     * Gets a path from one node to another given a dictionary storing ids of previous nodes.
     * @param {Object.<number, number>} cameFrom A dictionary of node IDs indexed by node IDs recording 
     * which node to move to from the current node.
     * @param {OSMNode} start The target node. The path will terminate upon reaching this node.
     * @param {OSMNode} node The first node to check. The path will traverse cameFrom backwards from this node.
     * @returns {number[]} Array of Node IDs.
     */
    getPath(cameFrom, start, node) {
        var currId = node.id;
        var nodeIds = [];

        while (currId != start.id) {
            // Push the current id then go to the previous node.
            nodeIds.push(currId);
            currId = cameFrom[currId];

            if (currId === undefined) {
                console.log("Error")
                throw new RangeError("Node path does not exist");
            }
        }
        nodeIds.push(start.id);

        return nodeIds;
    },

    /**
     * Gets a path from one node to another and the length of the entire path
     * given a dictionary storing ids of previous nodes.
     * @param {Object.<number, number>} cameFrom A dictionary of node IDs indexed by node IDs recording 
     * which node to move to from the current node.
     * @param {OSMNode} start The target node. The path will terminate upon reaching this node.
     * @param {OSMNode} node The first node to check. The path will traverse cameFrom backwards from this node.
     * @returns {{path: number[], pathLength: number}} Object containing an array of Node IDs and the length of the path.
     */
    getPathLength(cameFrom, start, node) {
        var currId = node.id;
        var nodeIds = [];
        var pathLength = 0;

        while (currId != start.id) {
            // Push the current id then go to the previous node.
            nodeIds.push(currId);
            var nextId = cameFrom[currId];

            if (nextId === undefined) {
                console.log("Error")
                throw new RangeError("Node path does not exist");
            }

            pathLength += Algorithms.getDistance(GeoData.nodes[nextId], GeoData.nodes[currId]);
            currId = nextId;
        }
        nodeIds.push(start.id);

        return { path: nodeIds, pathLength: pathLength};
    },

    /**
     * Calculates the time to walk the given path.
     * 
     * Walking through buildings (i.e. from one entrance to another) 
     * is assumed to be 1.41 times slower than walking the distance in a straight line
     * directly between the entrance/exit nodes.
     * @param {number} dist 
     * @returns {{pathTime: number, path: number[], pathLength: number}} time: The time (in hours) to walk the given distance (in km) at a pace of 4.3km/h. dist: The actual distance.
     */
    getPathTime(cameFrom, start, node) {
        var currId = node.id;
        var nodeIds = [];
        var actualPathLength = 0;
        var estPathLength = 0;

        while (currId != start.id) {
            // Push the current id then go to the previous node.
            nodeIds.push(currId);
            var nextId = cameFrom[currId];

            if (nextId === undefined) {
                console.log("Error")
                throw new RangeError("Node path does not exist");
            }

            var n1 = GeoData.nodes[currId];
            var n2 = GeoData.nodes[nextId]
            var dist = Algorithms.getDistance(n1, n2);

            actualPathLength += dist;
            
            // Assume the path takes a right turn through a building
            if(n1.tags && n1.tags.entrance == "yes" && n2.tags && n2.tags.entrance == "yes" ) {
                estPathLength += dist * 1.41;
            } else {
                estPathLength += dist;
            }

            currId = nextId;
        }
        nodeIds.push(start.id);

        return { pathTime: estPathLength / 4.3, path: nodeIds, pathLength: actualPathLength };
    },

    /**
     * Draws a path on the map given an array of node IDs.
     * @param {string} id The ID of the map feature to be drawn.
     *   Drawing a feature with an ID corresponding to an existing feature will overwrite the previous one.
     * @param {number[]} path An array of node IDs forming a path.
     * @returns {void}
     */
    drawRoute(id, path) {
        if(id in this.cachedRoutes) {
            delete this.cachedRoutes[id];
            document.getElementById(id+"-toggle").innerText = "Hide";
        }

        var feature = {
            id: id,
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: path.map(id => {
                    var node = GeoData.nodes[id];
                    return [node.lon, node.lat];
                })
            }
        };
        Draw.add(feature);
    },

    /**
     * 
     */
    cachedRoutes: {},
    /**
     * Toggles the visiblity of the given Draw feature.
     * @param {string} id The map feature id.
     * @returns {bool|undefined} True if the feature is now visible, false if not.
     * Undefined if the feature doesn't exist in either the cache or list of active features.
     */
    toggleFeature(id) {
        if(id in this.cachedRoutes) {
            Draw.add(this.cachedRoutes[id]);
            delete this.cachedRoutes[id];
            return true;
        } else if(Draw.get(id) != undefined) {
            var feature = Draw.get(id);
            this.cachedRoutes[id] = feature;

            Draw.delete(id);
            return false;
        }

        return undefined;
    },
    /**
     * Toggles the given route as well as the text of the given button.
     * @param {Element} self The button to change the text of.
     * @param {string} id The map feature id.
     * @returns {void}
     */
    toggleFeatureButton(self, id) {
        var val = this.toggleFeature(id);

        if(val) {
            self.innerText = "Hide";
        } else {
            self.innerText = "Show";
        }
    },

    /**
     * Gets the squared distance (in kilometers) between two nodes.
     * @param {OSMNode} n1 The first node.
     * @param {OSMNode} n2 The second node.
     * @returns {number} The distance in kilometers.
     */
    getDistance(n1, n2) {
        var dist = turf.distance([n1.lon, n1.lat], [n2.lon, n2.lat], { units: 'kilometers' });
        return dist;
    },
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function timeLogs(startTime, iters, tickSize) {
    var time = new Date() - startTime;

    if (tickSize == 0) {
        return `${time}ms & ${iters} ticks`;
    } else {
        return `${time}ms & ${iters} ticks, estimate: ${time - iters * tickSize}ms`;
    }
}

////////////////////////////////////////
//       .o.          o    
//      .888.      `8.8.8' 
//     .8"888.     .8'8`8. 
//    .8' `888.       "    
//   .88ooo8888.           
//  .8'     `888.          
// o88o     o8888o        
////////////////////////////////////////
async function pathfindAstar(start, goal, h) {
    const tickSize = Algorithms.getTickDelay();
    const startTime = new Date();

    var infoLabel = document.getElementById('astar-path-info');
    infoLabel.innerHTML = "Pathing @ " + tickSize + "ms/tick";
    var toggleButton = document.getElementById('astar-path-toggle');
    toggleButton.hidden = false;

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

    var iters = 0;
    while (openSet.length != 0) {
        iters++;
        if (openSet.length > 250) {
            infoLabel.innerHTML = `Failed in ${timeLogs(startTime, iters, tickSize)}; search was too large.`;
            console.log("Too long.");
            return {
                path: undefined,
                runTime: new Date() - startTime, tickSize, iters
            };
        }
        var curr = openSet.pop();

        // Draw route to current node for visualization
        if (tickSize != 0 || curr.id == goal.id) {
            var path = Algorithms.getPath(cameFrom, start, curr);
            Algorithms.drawRoute('astar-path', path);
            await sleep(tickSize);
        }

        // This is the goal. Path back using cameFrom to create the path.
        if (curr.id == goal.id) {
            const { path, pathLength, pathTime: pathTime } = Algorithms.getPathTime(cameFrom, start, curr);

            console.log("Found goal " + curr.id + " == " + goal.id);
            infoLabel.innerHTML = `Success in ${timeLogs(startTime, iters, tickSize)}.` +
                ` Distance: ${pathLength.toFixed(2)}km, ${(pathTime * 60).toFixed(2)} mins`;
            // UI.writePathInfo({pathLength, time})
            return {
                path, pathLength, pathTime,
                runTime: new Date() - startTime, tickSize, iters
            };
        }

        // Find neighbors by looking for adjacent nodes in ways.
        var neighbors = Algorithms.getNeighbors(curr);
        // Search neighbors for paths
        for (var neighborId of neighbors) {
            // d(current,neighbor) is the weight of the edge from current to neighbor
            // tentative_gScore is the distance from start to the neighbor through current
            var neighbor = GeoData.nodes[neighborId];
            var tempGScore = gScore[curr.id] + Algorithms.getDistance(curr, neighbor);

            var neighborGScore = 999999999;
            if (neighborId in gScore) {
                neighborGScore = gScore[neighborId];
            }

            if (tempGScore < neighborGScore) {
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
    infoLabel.innerHTML = `Failed in ${timeLogs(startTime, iters, tickSize)}; goal was never reached.`;
    return {
        path: undefined,
        runTime: new Date() - startTime, tickSize, iters
    };
}

////////////////////////////////////////
// oooooooooo.      o    
// `888'   `Y8b  `8.8.8' 
//  888      888 .8'8`8. 
//  888      888    "    
//  888      888         
//  888     d88'         
// o888bood8P'   
////////////////////////////////////////
async function pathfindDstar(start, goal, h) {
    const tickSize = Algorithms.getTickDelay();
    const startTime = new Date();
    var infoLabel = document.getElementById('dstar-path-info');
    infoLabel.innerHTML = "Pathing @ " + tickSize + "ms/tick";
    var toggleButton = document.getElementById('dstar-path-toggle');
    toggleButton.hidden = false;

    // Stores distances from the start node
    var dist = {};
    // Stores previous node to the current node with the shortest path
    var cameFrom = {};
    var visited = new Set();
    var openSet = new MinHeap(((goal) => node => Algorithms.getDistance(node, goal))(goal));

    dist[start.id] = 0;
    openSet.push(start);
    visited.add(start.id);

    function isRaise(node, neighbors) {
        var cost;
        if (node.getCurrentCost() > node.getMinimumCost()) {
            for (var neighbor of neighbors) {
                cost = node.calculateCostVia(neighbor);
                if (cost < node.getCurrentCost()) {
                    node.setNextPointAndUpdateCost(neighbor);
                }
            }
        }
        return node.getCurrentCost() > node.getMinimumCost();
    };

    var iters = 0;
    while (openSet.length > 0) {
        iters++;
        // Fail if taking too long.
        if (openSet.length > 250) {
            infoLabel.innerHTML = `Failed in ${timeLogs(startTime, iters, tickSize)}; search was too large.`;
            console.log("Too long.");
            return false;
        }

        var curr = openSet.pop();
        var currIsRaise = isRaise(curr);

        for (var neighborId of Algorithms.getNeighbors(curr)) {
            if (currIsRaise) {
                if (neighbor.nextPoint == currentPoint) {
                    neighbor.setNextPointAndUpdateCost(currentPoint);
                    openList.add(neighbor);
                } else {
                    var cost = neighbor.calculateCostVia(currentPoint);
                    if (cost < neighbor.getCost()) {
                        currentPoint.setMinimumCostToCurrentCost();
                        openList.add(currentPoint);
                    }
                }
            } else {
                var cost = neighbor.calculateCostVia(currentPoint);
                if (cost < neighbor.getCost()) {
                    neighbor.setNextPointAndUpdateCost(currentPoint);
                    openList.add(neighbor);
                }
            }
        }
    }

    var tempGScore = gScore[curr.id] + Algorithms.getDistance(curr, neighbor);

    var neighborGScore = 999999999;
    if (neighborId in gScore) {
        neighborGScore = gScore[neighborId];
    }

    if (tempGScore < neighborGScore) {
        // This path to neighbor is better than any previous one. Record it!
        cameFrom[neighborId] = curr.id;
        gScore[neighborId] = tempGScore;
        fScore[neighborId] = tempGScore + h(neighbor);

        if (!openSet.contains(neighbor, (x, y) => x.id == y.id)) {
            openSet.push(neighbor);
        }
    }

    // Open set is empty but goal was never reached
    infoLabel.innerHTML = `Failed in ${timeLogs(startTime, iters, tickSize)}; goal was never reached.`;
    return false;
}
////////////////////////////////////////
// oooooooooo.    o8o      o8o oooo                     .                      
// `888'   `Y8b   `"'      `"' `888                   .o8                      
//  888      888 oooo     oooo  888  oooo   .oooo.o .o888oo oooo d8b  .oooo.   
//  888      888 `888     `888  888 .8P'   d88(  "8   888   `888""8P `P  )88b  
//  888      888  888      888  888888.    `"Y88b.    888    888      .oP"888  
//  888     d88'  888      888  888 `88b.  o.  )88b   888 .  888     d8(  888  
// o888bood8P'   o888o     888 o888o o888o 8""888P'   "888" d888b    `Y888""8o 
//                         888                                                 
//                     .o. 88P                                                 
//                     `Y888P       
////////////////////////////////////////   

async function pathfindDijkstra(start, goal, h) {
    const tickSize = Algorithms.getTickDelay();
    const startTime = new Date();
    var infoLabel = document.getElementById('dijkstra-path-info');
    infoLabel.innerHTML = "Pathing @ " + tickSize + "ms/tick";
    var toggleButton = document.getElementById('dijkstra-path-toggle');
    toggleButton.hidden = false;

    // Stores distances from the start node
    var dist = {};
    // Stores previous node to the current node with the shortest path
    var cameFrom = {};
    var visited = new Set();
    var openSet = new MinHeap(((dist) => node => dist[node.id])(dist));

    dist[start.id] = 0;
    openSet.push(start);
    visited.add(start.id);

    var iters = 0;
    while (openSet.length > 0) {
        iters++;
        infoLabel.innerHTML = "Pathing @ " + tickSize + "ms/tick, search size: " + openSet.length;
        // Fail if taking too long.
        if (openSet.length > 250) {
            infoLabel.innerHTML = `Failed in ${timeLogs(startTime, iters, tickSize)}; search was too large.`;
            console.log("Too long.");
            return {
                path: undefined,
                runTime: new Date() - startTime, tickSize, iters
            };
        }

        var curr = openSet.pop();
        var currDist = dist[curr.id];

        // Remove current node from unvisited ndoes
        visited.add(curr.id);

        // Draw route to current node for visualization
        if (tickSize != 0) {
            var path = Algorithms.getPath(cameFrom, start, curr);
            Algorithms.drawRoute('dijkstra-path', path);
            await sleep(tickSize);
        }

        for (var neighborId of Algorithms.getNeighbors(curr)) {
            var neighbor = GeoData.nodes[neighborId];

            // Only read unvisited nodes
            if (visited.has(neighbor.id)) continue;
            else {
                // Get distance of current node + distance from curr to neighbor
                var alt = currDist + Algorithms.getDistance(curr, neighbor);
                var neighborDist = dist[neighbor.id] ?? Infinity;
                
                // If this path is shorter, update dist and cameFrom.
                if (alt < neighborDist) {
                    openSet.replace(neighbor, (x, y) => x.id == y.id);
                    dist[neighbor.id] = alt;
                    cameFrom[neighbor.id] = curr.id;
                    neighborDist = alt;
                }

                // Only check this neighbor recursively if the path is
                // shorter than the known shortest distance to the goal.
                var goalDist = dist[goal.id] ?? Infinity;
                if(neighborDist <= goalDist) {
                    // Add to open set if not previously added to open set
                    if(!(openSet.contains(neighbor, (x, y) => x.id == y.id))){
                        openSet.push(neighbor);
                    }
                }
            }
        }
    }

    // Finish when the absolute shortest path is known or we ran out of paths.
    if (cameFrom[goal.id] != undefined) {
        // Draw path
        const { path, pathLength, pathTime } = Algorithms.getPathTime(cameFrom, start, goal);
        Algorithms.drawRoute('dijkstra-path', path);

        console.log("Found goal " + goal.id + " == " + goal.id);
        infoLabel.innerHTML = `Success in ${timeLogs(startTime, iters, tickSize)}. Distance: ${pathLength.toFixed(2)}km, Dijkstra distance: ${dist[goal.id].toFixed(2)}km`;
        return {
            path, pathLength, pathTime,
            runTime: new Date() - startTime, tickSize, iters
        };
    } else {
        // Open set is empty but goal was never reached
        infoLabel.innerHTML = `Failed in ${timeLogs(startTime, iters, tickSize)}; goal was never reached.`;
        return {
            path: undefined,
            runTime: new Date() - startTime, tickSize, iters
        };
    }
}