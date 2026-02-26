import request from '../utils/request';

export const getBanners = (params) => {
  return request({
    url: '/banners',
    method: 'get',
    params,
  });
};

export const uploadBannerImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/banners/upload-image',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const createBanner = (data) => {
  return request({
    url: '/banners',
    method: 'post',
    data,
  });
};

export const updateBanner = (id, data) => {
  return request({
    url: `/banners/${id}`,
    method: 'patch',
    data,
  });
};

export const deleteBanner = (id) => {
  return request({
    url: `/banners/${id}`,
    method: 'delete',
  });
};

