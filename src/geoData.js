var GeoData = {
    bbox: [[-76.9599, 38.9962], [-76.9295, 38.9795]],
    footpaths: {},
    footpathsQuadtree: undefined,

    getFootpaths: () => this.footpaths,
    setFootpaths(footpaths) {
        this.footpaths = footpaths;
        this.footpathsQuadtree = new Quadtree({
            x: this.bbox[0][0],
            y: this.bbox[0][1],
            width: this.bbox[1][0] - this.bbox[0][0],
            height: this.bbox[1][1] - this.bbox[0][1]
        }, 10, 20);

        var start = new Date();

        var i = 0;
        var features = footpaths['features'];
        console.log("Loading " + features.length + " features");
        for (var feature of features) {
            var geometry = feature['geometry'];

            for (var element of geometry['coordinates']) {
                // is array of points
                if (Array.isArray(element)) {
                    for (var point of element) {
                        this.footpathsQuadtree.insert({
                            x: point[0],
                            y: point[1],
                            width: 0.0001,
                            height: 0.00008,
                            feature: i
                        });
                    }
                }
                // is actual point
                else {
                    this.footpathsQuadtree.insert({
                        x: element[0],
                        y: element[1],
                        width: 0.0001,
                        height: 0.00008,
                        feature: i
                    });
                }
            }
            i++;
        }
        console.log(this.footpathsQuadtree)

        console.log("Loaded footpaths quadtree in " + (new Date() - start) + "ms");
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
    drawQuadtreeRecursive: function(node, coords) {
        if (node == undefined) return;

        //no subnodes? draw the current node 
        if(node.nodes.length === 0) {
            coords.push([[
                [node.bounds.x, node.bounds.y],
                [node.bounds.x + node.bounds.width, node.bounds.y],
                [node.bounds.x + node.bounds.width, node.bounds.y + node.bounds.height],
                [node.bounds.x, node.bounds.y + node.bounds.height],
                [node.bounds.x, node.bounds.y]
            ]]);
            for(var obj of node.objects) {
                coords.push([[
                    [obj.x, obj.y],
                    [obj.x + obj.width, obj.y],
                    [obj.x + obj.width, obj.y + obj.height],
                    [obj.x, obj.y + obj.height],
                    [obj.x, obj.y]
                ]]);
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
            height:0.01
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
            return [ minNode.x, minNode.y ];
        }
    }
};
    
// Load GeoData
(async () => {
    GeoData.setFootpaths(await fetch('./res/footpaths.geojson').then(response => json = response.json()));
})();

map.on('mousemove', (e) => {
    var candidates = GeoData.footpathsQuadtree.retrieve({
        x: e.lngLat["lng"],
        y: e.lngLat['lat'],
        width: 0.01,
        height:0.01
    });

    
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
});