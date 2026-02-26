import request from '../utils/request';

export const createHotelRegistrationRequest = (data) => {
  return request({
    url: '/hotel-registration-requests',
    method: 'post',
    data,
  });
};

export const getMyHotelRegistrationRequests = () => {
  return request({
    url: '/hotel-registration-requests',
    method: 'get',
  });
};

export const adminGetHotelRegistrationRequests = (params) => {
  return request({
    url: '/admin/hotel-registration-requests',
    method: 'get',
    params,
  });
};

export const adminReviewHotelRegistrationRequest = (id, action, comment) => {
  return request({
    url: `/admin/hotel-registration-requests/${id}`,
    method: 'patch',
    data: { action, comment },
  });
};

