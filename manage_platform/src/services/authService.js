import request from '../utils/request';

export const loginApi = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  });
};

export const registerApi = (data) => {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  });
};

export const getMe = () => {
  return request({
    url: '/auth/me',
    method: 'get'
  });
};

