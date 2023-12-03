import React, { useEffect, useState } from "react";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import useMapStore from "../zuStore/mapStore";
import {Icon, Style} from 'ol/style.js';
import icon from '../icons/icon.png';
import axios from 'axios';

export const Geolocation = ({ source, name }) => {
  const map = useMapStore((state) => state.map);
  const [geofence, setGeofence] = useState('not allowed');
  let coords = [];

  useEffect(() => {
    if (!map) return;
    let vector_lyr = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            coords = position.coords;
            axios.post(`http://localhost:5000/checkIntersection`, {
              longitude: longitude,
              latitude: latitude
            })
            .then(res => {
              if (res.data.length > 0) {
                setGeofence('allowed');
              }
            })
            // axios.get(`https://ipinfo.io/194.61.40.46`)
            // .then(res => {
            //   console.log(res);
            // })
            const iconFeature = new Feature({
                geometry: new Point([longitude, latitude]),
                name: 'Null Island',
            });
            const vectorSource = new VectorSource({
                features: [iconFeature],
            });
            const iconStyle = new Style({
              image: new Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                src: icon,
              }),
            });
            vector_lyr = new VectorLayer({
                source: vectorSource,
                style: iconStyle
            })
            map.addLayer(vector_lyr);
            map.getView().fit(vector_lyr.getSource().getExtent(), {
            padding: [100,100,100,100],
            maxZoom: 15
            });
            
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      }
      else {
        console.error('Geolocation is not supported by this browser.');
      }
    return () => map.removeLayer(vector_lyr);
  }, [coords]);
  return (
    <p
        style={{
          backgroundColor: geofence === "allowed" ? "green" : "red",
          padding: "10px",
          borderRadius: "5px",
          color: "white",
          position: "absolute",
          top: "148px",
          right: "20px",
          zIndex: "1"
        }}>
        You're {geofence} to Use this application
    </p>
  )
};
