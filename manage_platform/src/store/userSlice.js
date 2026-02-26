import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userInfo: (() => {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem('token') || '',
  role: localStorage.getItem('role') || '', // 'admin' or 'merchant'
  isAuthenticated: !!localStorage.getItem('token'),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      const { userInfo, token, role } = action.payload;
      state.userInfo = userInfo;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userInfo', JSON.stringify(userInfo || null));
    },
    logout: (state) => {
      state.userInfo = null;
      state.token = '';
      state.role = '';
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('merchant_system_seen_at');
    },
  },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
