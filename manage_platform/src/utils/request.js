import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/userSlice';
import { message } from 'antd';

const service = axios.create({
  baseURL: '/api', // 使用相对路径，配合 vite proxy
  timeout: 5000,
});

service.interceptors.request.use(
  (config) => {
    const token = store.getState().user.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
      message.error('登录状态已过期，请重新登录');
      window.location.href = '/login';
    } else {
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        '网络异常';
      message.error(serverMessage);
    }
    return Promise.reject(error);
  }
);

export default service;
