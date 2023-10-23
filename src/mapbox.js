var style = "mapbox://styles/davidqchuang/clmgm8wne03mt01qifi47c3hp";

mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWRxY2h1YW5nIiwiYSI6ImNsbTl0amx4NzA3Z3Qzc210cG1xZDNnb2gifQ.7_DhtCamWpIi9x7Er1AgCg';

/**
 * Contains the default center of the map and default zoom level. Example:
 * ```js
 * {
 *   center: [-76.94514,38.98951],
 *   zoom: 14.2
 * }
 * ```
 * @typedef {{
 *  center: number[],
 *  zoom: number
 * }} MapOrigin
 */
/**
 * The origin of the map.
 * Contains the default center of the map and default zoom level.
 * ```js
 * {
 *   center: [-76.94514,38.98951],
 *   zoom: 14.2
 * }
 * ```
 * @type {MapOrigin}
 */
const mapOrigin = {
    center: [-76.94514,38.98951],
    zoom: 14.2
};

/**
 * The mapboxgl.Map object, contains Mapbox GL functions.
 */
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: style, // style URL
    center: mapOrigin.center, // starting position [lng, lat]
    zoom: mapOrigin.zoom, // starting zoom
    hash: true
});

/**
 * An instance of the Mapbox Geocoder Control plugin.
 * Provides search features.
 */
const Geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: true,
    proximity: mapOrigin.center,
    bbox: [
        -76.955982,
        38.9809736,
        -76.9308907,
        39.0001878
    ],

});

// var modes = MapboxDraw.modes;
// modes.static = StaticMode;

/**
 * An instance of the Mapbox Draw plugin.
 * Provides map drawing features.
 */
const Draw = new MapboxDraw({
    // modes: modes,
    userProperties: true,
    styles: DrawStyles
});
const nav = new mapboxgl.NavigationControl({ visualizePitch: true });

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

fetch("https://api.github.com/repos/DavidQChuang/campus-mapping-umd/commits/HEAD?per_page=1")
  .then((response) => response.json())
  .then((json) => {
    var commit = json.commit;
    document.getElementById("github-commit-msg").innerHTML = `[<a href='${json.html_url}'>` + json.sha.substring(0, 7) + "<a/>] " + commit.author.name + ": " + commit.message;
  });