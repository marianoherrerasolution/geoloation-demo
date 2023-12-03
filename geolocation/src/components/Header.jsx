import React, { useContext, useEffect } from 'react';
import Button from './Button';
import { AppContext } from '../App';

import colors from '../config/colors';

export default function Header({ props }) {
  const { login, setLogin, page, setPage } = useContext(AppContext);

  const userData = JSON.parse(sessionStorage.getItem('userSessionStorageData'));
  // console.log(userData);
  const handleLogout = () => {
    sessionStorage.clear();
    window.location = '/';
  };
  let buttons;
  if (!login) {
    buttons = <div style={styles.nav}>
      <Button
        text="Sign Up"
        onClick={() => {
          setPage(1);
        }}
      />
      <Button
        text="Login"
        onClick={() => {
          setPage(2);
        }}
      />
    </div>;
  } else {
    buttons = <></>;
  }
  return (
    <div style={styles.container}>
      <div style={styles.logo}>
        {login && (
          <div style={styles.loginUser}>
            {userData.email}
            <Button text="Logout" onClick={() => handleLogout()} />
          </div>
        )}
        {!login && (
          <div>
            {page === 1 && <div style={styles.Banner}>Geolocation - Sign Up</div>}
            {page === 2 && <div style={styles.Banner}>Geolocation - Log In</div>}
          </div>
        )}
      </div>
      {buttons}
      {/* <div style={styles.nav}>
        <Button
          text="Sign Up"
          onClick={() => {
            setPage(1);
          }}
        />
        <Button
          text="Login"
          onClick={() => {
            setPage(2);
          }}
        />
      </div> */}
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr',
    alignItems: 'center',
    height: 50,
    paddingLeft: 0,
    backgroundColor: colors.primary_opaque,
    border: '2px solid ' + colors.primary
  },
  logo: {
    color: colors.green,
    fontSize: 18,
  },
  nav: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifySelf: 'end',
    marginRight: '5vw',
  },
  loginUser: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    alignItems: 'center',
    position: 'absolute',
    right: '0',
    top: '0px'
  },
  Banner: {
    color: 'green'
  }
};
