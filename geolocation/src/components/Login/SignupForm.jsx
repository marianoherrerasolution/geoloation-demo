import React, { useContext } from 'react';
import { AppContext } from '../../App';

import colors from '../../config/colors';

export default function SignupForm({ addUser, updateUser }) {
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

  return (
    <form style={styles.container} onSubmit={(e) => addUser(e)}>
      {/* <div>Please enter your account details below</div> */}
      <label style={styles.lbl}>
        First Name{' '}
        <input
          type="text"
          value={fName}
          placeholder="First Name"
          style={styles.textbox}
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
          onChange={(e) => setLName(e.target.value)}
        />
      </label>
      <label style={styles.lbl}>
        Email{' '}
        <input
          type="text"
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
  }
};
