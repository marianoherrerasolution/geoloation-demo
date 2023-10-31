import React from 'react';
import axios from 'axios';


export default class PersonList extends React.Component {
  state = {
    persons: []
  }

  componentDidMount() {
    axios.post(`http://localhost:3001/checkIntersection`, {
        longitude: '70',
        latitude: '30'
      })
      .then(res => {
        console.log(res.data);
        // const persons = res.data;
        // this.setState({ persons });
      })
  }

  render() {
    return (
        <p>Returned</p>
    //   <ul>
    //     {
    //       this.state.persons
    //         .map(person =>
    //           <li key={person.gid}>{person.username}</li>
    //         )
    //     }
    //   </ul>
    )
  }
}