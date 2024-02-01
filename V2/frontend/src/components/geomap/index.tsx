import { useEffect, Fragment, useState} from "react";
import { fromLonLat, toLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { Point } from "ol/geom";
import "ol/ol.css";
import "./custom.css";

import { RMap, ROSM, RLayerVector, RFeature, ROverlay, RStyle } from "rlayers";
import locationIcon from "./location.svg";

const coords: Record<string, Coordinate> = {
  origin: [2.364, 48.82],
  Montmartre: [2.342, 48.887],
};

interface MapProps {
  lat: number;
  lon: number;
}

const GeoMap = ({
  lat,
  lon
}: MapProps) => {
  const [loc, setLoc] = useState([lon, lat]);
  return (
    <Fragment>
      <RMap
        className="map-container"
        initial={{ center: fromLonLat([lon, lat]), zoom: 15 }}
      >
        <ROSM />
        <RLayerVector>
          <RFeature
            geometry={new Point(fromLonLat(loc))}
          >
            <RStyle.RStyle>
              <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
            </RStyle.RStyle>
          </RFeature>
        </RLayerVector>
      </RMap>
      <div className="mx-0 mt-0 mb-3 p-1 w-100 jumbotron shadow shadow">
        <p>
          Pin location is{" "}
          <strong>{`${loc[1].toFixed(3)} : ${loc[0].toFixed(3)}`}</strong>
        </p>
      </div>
    </Fragment>
  );
}

export default GeoMap;