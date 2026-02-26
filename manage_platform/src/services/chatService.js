import request from '../utils/request';

export const getConversations = (params) => {
  return request({
    url: '/chat/conversations',
    method: 'get',
    params
  });
};

export const createConversation = (data) => {
  return request({
    url: '/chat/conversations',
    method: 'post',
    data
  });
};

export const getMessages = (conversationId) => {
  return request({
    url: `/chat/conversations/${conversationId}/messages`,
    method: 'get'
  });
};

export const sendMessage = (conversationId, data) => {
  return request({
    url: `/chat/conversations/${conversationId}/messages`,
    method: 'post',
    data
  });
};

