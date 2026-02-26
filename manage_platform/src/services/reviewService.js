import request from '../utils/request';

/**
 * 获取评价列表
 * @returns {Promise}
 */
export const getReviews = () => {
  return request({
    url: '/reviews',
    method: 'get'
  });
};

/**
 * 回复评价
 * @param {string|number} id - 评价ID
 * @param {string} reply - 回复内容
 * @returns {Promise}
 */
export const replyReview = (id, reply) => {
  return request({
    url: `/reviews/${id}/reply`,
    method: 'patch',
    data: { reply }
  });
};

/**
 * 切换置顶状态
 * @param {string|number} id - 评价ID
 * @returns {Promise}
 */
export const toggleReviewHighlight = (id) => {
  return request({
    url: `/reviews/${id}/highlight`,
    method: 'patch'
  });
};
