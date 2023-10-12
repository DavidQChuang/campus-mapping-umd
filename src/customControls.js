class RouteViewer {
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
        div.innerHTML = `
        <div class="display-info">
            <table style="width: 100%; text-align: left;">
                <tbody>
                    <tr>
                        <td>
                            <span class="material-symbols-rounded" style="vertical-align: top;">person_pin_circle</span>
                        </td>
                        <td><input type="text"></td>
                    </tr>
                    <tr>
                        <td>
                            <span class="material-symbols-rounded" style="vertical-align: top;">location_on</span>
                        </td>
                        <td><input type="text"></td>
                    </tr>
                </tbody>
            </table>
            <table style="width: 100%; text-align: left;">
                <tr>
                    <td>
                        <p style="margin:0; font-size:12px"><b>
                            <span class="material-symbols-rounded p12-icon">directions_walk</span>
                            <span id="path-distance">.. mi</span>
                            <span class="material-symbols-rounded p12-icon">schedule</span>
                            <span id="path-time">.. min</span></b>
                        </p>
                    </td>
                    <td style="text-align:right">
                        <button class="go-button" onclick="drawWaypointRoute(Algorithms.Astar)">Go</button>
                    </td>
                </tr>
            </table>
            <label>
                <span class="tooltip">Allow entering buildings
                    <span class="tooltiptext">Allows pathing through buildings</span>
                </span>
                <input type="checkbox" id="path-buildings-checkbox" checked>
            </label>
            <br/>
            <label>
                <span class="tooltip">Allow crossing grass
                    <span class="tooltiptext">Allows pathing across fields</span>
                </span>
                <input type="checkbox" id="path-fields-checkbox" checked>
            </label>
        </div>
        `;
        div.id = "route-viewer";
        return div;
    }
}

class HomeButton {
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
        div.innerHTML = `<button>
        <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" style="font-size: 20px;"><title>Reset map</title><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>
        </button>`;
        div.addEventListener("contextmenu", (e) => e.preventDefault());
        div.addEventListener("click", () => map.flyTo({...mapOrigin, duration:1000, essential:true}));

        return div;
    }
}

const homeButton = new HomeButton();
const routeViewer = new RouteViewer();

// OpenStreetMap style for the map
map.addControl(Geocoder);
map.addControl(Draw, 'top-left');
map.addControl(routeViewer, 'top-right');
map.addControl(nav, 'top-right');
map.addControl(homeButton, "top-right");
