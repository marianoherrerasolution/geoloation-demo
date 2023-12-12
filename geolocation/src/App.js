import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Login/Header';
import Map from './components/Main';
import SignupBanner from './components/Login/SignupBanner';
import LoginBanner from './components/Login/LoginBanner';

export const AppContext = React.createContext();

export default function App({ props }) {
  const [login, setLogin] = useState(false);
  const [page, setPage] = useState(2);
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [users, setUsers] = useState([]);
  const [id, setId] = useState();

  useEffect(() => {
    const userSession = sessionStorage.getItem('userSessionStorageData');
    if (userSession) setLogin(true);
  }, [login]);
  let main_page;
  if (!login) {
    main_page = <div style={styles.wrapper}>
      {page === 1 && <SignupBanner />}
      {page === 2 && <LoginBanner />}
    </div>
  } else {
    main_page = <Map/>
  }
  return (
    <AppContext.Provider
      value={{
        login,
        setLogin,
        page,
        setPage,
        fName,
        setFName,
        lName,
        setLName,
        email,
        setEmail,
        password,
        setPassword,
        users,
        setUsers,
        id,
        setId,
      }}
    >
      <div className="App" style={styles.container}>
        <Header />
        {main_page}
      </div>
    </AppContext.Provider>
  );
}

const styles = {
  wrapper: {
    display: 'grid',
    justifyContent: 'center',
    columnGap: 30,
  },
};
