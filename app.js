// var gpxSelector = $("#gpx-selector");
// var gpxLoadBtn = $("#gpx-load-btn");
var reader = new FileReader();

async function loadRoute(self, parser) {
    console.log(self.attributes.for.value);
    var gpxSelector = $("#" + self.attributes.for.value);
    var files = gpxSelector.prop('files');

    if(files.length > 0) {
        var coords = parser(await files[0].text());
        var feature = {
            id: 'gpx-route',
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coords
            }
        };

        Draw.add(feature);
    } else {
        console.log("No files");
    }
}

function getPointsFromGPX(text) {
    var gpx = new gpxParser(); //Create gpxParser Object
    gpx.parse(text);
    console.log(gpx);

    return gpx.tracks[0].points.map(
        item => [item.lon, item.lat]);
}

function getPointsFromJSON(text) {
    var points = JSON.parse(text);
    console.log(points);

    return points;
}