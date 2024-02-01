import React, { useState, useEffect, useContext } from 'react';
import SignupForm from './SignupForm';
import db from '../../hooks/CRUD';
// import { AppContext } from '../../App';
import { AppContext } from '../../App';

import colors from '../../config/colors';

export default function SignupBanner({ props }) {
  const {
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
  } = useContext(AppContext);

  useEffect(() => {
    db.getUsers(setUsers);
  }, []);

  const addUser = async (e, onError) => {
    db.addUser(e, fName, lName, email, password, onError);
  };

  const updateUser = async (e) => {
    db.updateUser(e, fName, lName, email, password, id);
  };

  const deleteUser = async (id) => {
    db.deleteUser(id, setUsers, users);
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <SignupForm addUser={addUser} updateUser={updateUser} />
      </div>

      {/* {users.length > 0 && (
        <div style={styles.users}>
          {users.map((user, index) => {
            return (
              <div key={index} style={styles.usersRow}>
                <div>ID: {user.id}</div>
                <div>First Name: {user.fname}</div>
                <div>Last Name: {user.lname}</div>
                <div>Email: {user.email}</div>
                <div>Password: {user.password}</div>
                <div style={styles.delete} onClick={() => deleteUser(user.id)}>
                  Delete
                </div>
                <div
                  style={styles.update}
                  onClick={() => {
                    setFName(user.fname ? user.fname : '');
                    setLName(user.lname ? user.lname : '');
                    setEmail(user.email ? user.email : '');
                    setPassword(user.password ? user.password : '');
                    setId(user.id);
                  }}
                >
                  Update
                </div>
              </div>
            );
          })}
        </div>
      )} */}
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    justifyContent: 'center',
    marginTop: 50,
  },
  form: {
    display: 'grid',
    justifyContent: 'center',
  },
  users: {
    display: 'grid',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 30,
    border: `1px solid ${colors.primary}`,
  },
  usersRow: {
    display: 'grid',
    justifyContent: 'center',
    alignItems: 'center',
    gridTemplateColumns: 'repeat(7, auto)',
    padding: 10,
    columnGap: 10,
  },
  delete: {
    border: `1px solid ${colors.danger}`,
    borderRadius: 10,
    backgroundColor: colors.danger,
    color: colors.white,
    padding: 5,
    cursor: 'pointer',
  },
  update: {
    border: `1px solid ${colors.primary}`,
    borderRadius: 10,
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 5,
    cursor: 'pointer',
  },
};
