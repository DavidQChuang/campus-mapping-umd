mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWRxY2h1YW5nIiwiYSI6ImNsbTl0amx4NzA3Z3Qzc210cG1xZDNnb2gifQ.7_DhtCamWpIi9x7Er1AgCg';

// OpenStreetMap style for the map
var style = {
    name: 'osm',
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: {
        'osm-raster-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
    },
    layers: [
        // OpenStreetMap raster layer for things like benches
        {
            id: 'osm-raster-layer',
            type: 'raster',
            source: 'osm-raster-tiles',
            minzoom: 0,
            maxzoom: 22
        }
    ]
};

style = "mapbox://styles/davidqchuang/clmgm8wne03mt01qifi47c3hp";

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: style, // style URL
    center: [-76.94514,38.98951], // starting position [lng, lat]
    zoom: 14.2, // starting zoom
});

var Geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: true,
    proximity: [-76.94514,38.98951],
    bbox: [
        -76.955982,
        38.9809736,
        -76.9308907,
        39.0001878
        ]
});
map.addControl(Geocoder);


var Draw = new MapboxDraw();
map.addControl(Draw, 'top-left');