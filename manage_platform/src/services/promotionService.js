import request from '../utils/request';

export const getPromotions = (params) => {
  return request({
    url: '/promotions',
    method: 'get',
    params,
  });
};

