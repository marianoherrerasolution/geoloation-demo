import "./App.css";
import Layers from "./components/layers/Layers";
import { OlTileLayer } from "./components/layers/OlTileLayer";
import { BaseLayer } from "./components/layers/BaseLayer";
import { Geolocation } from "./components/layers/Geolocation";
import { ReMap } from "./components/map/map/ReMap";
import { WMSTile } from "./components/source/WMSTile";
import { IPAddress } from "./components/IP/IPAddress";
import PersonList from './components/APIRequests.js';

function App() {
  return (
    <div className='App'>
      <PersonList/>
      <div id ='divModal'></div>
      <ReMap center={[33.51, 71.56]} zoom={5}>
        <Layers>
          <BaseLayer/>
          <OlTileLayer
            source={WMSTile("https://ahocevar.com/geoserver/wms", {
              LAYERS: "topp:states",
              Tiled: true,
            })}
          />
          <IPAddress/>
          <Geolocation/>
        </Layers>
      </ReMap>
    </div>
  );
}

export default App;
