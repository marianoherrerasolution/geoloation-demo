import { useEffect, Fragment, useState} from "react";
import { fromLonLat, toLonLat } from "ol/proj";
import { Point, Polygon } from "ol/geom";
import "ol/ol.css";
import "./custom.css";
import { DrawEvent } from 'ol/interaction/Draw.js';

import { RMap, ROSM, RLayerVector, RFeature, RStyle, RInteraction, MapBrowserEvent } from "rlayers";
import locationIcon from "./location.svg";
import { RView } from "rlayers/RMap";
import { Coordinate } from "ol/coordinate";
import { Map } from "ol";
import { Marker } from "../../interfaces/models/marker";

// const initialView: RView = { center: fromLonLat([2.364, 48.82]), zoom: 12 };

interface MapProps {
  lat: number;
  lon: number;
  onDrawEnd: (coords: Array<Coordinate>) => void;
  drawType: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  polygonCoordinates: Coordinate[][];
  markers: Array<Marker>; // [{point: new Point(...), icon: "path"}]
}

const GeoMap = ({
  lat,
  lon,
  drawType,
  strokeWidth,
  strokeColor,
  fillColor,
  polygonCoordinates,
  markers,
  onDrawEnd
}: MapProps) => {
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [view, setView] = useState<RView>({ center: fromLonLat([0, 0]), zoom: 12 })
  const [drawing, setDrawing] = useState<string>("")
  const [colorFill, setColorFill] = useState<string>("")
  const [colorStroke, setColorStroke] = useState<string>("")
  const [widthStroke, setWidthStroke] = useState<number>(3)
  const [map, setMap] = useState<Map>()
  const [coordinates, setCoordinates] = useState<Coordinate[][]>([])
  const [polygonFeature, setPolygonFeature] = useState<Coordinate[][]>([])
  const [mapUniqKey, setMapUniqKey] = useState<string>("v1")
  const [initialView, setInitialView] = useState<RView>({ center: fromLonLat([0, 0]), zoom: 12 })
  const [newInitialView, setNewInitialView] = useState<boolean>(false)
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
      setInitialView({ center: fromLonLat([lon, lat]), zoom: 12 })
      setView({ center: fromLonLat([lon, lat]), zoom: 12 })
      setTimeout(() => {
        setNewInitialView(true)
      },500)
    }

    if (polygonCoordinates != coordinates) {
      // setNewInitialView(false)
      setCoordinates(polygonCoordinates)
      changeCoordinatesToPolygon(polygonCoordinates)
      // setTimeout(() => {
      //   setNewInitialView(true)
      // },500)
    }

    if (markers && markers.length > 0) {
      // prepare markers
    }
  })

  const changeCoordinatesToPolygon = (coords:Coordinate[][]) => {
    if (coords.length < 1) {
      setPolygonFeature([])
      return
    }
    
    let geomCoords = []
    for(let i = 0; i < coords.length; i += 1) {
      let coord = coords[i]
      let lon = Number(`${coord[0]}`)
      let lat = Number(`${coord[1]}`)
      geomCoords.push(fromLonLat([lon, lat]))
    }
    // setMapUniqKey((Math.random() + 1).toString(36).substring(7))
    setPolygonFeature([geomCoords])
    // setView({ center: fromLonLat([Number(`${coords[0][0]}`), Number(`${coords[0][0]}`)]), zoom: 12 })
  }

  const onDrawedPolygon = (e: DrawEvent) => {
    let sketchCoords = e.target.sketchCoords_[0]
    let polygonCoords = []
    for(let i = 0; i < sketchCoords.length; i += 1) {
      let lonLat = toLonLat(sketchCoords[i])
      polygonCoords.push(lonLat)
    }
    polygonCoords.push(polygonCoords[0])
    onDrawEnd(polygonCoords)
  }

  const onMapClicked = (e:MapBrowserEvent<UIEvent>) => {
    setMap(e.map)
  }

  return (
    <Fragment>
      {
        newInitialView ? <RMap
        className="map-container"
        initial={initialView}
        view={[view, setView]}
        onClick={onMapClicked}
      >
        <ROSM />
        {
          drawing != "remove" ?
            <RLayerVector>
              <RStyle.RStyle>
                <RStyle.RStroke color={strokeColor} width={strokeWidth} />
                <RStyle.RFill color={fillColor} />
              </RStyle.RStyle> 
              {
                polygonFeature.length > 0 ?  <RFeature
                  geometry={
                      new Polygon(polygonFeature)
                  }
                /> : ""
              }
             

              { drawing == "draw" ? 
                <RInteraction.RDraw type={"Polygon"} onDrawEnd={onDrawedPolygon}/> : ""
              }
            </RLayerVector> : ""
        }
        <RLayerVector
        >
          <RFeature
            // key={mapUniqKey}
            geometry={new Point(fromLonLat([longitude, latitude]))}
          >
            <RStyle.RStyle>
              <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
            </RStyle.RStyle>
          </RFeature>
        </RLayerVector>
        <RLayerVector>
          
        {markers ? markers.map((marker, mIndex) => (
          <RFeature
            key={`marker${mIndex}`}
            geometry={marker.point}
          >
            <RStyle.RStyle>
              <RStyle.RIcon src={marker.icon} anchor={[0.5, 0.8]} />
            </RStyle.RStyle>
          </RFeature>
        )) : ""}
        </RLayerVector>
        
        </RMap> : ""
      }
      <div className="mx-0 mt-0 mb-3 p-1 w-100 jumbotron shadow shadow">
        <p>
          Longitude : Latitude{" "}
          <strong>{`${longitude.toFixed(4)} : ${latitude.toFixed(4)}`}</strong>
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
  fillColor: "rgba(0, 0, 0, 0.45)",
  strokeColor: "#0000ff",
  strokeWidth: 3,
  polygonCoordinates: [],
  markers: []
}

export default GeoMap;