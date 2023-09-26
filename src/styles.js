const Layers = {
    // User waypoint visualization
    'user-waypoints': {
        'id': 'user-waypoints',
        'type': 'circle',
        'source': 'user-waypoints',
        'paint': {
            'circle-color': '#294680',
            'circle-radius': 8
        }
    },
    'user-waypoints-text': {
        'id': 'user-waypoints-text',
        'type': 'symbol',
        'source': 'user-waypoints',
        "layout": {
            'text-field': ['get', 'text'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        'paint': {
            'text-color': '#fff'
        }
    },
    'user-waypoints-path': {
        'id': 'user-waypoints-path',
        'type': 'line',
        'source': 'user-waypoints-path',
        'paint': {
            'line-color': '#aae',
            'line-opacity': 0.75,
            'line-width': 3,
            'line-dasharray': [3, 1]
        }
    },
    // Pathfinding endpoint visualization
    'path-endpoints': {
        'id': 'path-endpoints',
        'type': 'circle',
        'source': 'path-endpoints',
        'paint': {
            'circle-color': '#ff4680',
            'circle-radius': 8
        }
    },
    'path-endpoints-text': {
        'id': 'path-endpoints-text',
        'type': 'symbol',
        'source': 'path-endpoints',
        "layout": {
            'text-field': ['get', 'text'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        'paint': {
            'text-color': '#fff'
        }
    },
};

const DrawStyles = [
    {
        'id': 'gl-draw-polygon-fill-inactive',
        'type': 'fill',
        'filter': ['all', ['==', 'active', 'false'],
        ['==', '$type', 'Polygon'],
        ['!=', 'mode', 'static']
        ],
        'paint': {
        'fill-color': [
            "case", 
            ['==', ['get', "user_class_id"], 1], "#00ff00", 
            ['==', ['get', "user_class_id"], 2], "#0000ff",
            '#ff0000'
        ],
        'fill-outline-color': '#3bb2d0',
        'fill-opacity': 0.5
        }
    }
]