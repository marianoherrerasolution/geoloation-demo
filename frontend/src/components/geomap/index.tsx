import { useEffect, Fragment, useState} from "react";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point } from "ol/geom";
import "ol/ol.css";
import "./custom.css";
import Draw, { DrawEvent } from 'ol/interaction/Draw.js';

import { RMap, ROSM, RLayerVector, RFeature, ROverlay, RStyle, RInteraction, MapBrowserEvent } from "rlayers";
import locationIcon from "./location.svg";
import { RView } from "rlayers/RMap";
import { Coordinate } from "ol/coordinate";
import { Map } from "ol";

const initialView: RView = { center: fromLonLat([2.364, 48.82]), zoom: 15 };

interface MapProps {
  lat: number;
  lon: number;
  onDrawEnd: (coords: Array<Coordinate>) => void;
  drawType: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

const GeoMap = ({
  lat,
  lon,
  drawType,
  strokeWidth,
  strokeColor,
  fillColor,
  onDrawEnd
}: MapProps) => {
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [view, setView] = useState(initialView)
  const [drawing, setDrawing] = useState<string>("")
  const [colorFill, setColorFill] = useState<string>("")
  const [colorStroke, setColorStroke] = useState<string>("")
  const [widthStroke, setWidthStroke] = useState<number>(3)
  const [map, setMap] = useState<Map>()
  // geometry


  useEffect(() => {
    if (drawing != drawType && view) {
      setDrawing(drawType)
    }

    if (strokeColor != "" && strokeColor != colorStroke) {
      setColorStroke(strokeColor)
    }

    if (strokeWidth > 0 && strokeWidth != widthStroke) {
      setWidthStroke(strokeWidth)
    }

    if (fillColor != "" && fillColor != colorFill) {
      setColorFill(fillColor)
    }
    
    if (lat != latitude || lon != longitude) {
      setLatitude(lat)
      setLongitude(lon)
      setView({ center: fromLonLat([lon, lat]), zoom: 15 })
    }
  })

  const onDrawedPolygon = (e: DrawEvent) => {
    let coordinates = e.target.sketchCoords_[0]
    let polygonCoords = []
    for(let i = 0; i < coordinates.length; i += 1) {
      let lonLat = toLonLat(coordinates[i])
      polygonCoords.push(lonLat)
    }
    polygonCoords.push(polygonCoords[0])
    onDrawEnd(polygonCoords)
  }

  const onMapClicked = (e:MapBrowserEvent<UIEvent>) => {
    setMap(e.map)
    console.log(e.map)
  }

  const onStartDrawing = (e:DrawEvent) => {
    console.log(e)
  }

  return (
    <Fragment>
      <RMap
        className="map-container"
        initial={initialView}
        view={[view, setView]}
        onClick={onMapClicked}
      >
        <ROSM />
        <RLayerVector
        >
          <RFeature
            geometry={new Point(fromLonLat([longitude, latitude]))}
          >
            <RStyle.RStyle>
              <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
            </RStyle.RStyle>
          </RFeature>
        </RLayerVector>
        {
          drawing != "remove" ?
            <RLayerVector>
              <RStyle.RStyle>
                <RStyle.RStroke color={strokeColor} width={strokeWidth} />
                <RStyle.RFill color={fillColor} />
              </RStyle.RStyle> 
              { drawing == "draw" ? 
                <RInteraction.RDraw type={"Polygon"} onDrawEnd={onDrawedPolygon}/> : ""
              }
            </RLayerVector> : ""
        }
        
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

GeoMap.defaultProps = {
  lat: 0,
  lon: 0,
  drawType: "",
  onDrawEnd: (coords: Array<Coordinate>) => {},
  fillColor: "rgba(0, 0, 0, 0.65)",
  strokeColor: "#0000ff",
  strokeWidth: 3
}

export default GeoMap;