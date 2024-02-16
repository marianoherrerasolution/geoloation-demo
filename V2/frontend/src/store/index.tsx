import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userSlice, { UserState } from './slices/userSlice';
import adminSlice, { AdminState } from './slices/adminSlice';
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: CONFIG.appName,
  storage,
};

const rootReducer = combineReducers({
  user: userSlice,
  admin: adminSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = {
  user: UserState;
  admin: AdminState;
};
export type AppDispatch = typeof store.dispatch;
