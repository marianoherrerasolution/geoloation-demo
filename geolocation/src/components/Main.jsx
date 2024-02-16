import "../App.css";
import Layers from "./layers/Layers";
import { OlTileLayer } from "./layers/OlTileLayer";
import { BaseLayer } from "./layers/BaseLayer";
import { Geolocation } from "./layers/Geolocation";
import { ReMap } from "./map/map/ReMap";
import { WMSTile } from "./source/WMSTile";
import { useEffect, useState, useRef } from "react";
import { AppModal } from "./UI/AppModal";
import Switch from "./Switch";
import { ThemeProvider, useTheme } from "../ThemeContext";
import axios from 'axios';

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
  const initialized = useRef(false)
  const addLocation = (address, ip) => {
    let {city, country, zip_code, latitude, longitude, country_name} = address
    fetch(
      `http://localhost:5000/location`, {
        method: "post",
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city, country, zip_code, latitude, longitude, ip, country: country_name })  
      }
    )
  }

  const checkVPN = ip => {
    fetch(`http://localhost:5000/vpn?tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}&ip=${ip}`)
      .then(response => response.json())
      .then(data => {
        addLocation(data.address, ip)
        setIPAddress(ip)
        if (data.real !== data.simulated) {
          setVPN('Detected');
        }
      })
      .catch(error => console.log(error));
  }
  
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      console.log('test')
      fetch("https://api.ipify.org/?format=json")
        .then(response => response.json())
        .then(data => checkVPN(data.ip))
    }
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
function Main() {
  return (
    <>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    <Map />
    </>
  );
}

export default Main;
