const Construction = {
  /**
   * 
   * @param {number} start The starting node id. 
   */
  getConnectedNodes(start) {
    throw new Error("not implemented")
  },
  drawPolygon(nodes) {
    var coords = nodes.map(id => {
      var node = GeoData.nodes[id];
      GeoData.untraversableNodes.add(id);
      return [node.lon, node.lat];
    });
    // console.log("Creating polygon: ", coords);
    const bboxSize = [ 0.00001, 0.000008 ];
    var polyCoords = coords.reduce((acc, coord) => {
      // var theta = Math.random() * Math.PI;
      var theta = 0;
      var rotate = (point, offset) => {
        // var offset = [point[0] - coord[0], point[1] - coord[1]];
        return [
          (offset[0]*Math.cos(theta) - offset[1]*Math.sin(theta))*bboxSize[0] + coord[0],
          (offset[0]*Math.sin(theta) + offset[1]*Math.cos(theta))*bboxSize[1] + coord[1]
        ];
      };
      acc.push(rotate(coord, [+1, +1]));
      acc.push(rotate(coord, [-1, +1]));
      acc.push(rotate(coord, [+1, -1]));
      acc.push(rotate(coord, [-1, -1]));
      return acc;
    }, []);
  
  
    Layers.setOrAddLayer('remote-construction-points',
      turf.featureCollection(
        [turf.multiPoint(coords), turf.multiPoint(polyCoords, {bbox:true})]
      ));
  
    var poly = concaveman(polyCoords, 100);
    // console.log("Created: ", poly);
  
    Layers.setOrAddLayer('construction-dynamic', turf.polygon([poly]));
  }
};

map.on('load', async () => {
  var nodes = (await fetchJson('./res/constructions/remote-construction.json')).nodes;
  Construction.drawPolygon(nodes);

  var constructionPolys = await fetchJson('./res/constructions/construction.min.geojson');
  Layers.setOrAddLayer('construction-static', constructionPolys);

  GeoData.onload(() => {
    GeoData.addConstruction(constructionPolys);
  });

  var umdConstruction = await fetchJson('https://maps.umd.edu/arcgis/rest/services/Layers/CampusReference/MapServer/4/query?where=1%3D1&outFields=*&f=geojson')
  Layers.setOrAddLayer('-umdmaps-construction', umdConstruction);
});