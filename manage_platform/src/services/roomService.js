import request from '../utils/request';

/**
 * 获取房型列表 (复用 hotelService 的接口，但逻辑上属于房型管理)
 * @param {string|number} hotelId 
 * @returns {Promise}
 */
export const getRoomTypes = (hotelId) => {
  return request.get(`/hotels/${hotelId}/room-types`);
};

/**
 * 获取房态日历数据
 * @param {Object} params - { hotelId, startDate, endDate }
 * @returns {Promise} { roomTypes, inventory }
 */
export const getRoomCalendar = (params) => {
  // params: { hotelId, startDate, endDate }
  return request.get('/rooms/calendar', { params });
};

/**
 * 批量更新房价/房态 (用于日历上的改价/开关房操作)
 * @param {Object} data - { hotelId, roomTypeIds: [], dateRange: { start, end }, newPrice, newStock }
 * @returns {Promise} 更新结果
 */
export const batchUpdatePrice = (data) => {
  // data: { hotelId, roomTypeIds: [], dateRange: { start, end }, newPrice, newStock }
  return request.post('/rooms/price/batch-update', data);
};

/**
 * 更新单个房型的上下线状态
 * @param {string|number} roomTypeId - 房型ID
 * @param {string} status - 'available' | 'offline'
 * @returns {Promise} 成功状态
 */
export const updateRoomStatus = (roomTypeId, status, reason) => {
  return request.patch(`/rooms/${roomTypeId}/status`, { status, reason });
};

export const uploadRoomImage = (roomTypeId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post(`/rooms/${roomTypeId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
