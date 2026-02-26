import request from '../utils/request';

/**
 * 获取订单列表
 * @param {Object} params - 查询参数 { page, pageSize, status }
 * @returns {Promise} 订单分页列表 { list, total }
 */
export const getOrders = (params) => {
  return request({
    url: '/orders',
    method: 'get',
    params
  });
};

/**
 * 获取订单详情
 * @param {string|number} id - 订单ID
 * @returns {Promise} 订单详细信息
 */
export const getOrderDetail = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  });
};

/**
 * 更新订单状态
 * @param {string|number} id - 订单ID
 * @param {string} status - 新状态 (checked_in, completed, etc.)
 * @returns {Promise} 成功状态
 */
export const updateOrderStatus = (id, status) => {
  return request({
    url: `/orders/${id}/status`,
    method: 'patch',
    data: { status }
  });
};
