import React, { useEffect } from "react";
import TileLayer from "ol/layer/Tile";
import OSM from 'ol/source/OSM.js';
import XYZ from 'ol/source/XYZ';
import useMapStore from "../zuStore/mapStore";
import BingMaps from 'ol/source/BingMaps';

export const BaseLayer = ({ source, name }) => {
  const map = useMapStore((state) => state.map);

  useEffect(() => {
    if (!map) return;
    const OSMLayer = new TileLayer({
      visible: true,
      preload: Infinity,
      source: new BingMaps({
        key: 'Al4sDFvgG8_oa8N4ASrRXBZzOsHj52NqCsdMzgEN7xAcWGlI3bVCv3yEWrvTsuOY',
        imagerySet: 'AerialWithLabelsOnDemand',
      }),
    });
    map.addLayer(OSMLayer);

    return () => map.removeLayer(OSMLayer);
  });
  return null;
};
