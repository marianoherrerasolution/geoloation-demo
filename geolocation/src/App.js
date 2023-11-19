import "./App.css";
import Layers from "./components/layers/Layers";
import { OlTileLayer } from "./components/layers/OlTileLayer";
import { BaseLayer } from "./components/layers/BaseLayer";
import { Geolocation } from "./components/layers/Geolocation";
import { ReMap } from "./components/map/map/ReMap";
import { WMSTile } from "./components/source/WMSTile";
import { useEffect, useState } from "react";
import { AppModal } from "./components/UI/AppModal";
import Switch from "./components/Switch";
import { ThemeProvider, useTheme } from "./ThemeContext";

function Map() {
  return (
    <ReMap center={[33.51, 71.56]} zoom={5}>
      <Layers>
        <BaseLayer/>
        <OlTileLayer
          source={WMSTile("https://ahocevar.com/geoserver/wms", {
            LAYERS: "topp:states",
            Tiled: true,
          })}
        />
        
        {/* <Geolocation/> */}
      </Layers>
    </ReMap>
  )
}

function App() {
  const [vpn, setVPN] = useState('Not Detected');
  const [ipAddress, setIPAddress] = useState('');
  const { toggleTheme } = useTheme();
  const { theme } = useTheme();
  useEffect(() => {
    fetch('http://localhost:3001/vpn')
      .then(response => response.json())
      .then(data => {
        setIPAddress(data[2])
        if (data[1].real !== data[1].simulated) {
          setVPN('Detected');
        }
      })
      .catch(error => console.log(error))
  }, []);
  return (
    <div className='App'>
      <div>
        <p className="vpn_detection" 
          style={{
            backgroundColor: vpn === "Not Detected" ? "green" : "red",
            padding: "10px",
            borderRadius: "5px",
            color: "white"
          }}>
          VPN {vpn}
        </p>
      </div>
      <div id ='divModal'></div>
      <Switch onChange={toggleTheme} />
      <AppModal loc={ipAddress}/>
      <Geolocation/>
      {/* <ReMap center={[33.51, 71.56]} zoom={5}>
        <Layers>
          <BaseLayer/>
          <OlTileLayer
            source={WMSTile("https://ahocevar.com/geoserver/wms", {
              LAYERS: "topp:states",
              Tiled: true,
            })}
          />
          <AppModal loc={ipAddress}/>
          <Geolocation/>
        </Layers>
      </ReMap> */}
    </div>
  );
}

// export default App;
function Root() {
  return (
    <>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    <Map />
    </>
  );
}

export default Root;
