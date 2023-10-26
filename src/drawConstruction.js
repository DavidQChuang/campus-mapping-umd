const Construction = {
  /**
   * 
   * @param {number} start The starting node id. 
   */
  getConnectedNodes(start) {
    throw new Error("not implemented")
  }
};

map.on('load', async () => {
  var nodes = (await fetchJson('./res/constructions/remote-construction.json')).nodes;
  var coords = nodes.map(id => {
    var node = GeoData.nodes[id];
    return [node.lon, node.lat];
  });

  console.log("Creating polygon: ", coords);
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


  map.addSource('remote-construction-points', {
    "type": "geojson",
    "data": turf.featureCollection(
      [turf.multiPoint(coords), turf.multiPoint(polyCoords, {bbox:true})])
  });
  map.addLayer(Layers['remote-construction-points']);

  var poly = concaveman(polyCoords, 100);
  console.log("Created: ", poly);

  map.addSource('construction-dynamic', {
    "type": "geojson",
    "data": turf.polygon([poly])
  });
  map.addLayer(Layers['construction-dynamic']);

  var constructionPolys = await fetchJson('./res/constructions/construction.min.geojson');
  map.addSource('construction-static', {
    "type": "geojson",
    "data": constructionPolys
  });
  map.addLayer(Layers['construction-static']);
});