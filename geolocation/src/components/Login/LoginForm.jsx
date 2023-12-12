import React, { useState, useContext } from 'react';
import db from '../../hooks/CRUD';
import { AppContext } from '../../App';
import Button from './Button';

import colors from '../../config/colors';

export default function LoginForm({ props }) {
  const { setLogin } = useContext(AppContext);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  // const getUserData = () => {
  //   let data = sessionStorage.getItem('userSessionStorageData');
  //   data = JSON.parse(data);
  //   console.log(data);
  // };

  const handleLogin = (e) => {
    e.preventDefault();
    db.handleLogin(email, password);
  };

  return (
    <form style={styles.container} onSubmit={(e) => handleLogin(e)}>
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
      <a href="#" style={{textAlign: 'right'}}>Forgot Password?</a>
      <input style={styles.btn} type="submit" value="Login" />
      {/* <Button text="Log User Data" onClick={() => getUserData()} /> */}
    </form>
  );
}

const styles = {
  container: {
    display: 'grid',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 10,
    border: `1px solid ${colors.primary}`,
    position: `absolute`,
    left: `50%`,
    top: `50%`,
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
