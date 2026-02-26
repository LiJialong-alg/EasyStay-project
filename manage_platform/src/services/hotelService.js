import request from '../utils/request';

/**
 * 获取酒店列表
 * @returns {Promise} 酒店对象数组，包含基本信息和最低价
 */
export const getHotels = () => {
  return request({
    url: '/hotels',
    method: 'get'
  });
};

/**
 * 获取指定酒店的房型列表
 * @param {string|number} hotelId - 酒店ID
 * @returns {Promise} 房型数组
 */
export const getRoomTypes = (hotelId) => {
  return request({
    url: `/hotels/${hotelId}/room-types`,
    method: 'get'
  });
};

export const createRoomType = (hotelId, data) => {
  return request({
    url: `/hotels/${hotelId}/room-types`,
    method: 'post',
    data,
  });
};

export const deleteRoomType = (id) => {
  return request({
    url: `/hotels/room-types/${id}`,
    method: 'delete',
  });
};

/**
 * 更新酒店营业状态
 * @param {string|number} id - 酒店ID
 * @param {string} status - 'operating' | 'closed'
 * @returns {Promise} 成功状态
 */
export const updateHotelStatus = (id, status) => {
  return request({
    url: `/hotels/${id}/status`,
    method: 'patch',
    data: { status }
  });
};

export const updateHotelInfo = (id, data) => {
  return request({
    url: `/hotels/${id}`,
    method: 'patch',
    data
  });
};

export const deleteHotel = (id) => {
  return request({
    url: `/hotels/${id}`,
    method: 'delete',
  });
};

export const updateHotelListing = (id, listed, reason) => {
  return request({
    url: `/hotels/${id}/listing`,
    method: 'patch',
    data: { listed, reason }
  });
};

export const updateHotelSelfListing = (id, listed, reason) => {
  return request({
    url: `/hotels/${id}/self-listing`,
    method: 'patch',
    data: { listed, reason }
  });
};

export const createHotelListingRequest = (hotelId, reason) => {
  return request({
    url: `/hotels/${hotelId}/listing-requests`,
    method: 'post',
    data: { reason }
  });
};

export const getMyHotelListingRequests = () => {
  return request({
    url: '/hotel-listing-requests',
    method: 'get'
  });
};

export const adminGetHotelListingRequests = (params) => {
  return request({
    url: '/admin/hotel-listing-requests',
    method: 'get',
    params
  });
};

export const adminReviewHotelListingRequest = (id, action, comment) => {
  return request({
    url: `/admin/hotel-listing-requests/${id}`,
    method: 'patch',
    data: { action, comment }
  });
};

/**
 * 更新房型基础信息
 * @param {string|number} id - 房型ID
 * @param {Object} data - 更新数据 { base_price }
 * @returns {Promise}
 */
export const updateRoomType = (id, data) => {
  return request({
    url: `/hotels/room-types/${id}`,
    method: 'patch',
    data
  });
};

export const uploadHotelImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/uploads/hotel-image',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const uploadRoomImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/uploads/room-image',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
