map.on('load', async () => {
  map.addSource('construction-dynamic', {
    "type": "geojson",
    "data": await fetchJson('./res/constructions/construction.min.geojson')
  });
  map.addLayer(Layers['construction-dynamic']);
});