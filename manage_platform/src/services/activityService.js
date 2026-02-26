import request from '../utils/request';

export const getActivityCatalog = () => {
  return request({
    url: '/activities/catalog',
    method: 'get',
  });
};

export const getMyActivityEnrollments = () => {
  return request({
    url: '/activities/enrollments',
    method: 'get',
  });
};

export const getActivityPricing = (code, hotelId) => {
  return request({
    url: `/activities/${code}/pricing`,
    method: 'get',
    params: { hotel_id: hotelId },
  });
};

export const applyActivity = (code, payload) => {
  return request({
    url: `/activities/${code}/apply`,
    method: 'post',
    data: payload,
  });
};

export const cancelActivity = (code, hotelId) => {
  return request({
    url: `/activities/${code}/cancel`,
    method: 'delete',
    params: { hotel_id: hotelId },
  });
};

