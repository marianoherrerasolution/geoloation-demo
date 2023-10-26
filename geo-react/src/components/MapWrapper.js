// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform} from 'ol/proj'
import {toStringXY} from 'ol/coordinate';

function MapWrapper(props) {

  // set intial state
  const [ map, setMap ] = useState()
  const [ featuresLayer, setFeaturesLayer ] = useState()
  const [ selectedCoord , setSelectedCoord ] = useState()
  let InitializeMap = null;
  // pull refs
  const mapElement = useRef()
  
  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map
  const getUserLocation = () => {
    // if geolocation is supported by the users browser
    if (navigator.geolocation) {
      // get the current users location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // save the geolocation coordinates in two variables
          const { latitude, longitude } = position.coords;
          // update the value of userlocation variable
          console.log(latitude);
          console.log(longitude);
            const iconFeature = new Feature({
                geometry: new Point([longitude, latitude]),
                name: 'Null Island',
                population: 4000,
                rainfall: 500,
            });
          
        
            const vectorSource = new VectorSource({
                features: [iconFeature],
            });
            
            const vectorLayer = new VectorLayer({
                source: vectorSource,
            })
            // InitializeMap.addLayer(vectorLayer);
            setMap(InitializeMap.addLayer(vectorLayer));
            mapElement.current = InitializeMap;   
            // console.log(InitializeMap.getView());
            InitializeMap.getView().fit(vectorLayer.getSource().getExtent(), {
                padding: [100,100,100,100]
            });
        },
        // if there was an error getting the users location
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
    // if geolocation is not supported by the users browser
    else {
      console.error('Geolocation is not supported by this browser.');
    }
  };
  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    getUserLocation();
    
    InitializeMap = new Map({
        layers: [
            new TileLayer({
                source: new XYZ({
                    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
                })
            }),
            new TileLayer({
                source: new XYZ({
                    url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
                })
            }), 
        ],
        view: new View({
            projection: 'EPSG:4326',
            center: [0, 0],
            zoom: 0,
            minZoom: 0,
            maxZoom: 28,
        }),
        controls: [],
    })

    InitializeMap.setTarget(mapElement.current || "")
    setMap(InitializeMap)
    InitializeMap.on('click', handleMapClick)
    return () => InitializeMap.setTarget("")
}, [])

  //   useEffect( () => {

//     // create and add vector source layer
//     const initalFeaturesLayer = new VectorLayer({
//       source: new VectorSource()
//     })

//     // create map
//     const initialMap = new Map({
//       target: mapElement.current,
//       layers: [
        
//         // USGS Topo
//         new TileLayer({
//           source: new XYZ({
//             url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
//           })
//         }),

//         // Google Maps Terrain
//         /* new TileLayer({
//           source: new XYZ({
//             url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
//           })
//         }), */

//         initalFeaturesLayer
        
//       ],
//       view: new View({
//         projection: 'EPSG:3857',
//         center: [0, 0],
//         zoom: 2
//       }),
//       controls: []
//     })

//     // set map onclick handler
//     initialMap.on('click', handleMapClick)

//     // save map and vector layer references to state
//     setMap(initialMap)
//     setFeaturesLayer(initalFeaturesLayer)
//     return () => initialMap.setTarget("")
//   },[])

  // update map if features prop changes - logic formerly put into componentDidUpdate
//   useEffect( () => {

//     if (props.features.length) { // may be null on first render

//       // set features to map
//       featuresLayer.setSource(
//         new VectorSource({
//           features: props.features // make sure features is an array
//         })
//       )

//       // fit map to feature extent (with 100px of padding)
//       map.getView().fit(featuresLayer.getSource().getExtent(), {
//         padding: [100,100,100,100]
//       })

//     }

//   },[props.features])

  // map click handler
//   getUserLocation()
  const handleMapClick = (event) => {
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')
    // set React state
    setSelectedCoord( transormedCoord )
  }

  // render component
  return (      
    <div>
      <div ref={mapElement} className="map-container" ></div>
      <div className="clicked-coord-label">
        <p>{ (selectedCoord) ? toStringXY(selectedCoord, 5) : '' }</p>
      </div>
    </div>
  ) 
}

export default MapWrapper