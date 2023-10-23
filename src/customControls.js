class NavigationControl {
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group control-panel";
        div.innerHTML = `
        <div class="display-info">
            <table style="width: 100%; text-align: left;user-select:none">
                <tbody id="map-waypoint-list">
                    <tr class="map-waypoint">
                        <td>
                            <span class="material-symbols-rounded map-waypoint-list-icon" style="vertical-align: top;">person_pin_circle</span>
                        </td>
                        <td>
                            <div class="input-part">
                                <input type="text" placeholder="Search or select">
                                <div class="action-button input-part-icon" onclick="setWaypointAtUserLocation(0)">
                                    <span class="material-symbols-rounded map-waypoint-list-icon-small">my_location</span>
                                </div>
                                <div class="action-button input-part-icon" onclick="SetWaypointOnClick.on(this, 0)">
                                    <span class="material-symbols-rounded map-waypoint-list-icon-small">pin_drop</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr id="map-waypoint-dest" class="map-waypoint map-waypoint-dest">
                        <td>
                            <span class="material-symbols-rounded map-waypoint-list-icon" style="vertical-align: top;">location_on</span>
                        </td>
                        <td>
                            <div class="input-part">
                                <input type="text" placeholder="Search or select">
                                <div class="action-button input-part-icon" onclick="SetWaypointOnClick.on(this, 1)">
                                    <span class="material-symbols-rounded map-waypoint-list-icon-small ">pin_drop</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table style="width: 100%; text-align: left;">
                <tr>
                    <td>
                        <p style="margin:0;"><b>
                            <span class="material-symbols-rounded p12-icon">directions_walk</span><span id="path-distance">.. mi</span>
                            &nbsp;
                            <span class="material-symbols-rounded p12-icon">schedule</span>
                            <span id="path-time">.. min</span></b>
                        </p>
                    </td>
                    <td style="text-align:right">
                        <button class="go-button" onclick="drawWaypointRoute(Algorithms.Astar)">
                            <span id="loading-go">Go</span>
                            <div nodisplay id="loading-spin" class="loading-spin"><div></div><div></div><div></div></div>
                        </button>
                    </td>
                </tr>
            </table>
            <label>
                <span class="tooltip">Allow entering buildings
                    <span class="tooltiptext">This enables pathing through buildings. Routes will go between building entrances, but hallways are not included in the map.</span>
                </span>
                <input type="checkbox" id="path-buildings-checkbox" checked>
            </label>
            <br/>
            <label>
                <span class="tooltip">Allow crossing grass
                    <span class="tooltiptext">This enables taking routes across fields, which may involve stepping over grass or mulch.</span>
                </span>
                <input type="checkbox" id="path-fields-checkbox" checked>
            </label>
        </div>
        `;
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
        // div.addEventListener("contextmenu", (e) => e.preventDefault());
        div.addEventListener("click", () => map.flyTo({...mapOrigin, duration:1000, essential:true}));

        return div;
    }
}

class SettingsButton {
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group ";
        div.innerHTML = `<button class="long-button">
        <span class="material-symbols-rounded">arrow_left</span><span class="material-symbols-rounded">bug_report</span>
        </button>`;

        // div.addEventListener("contextmenu", (e) => e.preventDefault());
        div.addEventListener("click", () => {
            var controls = document.getElementById("debug-controls");
            if(controls.getAttribute('unhidden') == 'true') {
                controls.setAttribute('unhidden', 'false');
            }else{
                controls.setAttribute('unhidden', 'true');
            }
        });

        return div;
    }
}

class LoadingPanel {
    onAdd(map) {
        const div = document.createElement("div");
        div.id = "loading-panel";
        div.className = "mapboxgl-ctrl display-info popout-bottom";
        div.setAttribute('hidden', '');
        div.style = "height: 1em";
        div.innerHTML = `
        <div class="loading-spin"><div></div><div></div><div></div></div>
        &nbsp;<span id="loading-text">Loading stuff</span>`;
        return div;
    }
}

class RouteControl {
    onAdd(map) {
        const div = document.createElement("ul");
        div.id = "route-viewer";
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group control-panel";
        div.setAttribute('hidden', '');
        div.innerHTML = `
        <button class="route-icon long-button"
            onclick="document.getElementById('route-viewer').removeAttribute('hidden')">
            <span class="material-symbols-rounded">arrow_left</span><span class="material-symbols-rounded">route</span>
        </button>
        <a style="
            font-weight: 900;
            color: red;
            top: 5px;
            cursor:pointer;"
           onclick="document.getElementById('route-viewer').setAttribute('hidden','')">
            <span class="material-symbols-rounded">arrow_right</span> Close
        </a>
        <li>(not working, in progress)</li>
        <li>-xx.xxxxx, xx.xxxxx, near Somewhere Drive</li>
        <li>Go forward 300 feet</li>
        <li>Turn right near Someplace St</li>
        <li>Enter building Microbiology Building (MCB) from the east side, entrance 7</li>
        <li>Exit building Microbiology Building (MCB) from the east side, entrance 1</li>
        <li>Exit building Microbiology Building (MCB) from the east side, entrance 1</li>
        `;
        return div;
    }
}

class ConstructionButton {
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group construction-button";
        div.innerHTML = `
        <button class="long-button" style="
            display: flex;
            align-items: center;
            padding-right: 5px;
        ">
            <span class="material-symbols-rounded">fmd_bad</span> <span>Report blocked path</span>
        </button>`;

        // div.addEventListener("contextmenu", (e) => e.preventDefault());
        div.addEventListener("click", () => {
            var controls = document.getElementById("debug-controls");
            if(controls.getAttribute('unhidden') == 'true') {
                controls.setAttribute('unhidden', 'false');
            }else{
                controls.setAttribute('unhidden', 'true');
            }
        });

        return div;
    }
}

const homeButton = new HomeButton();
const settingsButton = new SettingsButton();
const navControl = new NavigationControl();
const loadingPanel = new LoadingPanel();
const routeControl = new RouteControl();
const constructionButton = new ConstructionButton();

// OpenStreetMap style for the map
// map.addControl(Geocoder);
map.addControl(Draw, 'top-left');
map.addControl(navControl, 'top-right');
map.addControl(loadingPanel, 'top-right');
map.addControl(routeControl, 'top-right');
map.addControl(nav, 'top-right');
map.addControl(homeButton, "top-right");

map.addControl(settingsButton, "bottom-right");
map.addControl(constructionButton, "bottom-right");