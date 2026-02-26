import request from '../utils/request';

export const getMerchants = () => {
  return request({
    url: '/admin/merchants',
    method: 'get'
  });
};

export const updateMerchantStatus = (id, status, reason) => {
  return request({
    url: `/admin/merchants/${id}/status`,
    method: 'patch',
    data: { status, reason }
  });
};

