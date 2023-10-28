import React, { useEffect } from "react";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import useMapStore from "../zuStore/mapStore";
import {Icon, Style} from 'ol/style.js';
import icon from '../icons/icon.png'
export const Geolocation = ({ source, name }) => {
  const map = useMapStore((state) => state.map);

  useEffect(() => {
    if (!map) return;
    let vector_lyr = null;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
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
  });
  return null;
};
