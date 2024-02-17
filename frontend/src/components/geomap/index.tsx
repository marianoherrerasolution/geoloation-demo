import { useEffect, Fragment, useState} from "react";
import { fromLonLat, toLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { Point } from "ol/geom";
import "ol/ol.css";
import "./custom.css";

import { RMap, ROSM, RLayerVector, RFeature, ROverlay, RStyle } from "rlayers";
import locationIcon from "./location.svg";
import { RView } from "rlayers/RMap";


const initialView: RView = { center: fromLonLat([2.364, 48.82]), zoom: 15 };

interface MapProps {
  lat: number;
  lon: number;
}

const GeoMap = ({
  lat,
  lon
}: MapProps) => {
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [view, setView] = useState(initialView);

  useEffect(() => {
    if (lat != latitude || lon != longitude) {
      setLatitude(lat)
      setLongitude(lon)
      setView({ center: fromLonLat([lon, lat]), zoom: 15 })
    }
  })
  return (
    <Fragment>
      <RMap
        className="map-container"
        initial={initialView}
        view={[view, setView]}
      >
        <ROSM />
        <RLayerVector>
          <RFeature
            geometry={new Point(fromLonLat([longitude, latitude]))}
          >
            <RStyle.RStyle>
              <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
            </RStyle.RStyle>
          </RFeature>
        </RLayerVector>
      </RMap>
      <div className="mx-0 mt-0 mb-3 p-1 w-100 jumbotron shadow shadow">
        <p>
          Longitude : Latitude{" "}
          <strong>{`${latitude.toFixed(4)} : ${longitude.toFixed(4)}`}</strong>
        </p>
      </div>
    </Fragment>
  );
}

export default GeoMap;