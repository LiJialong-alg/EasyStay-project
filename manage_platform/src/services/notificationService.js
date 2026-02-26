import request from '../utils/request';

export const getMerchantNotifications = (params) => {
  return request({
    url: '/notifications/merchant',
    method: 'get',
    params
  });
};

export const readNotification = (id) => {
  return request({
    url: `/notifications/${id}/read`,
    method: 'patch'
  });
};

export const readAllNotifications = (kind) => {
  return request({
    url: '/notifications/read-all',
    method: 'patch',
    data: { kind }
  });
};
