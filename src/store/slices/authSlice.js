import { createSlice } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const initialUser = {
  id: null,
  name: null,
  username: null,
  permissions: {},
  is_admin: false,
  company_id: null,
  company_type: null, // 'terminal' | 'trucking_company'
};

const initialState = {
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isOffline: false,
  isLoading: false,
  isAppLoading: true,
  error: null,
  user: initialUser,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = initialUser;
      state.isAuthenticated = false;
      state.isOffline = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addMatcher(api.endpoints.login.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user; // inclui company_type vindo do server
        state.isOffline = false;
      })
      .addMatcher(api.endpoints.login.matchRejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // RESTORE SESSION
      .addMatcher(api.endpoints.restoreSession.matchPending, (state) => {
        state.isAppLoading = true;
        state.error = null;
      })
      .addMatcher(api.endpoints.restoreSession.matchFulfilled, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = true;
        state.isOffline = action.payload.isOffline;
        state.token = action.payload.token;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addMatcher(api.endpoints.restoreSession.matchRejected, (state, action) => {
        state.isAppLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.user = initialUser;
        if (action.payload?.data?.detail || action.payload?.error) {
          state.error = action.payload;
        }
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;