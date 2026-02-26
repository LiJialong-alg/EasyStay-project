import request from '../utils/request';

/**
 * 获取数据中心概览数据
 * @returns {Promise} 包含10个图表的所有数据
 */
export const getAnalyticsOverview = () => {
  return request({
    url: '/analytics/overview',
    method: 'get'
  });
};

/**
 * 获取管理端数据中心概览数据 (Admin)
 * @returns {Promise}
 */
export const getAdminAnalyticsOverview = () => {
  return request({
    url: '/admin/analytics/overview',
    method: 'get'
  });
};

export const getAdminPlatformAnalytics = () => {
  return request({
    url: '/admin/analytics/platform',
    method: 'get'
  });
};
