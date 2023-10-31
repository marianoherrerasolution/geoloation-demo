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
      <p>Returned</p>
    )
  }
}