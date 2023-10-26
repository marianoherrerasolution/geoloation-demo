import './App.css';
import React, { useState, useEffect } from 'react';
import GeoJSON from 'ol/format/GeoJSON'

import MapWrapper from './components/MapWrapper'

function App() {
  // set intial state
  const [userLocation, setUserLocation] = useState(null);
  const [ features, setFeatures ] = useState([])

    // define the function that finds the users geolocation
    
    // useEffect( () => {
    //   getUserLocation()
    // })
  // initialization - retrieve GeoJSON features from Mock JSON API get features from mock 
  //  GeoJson API (read from flat .json file in public directory)
  // useEffect( () => {
  //   fetch('/mock-geojson-api.json')
  //     .then(response => response.json())
  //     .then( (fetchedFeatures) => {

  //       // parse fetched geojson into OpenLayers features
  //       //  use options to convert feature from EPSG:4326 to EPSG:3857
  //       const wktOptions = {
  //         dataProjection: 'EPSG:4326',
  //         featureProjection: 'EPSG:3857'
  //       }
  //       const parsedFeatures = new GeoJSON().readFeatures(fetchedFeatures, wktOptions)

  //       // set features into state (which will be passed into OpenLayers
  //       //  map component as props)
  //       setFeatures(parsedFeatures)

  //     })
      
  // },[])
  
  return (
    <div className="App">
      
      <div className="app-label">
        <p>Geolocation</p>
        {/* <p>Click the map to reveal location coordinate via React State</p> */}
      </div>
      
      <MapWrapper features={features} />
      {/* create a button that is mapped to the function which retrieves the users location */}
      {/* <button onClick={getUserLocation}>Get User Location</button> */}
      {/* if the user location variable has a value, print the users location */}
      {userLocation && (
        <div>
          <h2>User Location</h2>
          <p>Latitude: {userLocation.latitude}</p>
          <p>Longitude: {userLocation.longitude}</p>
        </div>
      )}
    </div>
  )
}

export default App