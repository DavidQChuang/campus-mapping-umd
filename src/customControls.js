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

class RouteViewer {
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
// map.addControl(routeViewer, 'top-right');
map.addControl(nav, 'top-right');
map.addControl(homeButton, "top-right");
