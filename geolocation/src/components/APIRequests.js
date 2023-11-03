import React from 'react';
import axios from 'axios';

export default class APIRequests extends React.Component {
  componentDidMount() {
    axios.post(`http://localhost:3001/checkIntersection`, {
        longitude: '70',
        latitude: '30'
      })
      .then(res => {
        console.log(res.data);
      })
  }

  render() {
    return (
      <p
          style={{
            backgroundColor: "green",
            padding: "10px",
            borderRadius: "5px",
            color: "white",
            position: "absolute",
            top: "100px",
            right: "20px",
            zIndex: "1"
          }}>
          You're allowed to Use this application
      </p>
    )
  }
}