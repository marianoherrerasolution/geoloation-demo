import { createSlice } from '@reduxjs/toolkit';
import { User } from '../../interfaces/models/user';

export type UserState = User | null;

const initialState: UserState = null;

export const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state = action.payload;

      return state;
    },
    logout: (state) => {
      state = null;

      return state;
    },
  },
});

export const { setCurrentUser, logout } = userSlice.actions;

export default userSlice.reducer;
