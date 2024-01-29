import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';

import colors from '../../config/colors';

export default function SignupForm({ addUser }) {
  const {
    fName,
    setFName,
    lName,
    setLName,
    email,
    setEmail,
    password,
    setPassword,
  } = useContext(AppContext);

  const [errMessage, setError] = useState();
  const onError = (err) => {
    if (err.error == "exist") {
      setError(`The ${err.field} is already registered`)
    }
    if (err.error == "empty") {
      let fieldLabel = err.field
      switch(err.field) {
        case "lname":
          fieldLabel = "last name"
          break;
        case "fname":
          fieldLabel = "first name"
          break;
      }
      setError(`The ${fieldLabel} can not be empty`)
    }
  }

  return (
    <form style={styles.container} onSubmit={(e) => addUser(e, onError)}>
      {/* <div>Please enter your account details below</div> */}
      <h4 style={styles.textError}>{ errMessage }</h4>
      <label style={styles.lbl}>
        First Name{' '}
        <input
          type="text"
          value={fName}
          placeholder="First Name"
          style={styles.textbox}
          required
          onChange={(e) => setFName(e.target.value)}
        />
      </label>
      <label style={styles.lbl}>
        Last Name{' '}
        <input
          type="text"
          value={lName}
          placeholder="Last Name"
          style={styles.textbox}
          required
          onChange={(e) => setLName(e.target.value)}
        />
      </label>
      <label style={styles.lbl}>
        Email{' '}
        <input
          type="email"
          value={email}
          placeholder="Account email"
          style={styles.textbox}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label style={styles.lbl}>
        Password{' '}
        <input
          type="password"
          value={password}
          placeholder="Password"
          style={styles.textbox}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <input type="submit" value="Submit" style={styles.btn}/>
      {/* <input type="submit" value="Update User Details" onClick={updateUser} /> */}
    </form>
  );
}

const styles = {
  container: {
    display: 'grid',
    justifyContent: 'center',
    // width: 300,
    // rowGap: 20,
    padding: 20,
    borderRadius: 10,
    border: `1px solid ${colors.primary}`,
    padding: 20,
    borderRadius: 10,
    border: `1px solid ${colors.primary}`,
    position: `absolute`,
    left: `50%`,
    top: `50%`,
    // -webkit-transform: translate(-50%, -50%);
    transform: `translate(-50%, -50%)`
  },
  btn: {
    height: 40,
    backgroundColor: colors.primary,
    color: '#FFF',
    margin: `8px 0`,
    borderRadius: 10,
    cursor: 'pointer',
  },
  textbox: {
    width: `100%`,
    padding: `12px 20px`,
    margin: `8px 0`,
    boxSizing: `border-box`,
    border: `1px solid #000`,
    borderRadius: `5px`,
    backgroundColor: `#FFF`,
    color: `black`
  },
  lbl: {
    textAlign: `left`
  },
  textError: {
    color: 'red',
    marginTop: '0.7rem',
    marginBottom: '1.5rem'
  }
};