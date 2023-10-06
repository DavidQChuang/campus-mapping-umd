var style = "mapbox://styles/davidqchuang/clmgm8wne03mt01qifi47c3hp";

mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWRxY2h1YW5nIiwiYSI6ImNsbTl0amx4NzA3Z3Qzc210cG1xZDNnb2gifQ.7_DhtCamWpIi9x7Er1AgCg';

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: style, // style URL
    center: [-76.94514,38.98951], // starting position [lng, lat]
    zoom: 14.2, // starting zoom
});

const Geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: true,
    proximity: [-76.94514,38.98951],
    bbox: [
        -76.955982,
        38.9809736,
        -76.9308907,
        39.0001878
    ],

});

// var modes = MapboxDraw.modes;
// modes.static = StaticMode;
var Draw = new MapboxDraw({
    // modes: modes,
    // styles: DrawStyles
});
const nav = new mapboxgl.NavigationControl({ visualizePitch: true });
    
// OpenStreetMap style for the map
map.addControl(Geocoder);
map.addControl(Draw, 'top-left');
map.addControl(nav, 'top-right');

map.on('load', (e) => {
//   Draw.changeMode('static');
});

//https://docs.mapbox.com/mapbox-gl-js/example/mouse-position/
map.on('mousemove', (e) => {
    document.getElementById('info').innerHTML =
    // `e.point` is the x, y coordinates of the `mousemove` event
    // relative to the top-left corner of the map.
    '[long, lat]:<br/>' +
    // `e.lngLat` is the longitude, latitude geographical position of the event.
    '[' + e.lngLat["lng"] + ', ' + e.lngLat["lat"] + "]";
});