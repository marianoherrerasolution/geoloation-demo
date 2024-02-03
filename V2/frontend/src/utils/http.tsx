import { Store } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import { logout } from '../store/slices/userSlice';
import md5 from 'blueimp-md5';
import hash from 'hash.js';

let store: Store;

export const injectStore = (_store: Store) => {
  store = _store;
};

export const defaultHttp = axios.create();
const http = axios.create();

const generateToken = () => {
  const state: RootState = store.getState();
  const {user, admin} = state
  const loginToken: string = !!admin ? admin.token : (user?.token || "");
  const unixstamp: number = Math.ceil(Date.now() / 1000);
  const id:string = `${ !!admin ? admin.id : user?.id}`
  const secret:string = md5(`${unixstamp}:${loginToken}:${!!admin ? 'admin':'member'}`)
  const reqToken:string = hash.sha1().update(`${secret}:${id}`).digest('hex');

  return `${unixstamp}.${reqToken}.${id}.${loginToken}`
}



defaultHttp.interceptors.request.use(
  (config) => {
    console.log("test")
    const state: RootState = store.getState();
    const {user, admin} = state
    const isLogin = (!!user || !!admin);
    console.log(isLogin)
    if (isLogin) {
      config.headers.Authorization = `Bearer ${generateToken()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

defaultHttp.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default http;
