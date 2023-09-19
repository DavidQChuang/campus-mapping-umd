/// Loads a route from a file in an HTML file input
/// using the given parser to parse the file data.
/// This function should be called from an HTML file input:
/// <input type="file" onclick="loadRouteOnclick(this, getPointsFrom___)">
async function loadRouteOnclick(self, parser) {
    console.log(self.attributes.for.value);
    var gpxSelector = $("#" + self.attributes.for.value);
    var files = gpxSelector.prop('files');

    if(files.length > 0) {
        drawRoute(parser(await files[0].text()))
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

/// Loads a route from an array of coords: [[long,lat], ...]
function drawRoute(coords) {
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
}