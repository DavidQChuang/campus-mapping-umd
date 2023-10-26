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
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
            'line-color': '#aae',
            'line-opacity': 0.75,
            'line-width': 3,
            'line-dasharray': [2, 1.3]
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
    // Construction overlay 
    'construction-dynamic': {
        "id": "construction-dynamic",
        "type": "fill",
        "layout": {},
        "source": "construction-dynamic",
        "paint": {
            "fill-color": "hsla(39, 100%, 60%, 0.44)",
            "fill-pattern": "construction-purple"
        }
    },
    // Construction overlay 
    'construction-static': {
        "id": "construction-static",
        "type": "fill",
        "layout": {},
        "source": "construction-static",
        "paint": {
            "fill-color": "hsla(39, 100%, 60%, 0.44)",
            "fill-pattern": "construction"
        }
    },
    // 
    'user-construction-points': {
      "id": "user-construction-points",
      "type": "circle",
      "paint": {
        "circle-color": [
          "case", 
          ['==', ["get", "walkable"], 'false'], "#ff0000",
          '#3bb2d0'
        ]
      },
      "layout": {},
      "source": "user-construction-points",
    },
    'user-construction-bounds': {
      "id": "user-construction-bounds",
      "type": "fill",
      "paint": {
        "fill-color": "hsl(187, 56%, 44%)",
        "fill-opacity": 0.1
      },
      "layout": {},
      "source": "user-construction-bounds"
    },
    'user-construction-fill': {
      "id": "user-construction-fill",
      "type": "line",
      "paint": {
        "line-width": 2,
        "line-color": "#000000",
        "line-opacity": 0.15
      },
      "layout": {},
      "source": "user-construction-bounds"
    },
    'remote-construction-points': {
      "id": "remote-construction-points",
      "type": "circle",
      "paint": {
        "circle-color":[
          "case",
          ["has", "bbox"],  "#aaa",
          "#ff0000"
        ],
        "circle-radius": [
          "case",
          ["has", "bbox"], 3,
          5
        ],
      },
      "layout": {},
      "source": "remote-construction-points",
    }
};

const DrawStyles = [{
    'id': 'gl-draw-polygon-fill-inactive',
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'fill-color': '#3bb2d0',
      'fill-outline-color': '#3bb2d0',
      'fill-opacity': 0.3
    }
  },
  {
    'id': 'gl-draw-polygon-fill-active',
    'type': 'fill',
    'filter': ['all', ['==', 'active', 'true'],
      ['==', '$type', 'Polygon']
    ],
    'paint': {
      'fill-color': '#fbb03b',
      'fill-outline-color': '#fbb03b',
      'fill-opacity': 0.1
    }
  },
  {
    'id': 'gl-draw-polygon-midpoint',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'],
      ['==', 'meta', 'midpoint']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b'
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-inactive',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'false'],
      ['==', '$type', 'Polygon'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#3bb2d0',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'true'],
      ['==', '$type', 'Polygon']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-inactive',
    'type': 'line',
    'filter': ['all', ['==', 'active', 'false'],
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'static']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    "paint": {
      "line-color": "#ffd200",
      "line-width": 3,
      "line-gap-width": 0,
      "line-dasharray": [
        1.1,
        1.3
      ]
    },
    "layout": {
      "line-join": "bevel",
      "line-cap": "round"
    }
  },
  {
    'id': 'gl-draw-line-active',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'],
      ['==', 'active', 'true']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#fbb03b',
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-polygon-and-line-vertex-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b'
    }
  },
  {
    'id': 'gl-draw-point-point-stroke-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': 3.5,
      'circle-opacity': 1,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-point-inactive',
    'type': 'circle',
    'filter': ['all', ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    'paint': {
      'circle-radius': [
        "case", 
            ['has', "user_radius"], ['get', "user_radius"],
        2
      ],
      'circle-color': [
        "case", 
            ['has', "user_color"], ['get', "user_color"],
        '#3bb2d0'
      ]
    }
  },
  {
    'id': 'gl-draw-point-stroke-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'],
      ['==', 'active', 'true'],
      ['!=', 'meta', 'midpoint']
    ],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#fff'
    }
  },
  {
    'id': 'gl-draw-point-active',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point'],
      ['!=', 'meta', 'midpoint'],
      ['==', 'active', 'true']
    ],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b'
    }
  },
  {
    'id': 'gl-draw-polygon-fill-static',
    'type': 'fill',
    'filter': ['all', ['==', 'mode', 'static'],
      ['==', '$type', 'Polygon']
    ],
    'paint': {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': 0.1
    }
  },
  {
    'id': 'gl-draw-polygon-stroke-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'],
      ['==', '$type', 'Polygon']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-line-static',
    'type': 'line',
    'filter': ['all', ['==', 'mode', 'static'],
      ['==', '$type', 'LineString']
    ],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-point-static',
    'type': 'circle',
    'filter': ['all', ['==', 'mode', 'static'],
      ['==', '$type', 'Point']
    ],
    'paint': {
      'circle-radius': 5,
      'circle-color': '#404040'
    }
  }
]