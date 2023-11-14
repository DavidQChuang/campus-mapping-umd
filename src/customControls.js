class NavigationControl {
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group control-panel";
        div.innerHTML = `
        <div class="display-info" id="query-construction-container" nodisplay style="
            padding: 15px;
            padding-top:20px;
            padding-bottom:5px;
        ">
            <span style="
                position: absolute;
                right: 2px;
                top: 2px;
            ">
                <a class="close-button" id="construction-close-button">
                    <span class="material-symbols-rounded">close</span>
                </a>
            </span>
            <p style="margin:0;text-align: center;">
            <b><span>Is this route blocked off?</span></b>
            </p>
            <table style="width: 100%; text-align: left;">
                <tbody>
                <tr>
                    <td style="
                        text-align: right;
                    ">
                        <button class="go-button">
                            <span id="loading-go">Yes</span>
                            <div nodisplay="" id="loading-spin" class="loading-spin"><div></div><div></div><div></div></div>
                        </button>
                    </td>
                    <td>
                        <button class="go-button">
                            <span id="loading-go">No</span>
                            <div nodisplay="" id="loading-spin" class="loading-spin"><div></div><div></div><div></div></div>
                        </button>
                    </td>
                </tr>
                <tr>
                    <td style="
                        text-align: right;
                        padding-top: 5px;
                    ">
                        <button class="go-button" style="
                            width: 100%;
                        ">
                            <span id="loading-go">Confirm</span>
                            <div nodisplay="" id="loading-spin" class="loading-spin"><div></div><div></div><div></div></div>
                        </button>
                    </td>
                    <td style="
                        padding-top: 5px;
                    ">
                        <button class="go-button" style="
                            width: 100%;
                        ">
                            <span id="loading-go">Cancel</span>
                            <div nodisplay="" id="loading-spin" class="loading-spin"><div></div><div></div><div></div></div>
                        </button>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="display-info" id="navigation-panel">
            <table style="width: 100%; text-align: left;user-select:none">
                <tbody id="map-waypoint-list">
                    <tr class="map-waypoint">
                        <td>
                            <span class="material-symbols-rounded map-waypoint-list-icon" style="vertical-align: top;">person_pin_circle</span>
                        </td>
                        <td>
                            <div class="input-part">
                                <input type="text" placeholder="Search or select" onclick="UI.geocode(this, this.parentNode.parentNode.children[1])">
                                <div class="action-button input-part-icon" onclick="setWaypointAtUserLocation(0)">
                                    <span class="material-symbols-rounded map-waypoint-list-icon-small">my_location</span>
                                </div>
                                <div class="action-button input-part-icon" onclick="SetWaypointOnClick.on(this, 0)">
                                    <span class="material-symbols-rounded map-waypoint-list-icon-small">pin_drop</span>
                                </div>
                            </div>
                            <div class="display-info geocoder-list-container" hidden>
                                <div class="geocoder-list">
                                    <div>
                                        asdf
                                    </div>
                                    <div>
                                        asdf
                                    </div>
                                    <div>
                                        asdf
                                    </div>
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
                            <span class="material-symbols-rounded p12-icon" alt="walk distance">directions_walk</span><span id="path-distance">.. mi</span>
                            &nbsp;
                            <span class="material-symbols-rounded p12-icon" alt="walk time">schedule</span>
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
                <input type="checkbox" id="path-grass-checkbox">
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
        div.style = "height: auto";
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
        "
            onclick="queryConstructionAtUserLocation()">
            <span class="material-symbols-rounded">fmd_bad</span> <span>Report blocked path</span>
        </button>`;
        return div;
    }
}

class LayersButton {
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group ";
        div.innerHTML = `<button class="long-button">
        <span class="material-symbols-rounded">map</span><span class="material-symbols-rounded">arrow_right</span>
        </button>`;
/*<button class="long-button" style="
    display: flex;
    align-items: center;
    padding-left: 2px;
">
        <div style="
    width: 24px;
    height: 24px;
    display: inline-block;
    overflow: hidden;
"><img src="res/construction-light.svg" width="72" style="
    background-color: #414b58;
"></div><span class="material-symbols-rounded">arrow_right</span>
        </button>*/
        // div.addEventListener("contextmenu", (e) => e.preventDefault());
        div.addEventListener("click", () => {
            var controls = document.getElementById("layers-panel");
            if(controls.getAttribute('unhidden') == 'true') {
                controls.setAttribute('unhidden', 'false');
            }else{
                controls.setAttribute('unhidden', 'true');
            }
        });

        return div;
    }
}

class LayersPanel {
    getLayerGroupElement(group) {
        var container = document.createElement('span');
        container.className = "layer-dropdown";
        container.style = "padding:0";

        var layers = "";
        for(var layer of Object.values(group.layers)) {
            console.log(layer);
            var icon;
            if(layer.img != undefined) {
                icon = `<img class="layer-swatch-icon" src='${layer.img.src}' width='${layer.img.width}' style="${layer.icon?.style}">`;
            } else if (layer.symbol != undefined) {
                icon = `<span class="material-symbols-rounded layer-swatch-icon" style="${layer.icon?.style}">${layer.symbol}</span>`;
            } else {
                icon = `<span class="material-symbols-rounded layer-swatch-icon" style="${layer.icon?.style}">public</span>`;
            }

            layers += `
                <span class="layer-text-item branch-item">
                    <div class="layer-swatch" onclick="UI.toggleLayer('${layer.id}', this)" 
                        ${layer.visible == true ? "checked" : "" }>
                        <span class="material-symbols-rounded visibility-icon"></span>
                        ${icon}
                    </div>
                    <b>${layer.name}</b>
                </span>`;
        }

        container.innerHTML = `
            <div class="layer-text-item layer-dropdown-text" onclick="this.parentElement.children[1].toggleAttribute('hidden');this.children[0].children[0].toggleAttribute('expanded')">
                <div class="layer-swatch">
                    <span class="material-symbols-rounded layer-dropdown-icon">expand_more</span>
                </div>
                <b>${group.name}</b>
            </div>
            <div class="layer-item-list" hidden>
                ${layers}
            </div>`;
        return container;
    }
    onAdd(map) {
        const div = document.createElement("div");
        div.className = "mapboxgl-ctrl mapboxgl-ctrl-group controls controls-left";
        div.id = "layers-panel";
        div.style = `
            height: auto;
            top: 10%;
            width: 260px;
            background: white;
        `;
        div.innerHTML = `
            <span>
                <b>Layers</b>
                <a style="
                    font-weight: 900;
                    color: red;
                    top: 5px;
                    float: right;
                    cursor:pointer;"
                    onclick="document.getElementById('layers-panel').setAttribute('unhidden','false')">
                    <span class="material-symbols-rounded" style="
                        line-height: 16px;
                        vertical-align: text-bottom;
                    ">close</span>
                </a>
            </span>
            `;
        for(var group of MapLayers.groups) {
            div.appendChild(this.getLayerGroupElement(group));
        }
        return div;
    }
}

const homeButton = new HomeButton();
const settingsButton = new SettingsButton();
const navControl = new NavigationControl();
const loadingPanel = new LoadingPanel();
const routeControl = new RouteControl();
const constructionButton = new ConstructionButton();
const layersButton = new LayersButton();
const layersPanel = new LayersPanel();

// OpenStreetMap style for the map
// map.addControl(Geocoder);
map.addControl(Draw, 'top-left');

map.addControl(layersButton, 'bottom-left');
map.addControl(layersPanel, 'bottom-left');

map.addControl(navControl, 'top-right');
map.addControl(loadingPanel, 'top-right');
map.addControl(routeControl, 'top-right');
map.addControl(nav, 'top-right');
map.addControl(homeButton, "top-right");

map.addControl(settingsButton, "bottom-right");
map.addControl(constructionButton, "bottom-right");