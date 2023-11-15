import "./Map.css";
import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import "../../../../node_modules/ol/ol.css";
import useMapStore from "../../zuStore/mapStore";
import {Attribution, defaults as defaultControls} from 'ol/control.js';


export const ReMap = ({ children, zoom, center }) => {
  const map = useMapStore((state) => state.map);
  const setMap = useMapStore((state) => state.populateMap);
  const destroyMap = useMapStore((state) => state.removeMap);
  const mapId = useRef();

  useEffect(() => {
    const attribution = new Attribution({
      collapsible: false,
    });
    let theMap = new Map({
      layers: [],
      controls: defaultControls({attribution: false}),//.extend([attribution]),
      view: new View({
        projection: 'EPSG:4326',
        center,
        zoom,
      }),
    });
    theMap.setTarget(mapId.current);
    theMap.on("moveend", () => {
      let center = theMap.getView().getCenter();
      let zoom = theMap.getView().getZoom();
      console.log(zoom);
      // this.setState({ center, zoom });
    });
    setMap(theMap);
    return () => {
      if (!theMap) return;
      theMap.setTarget(undefined);
      destroyMap();
    };
  }, []);

  return (
    <div ref={mapId} className='map'>
      {children}
    </div>
  );
};
