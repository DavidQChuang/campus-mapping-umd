const Layers = {
    setOrAddLayer(layer, geoJsonData) {
      var layerSource = map.getSource(layer);

      if(layerSource == undefined) {
        map.addSource(layer, {
          "type": "geojson",
          "data": geoJsonData
        });
        map.addLayer(Layers[layer]);
      } else {
        layerSource.setData(geoJsonData);
      }
    },
    showLayer(layer) {
      map.setLayoutProperty(layer, 'visibility', 'visible');
    },
    hideLayer(layer) {
      map.setLayoutProperty(layer, 'visibility', 'none');
    },

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
    // Construction overlay 
    '-umdmaps-construction': {
        "id": "-umdmaps-construction",
        "type": "fill",
        "layout": {},
        "source": "-umdmaps-construction",
        "paint": {
            "fill-color": "hsla(39, 100%, 60%, 0.44)",
            "fill-pattern": "construction-orange"
        }
    },
    // 
    'user-construction-points': {
      "id": "user-construction-points",
      "type": "circle",
      "paint": {
        "circle-color": [
          "case", 
          ['==', ["get", "highlight"], true], "#ffff00",
          ['==', ["get", "walkable"], false], "#ff0000",
          '#3bb2d0'
        ],
        "circle-stroke-width": [
          "case", 
          ['==', ["get", "highlight"], true], 2,
          0
        ],
        "circle-stroke-color": "hsl(0, 100%, 55%)"
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
    },
    // "-umdmaps-campus-plant-inventory": {
    //   "id": "-umdmaps-campus-plant-inventory",
    //   "type": "circle",
    //   "paint": {
    //     "circle-color": "hsl(120, 100%, 37%)",
    //     "circle-stroke-color": "hsl(120, 100%, 24%)",
    //     "circle-stroke-width": 1,
    //     "circle-radius": 5
    //   },
    //   "layout": {},
    //   "source": "-umdmaps-campus-plant-inventory",
    // },
    "-umdmaps-campus-plant-inventory": {
      "id": "-umdmaps-campus-plant-inventory",
      "type": "symbol",
      "paint": {
        "text-color": "hsl(135, 0%, 0%)",
        "icon-opacity": [
          "interpolate",
          [
            "linear"
          ],
          [
            "zoom"
          ],
          14,
          0,
          14.6,
          0.8
        ]
      },
      "layout": {
        "icon-image": [
          "case",
          [
            ">",
            ["get", "diameter"],
            0
          ],
          "deciduous",
          [
            "match",
            ["get", "genus"],
            [
              "Malus",
              "Prunus",
              "Magnolia",
              "Koelreuteria"
            ],
            true,
            false
          ],
          "flower-tree",
          ""
        ],
        "icon-allow-overlap": true,
          "icon-size": [
            "interpolate",
            ["exponential", 1.33],
            ["zoom"],
            14,
            0.05,
            18,
            [
              "+",
              [
                "*",
                [
                  "sqrt",
                  [
                    "min",
                    ["get", "diameter"],
                    125
                  ]
                ],
                0.08
              ],
              0.15
            ]
          ]
      },
      "source": "-umdmaps-campus-plant-inventory",
      "minzoom": 14
    },
    "-umdmaps-campus-plant-inventory2": {
      "id": "-umdmaps-campus-plant-inventory2",
      "type": "icon",
      "paint": {
        "circle-color": "hsl(120, 100%, 37%)",
        "circle-stroke-color": "hsl(120, 100%, 24%)",
        "circle-stroke-width": 1,
        "circle-radius": 5
      },
      "layout": {},
      "source": "-umdmaps-campus-plant-inventory",
    },
    "-umdmaps-gardens": {
      "id": "-umdmaps-gardens",
      "minzoom": 0,
      "maxzoom": 22,
      "type": "fill",
      "paint": {
        "fill-color": "hsl(120, 100%, 37%)",
        "fill-outline-color": "hsl(120, 100%, 24%)",
      },
      "layout": {},
      "source": "-umdmaps-gardens"
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

const MapLayers = {
    groups: [
      {
        name: "Unwalkable Areas/Construction",
        layers: [
          {
            name: "Current Major Construction (UMD)",
            id: "-umdmaps-construction",
            src: "https://services9.arcgis.com/1rOwFRpAwrxe0rBl/ArcGIS/rest/services/CampusReference/FeatureServer/4/query?where=1%3D1&outFields=*&f=geojson",
            visible: true,
            img: {
              src: "res/construction-orange.svg",
              width: 72
            },
            callbacks: {
              "click": (e) => {
                console.log(props)
                var props = e.features[0].properties;
                new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(`
                  <div style='line-height:0.8rem'><b>${props.PROJECT_NAME}</b><br></div>
                  <b>Project Manager: ${props.PROJECT_MANAGER ?? "n/a"}</b><br>
                  <hr>
                  Construction Start: ${props.CONST_START}</b><br>
                  Substantial Completion: ${props.SUBST_COMPLETION}</b><br>
                  ${props.ACTIVE == undefined ? '': `Active: ${props.ACTIVE}<br>`}
                  <div style='line-height:0.8rem'>Department: ${props.DEPTANDTYPE}</div>
                  <br>
                  <i>Updated ${new Date(props.last_edited_date).toDateString()} by ${props.last_edited_user}</i>`)
                  .addTo(map);
              },
              'mouseenter': () => {
                map.getCanvas().style.cursor = 'pointer';
              },
              'mouseleave': () => {
                map.getCanvas().style.cursor = '';
              }
            }
          },
          {
            name: "Verified Construction Blockages",
            id: "construction-static",
            src: "./res/constructions/construction.min.geojson",
            visible: true,
            img: {
              src: "res/construction.svg",
              width: 72
            }
          },
          {
            name: "User-reported Blockages",
            id: "remote-construction-points",
            visible: true,
            src: undefined,
            img: {
              src: "res/construction-purple.svg",
              width: 72
            }
          }
        ]
      },
      {
        name: "Arboretum and Botanical Garden",
        layers: [
          {
            name: "Campus Plant Inventory (UMD)",
            id: "-umdmaps-campus-plant-inventory",
            src: "https://services9.arcgis.com/1rOwFRpAwrxe0rBl/ArcGIS/rest/services/CampusPlantInventory/FeatureServer/0/query?where=1%3D1&outFields=genus,species,cname1,cname2,diameter&f=geojson",
            visible: false,
            symbol: "nature",
            icon: { style: "background-color: #069800aa" },
            callbacks: {
              "click": (e) => {
                var props = e.features[0].properties;

                new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(`
                  <i>${props.genus} ${props.species}</i>
                  <br>${props.cname2} ${props.cname1}
                  <br>Diameter: ${props.diameter}in`)
                  .addTo(map);
              },
              "touchend": (e) => {
                var props = e.features[0].properties;

                new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(`
                  <i>${props.genus} ${props.species}</i>
                  <br>${props.cname2} ${props.cname1}
                  <br>Diameter: ${props.diameter}in`)
                  .addTo(map);
              },
              'mouseenter': () => {
                map.getCanvas().style.cursor = 'pointer';
              },
              'mouseleave': () => {
                map.getCanvas().style.cursor = '';
              }
            }
          },
          {
            name: "Gardens (UMD)",
            id: "-umdmaps-gardens",
            src: "https://services9.arcgis.com/1rOwFRpAwrxe0rBl/ArcGIS/rest/services/CampusGardens/FeatureServer/1/query?where=1%3D1&outFields=*&f=geojson",
            visible: false,
            symbol: "local_florist",
            icon: { style: "background-color: #839800aa" }
          }
        ]
      }
    ],
    layers: {}
};

for (var group of MapLayers.groups) {
  for (var layer of group.layers) {
    MapLayers.layers[layer.id] = layer;
  }
}
