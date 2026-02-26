import request from '../utils/request';

/**
 * 获取看板统计数据
 * @returns {Promise} 包含营收、PV、入住率、待处理订单数
 */
export const getDashboardStats = () => {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  });
};

/**
 * 获取营收图表数据
 * @param {Object} params - 查询参数 { period: 'week' | 'month' | 'year' }
 * @returns {Promise} 包含X轴日期和Y轴营收金额
 */
export const getRevenueChart = (params) => {
  return request({
    url: '/dashboard/chart/revenue',
    method: 'get',
    params
  });
};

/**
 * 获取日程列表
 * @returns {Promise} 按时间排序的日程数组
 */
export const getSchedules = () => {
  return request({
    url: '/dashboard/schedules',
    method: 'get'
  });
};

/**
 * 添加日程
 * @param {Object} data - { event, time, loc, type }
 * @returns {Promise} 新创建的日程对象
 */
export const addSchedule = (data) => {
  return request({
    url: '/dashboard/schedules',
    method: 'post',
    data
  });
};

/**
 * 更新日程
 * @param {string|number} id - 日程ID
 * @param {Object} data - 更新内容
 * @returns {Promise} 更新后的日程对象
 */
export const updateSchedule = (id, data) => {
  return request({
    url: `/dashboard/schedules/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除日程
 * @param {string|number} id - 日程ID
 * @returns {Promise} 成功状态
 */
export const deleteSchedule = (id) => {
  return request({
    url: `/dashboard/schedules/${id}`,
    method: 'delete'
  });
};
