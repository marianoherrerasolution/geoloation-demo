// Add user to db
const USER_API = "http://localhost:5000/users"
const addUser = async (e, fName, lName, email, password, onError) => {
  e.preventDefault();
  try {
    const body = { fName, lName, email, password };
    const response = await fetch(USER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const jsonData = await response.json();
    if (jsonData.error) {
      if (onError) {
        onError(jsonData)
      } else {
        console.log(jsonData.error)
      }
    } else {
      sessionStorage.setItem('userSessionStorageData', JSON.stringify(jsonData));
      window.location = '/';
    }
  } catch (err) {
    console.error(err.message);
  }
};

// Get all users from db
const getUsers = async (setUsers) => {
  try {
    const response = await fetch(USER_API);
    const jsonData = await response.json();

    setUsers(jsonData);
  } catch (err) {
    console.error(err.message);
  }
};

// Update user in db
const updateUser = async (e, fName, lName, email, password, id) => {
  e.preventDefault();
  try {
    const editUser = { fName, lName, email, password };
    const response = await fetch(`${USER_API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editUser),
    });
    window.location = '/';
  } catch (err) {
    console.error(err.message);
  }
};

// Delete user from db
const deleteUser = async (id, setUsers, users) => {
  try {
    const deleteUser = await fetch(`${USER_API}/${id}`, {
      method: 'DELETE',
    });

    setUsers(users.filter((user) => user.id !== id));
  } catch (err) {
    console.error(err.message);
  }
};

// Log in user
const handleLogin = async (email, password, onError) => {
  try {
    const user_credentials = { email, password };
    const response = await fetch(`${USER_API}/${email}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user_credentials),
    });
    const jsonData = await response.json();
    if (jsonData.error) {
      onError(jsonData.error)
    } else {
      sessionStorage.setItem('userSessionStorageData', JSON.stringify(jsonData));
      window.location = '/';
    }
  } catch (err) {
    // console.error(err.message);
    console.log(err);
  }
};

export default {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  handleLogin,
};
