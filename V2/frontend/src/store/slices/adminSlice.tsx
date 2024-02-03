import { createSlice } from '@reduxjs/toolkit';
import { Admin } from '../../interfaces/models/admin';

export type AdminState = Admin | null;

const initialState: AdminState = null;

export const adminSlice = createSlice({
  name: 'admin',
  initialState: initialState,
  reducers: {
    setCurrentAdmin: (state, action) => {
      state = action.payload;

      return state;
    },
    logoutAdmin: (state) => {
      state = null;

      return state;
    },
  },
});

export const { setCurrentAdmin, logoutAdmin } = adminSlice.actions;

export default adminSlice.reducer;
