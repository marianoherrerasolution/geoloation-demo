import React, { useEffect, useState } from 'react'
import { AppModal } from '../UI/AppModal';

export const IPAddress = () => {
  const [ipAddress, setIPAddress] = useState('')

  useEffect(() => {
    fetch('https://geolocation-db.com/json/')
      .then(response => response.json())
      .then(data => {
        setIPAddress(data);
      })
      .catch(error => console.log(error))
  }, []);

  return (
    <div>
      <AppModal loc={ipAddress}/>
    </div>
  )
}