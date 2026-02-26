import request from '../utils/request';

export const getFinanceSummary = () => {
  return request({
    url: '/finance/summary',
    method: 'get'
  });
};

export const getTransactions = (params) => {
  return request({
    url: '/finance/transactions',
    method: 'get',
    params
  });
};
