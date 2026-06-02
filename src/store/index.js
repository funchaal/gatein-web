import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import globalReducer from './slices/globalSlice';
import { api } from '../services/api';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    global: globalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;
