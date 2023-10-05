function polygonFromQuad(quadObj) {
    return [
        [quadObj.x, quadObj.y],
        [quadObj.x + quadObj.width, quadObj.y],
        [quadObj.x + quadObj.width, quadObj.y + quadObj.height],
        [quadObj.x, quadObj.y + quadObj.height],
        [quadObj.x, quadObj.y]
    ]
}

var GeoData = {
    bbox: [[-76.9599, 38.9962], [-76.9295, 38.9795]],
    footpaths: {},
    nodes: {},
    footpathsQuadtree: undefined,
    
    getFootpaths: () => this.footpaths,
    setFootpaths(json) {
        this.footpaths = {};
        this.nodes = {};
        this.footpathsQuadtree = new Quadtree({
            x: this.bbox[0][0],
            y: this.bbox[0][1],
            width: this.bbox[1][0] - this.bbox[0][0],
            height: this.bbox[1][1] - this.bbox[0][1]
        }, 10, 10);

        var start = new Date();

        var i = 0;
        var features = json['elements'];
        console.log(json);
        console.log("Loading " + features.length + " features");
        for (var feature of features) {
            if(feature.type === 'way') {
                this.footpaths[feature.id] = feature;

                for(var nodeId of feature.nodes) {
                    if(nodeId in this.nodes) {
                        // Add the ways to each node
                        var node = this.nodes[nodeId];
                        var ways = node.ways;

                        if(ways == undefined) {
                            node.ways = [];
                        }
                        node.ways.push(feature.id);
                    } else {
                        this.nodes[nodeId] = {
                            ways: [feature.id]
                        };
                    }
                }
            } else if (feature.type === 'node') {
                var ways = [];
                if (feature.id in this.nodes) {
                    ways = this.nodes[feature.id].ways;
                }

                this.nodes[feature.id] = feature;
                this.nodes[feature.id].ways = ways;

                this.footpathsQuadtree.insert({
                    x: feature.lon,
                    y: feature.lat,
                    width: 0.0001,
                    height: 0.00008,
                    node: feature.id
                });
            }
            
            i++;
        }
        console.log("Loaded " + Object.keys(this.nodes).length + " nodes and " + Object.keys(this.footpaths).length + " ways.");
        console.log("Loaded footpaths quadtree in " + (new Date() - start) + "ms");
        // console.log(this.nodes);
        // console.log( this.footpaths);
    },
    drawQuadtree: function(node) {
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
    drawQuadtreeRecursive: function(node, coords, includeObjects) {
        if (node == undefined) return;

        //no subnodes? draw the current node 
        if(node.nodes.length === 0) {
            coords.push([polygonFromQuad(node.bounds)]);

            if(includeObjects){
                for(var obj of node.objects) {
                    coords.push([polygonFromQuad(obj)]);
                }
            }
        //has subnodes? drawQuadtree them!
        } else {
            for(var i=0;i<node.nodes.length;i=i+1) {
                this.drawQuadtreeRecursive(node.nodes[i], coords);
            }
        }
    },
    nearestFootpath(point) {
        var candidates = this.footpathsQuadtree.retrieve({
            x: point[0],
            y: point[1],
            width: 0.01,
            height: 0.08
        });

        if(!candidates || candidates.length == 0) {
            return undefined;
        } else {
            var minDist = 999;
            var minNode = undefined;

            for(var node of candidates) {
                var xd = node.x - point[0];
                var yd = node.y - point[1];

                var dist = xd*xd + yd*yd;
                if(dist < minDist) {
                    minDist = dist;
                    minNode = node;
                }
            }
            return minNode;
        }
    }
};
    
// Load GeoData
(async () => {
    GeoData.setFootpaths(
        await fetch('./res/footpaths2.min.json').then(response => response.json()));
    // GeoData.setFootpathsXml('./res/footpaths.osm');
})();

map.on('mousemove', (e) => {
    var quad = {
        x: e.lngLat["lng"] - 0.0005,
        y: e.lngLat['lat'] - 0.0004,
        width: 0.001,
        height:0.0008
    };

    var candidates = GeoData.footpathsQuadtree.retrieve(quad);
    var feature = {
        id: 'points',
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'MultiPoint',
            coordinates: candidates.map(i => [i.x, i.y])
        }
    };
    
    Draw.add(feature);
    
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