import React, { useEffect, useMemo, useState } from 'react';
import { Card, Upload, Button, List, message, Space, Input, Switch } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { createBanner, deleteBanner, getBanners, updateBanner, uploadBannerImage } from '../../../services/bannerService';

const BannerSettings = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await getBanners({ position: 'home' });
      setBanners(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const uploadProps = useMemo(() => {
    return {
      accept: 'image/*',
      showUploadList: false,
      customRequest: async ({ file, onSuccess, onError }) => {
        setUploading(true);
        try {
          const up = await uploadBannerImage(file);
          const url = up.data?.url;
          if (!url) throw new Error('上传失败');
          await createBanner({
            title: file?.name ? String(file.name) : 'Banner',
            image_url: url,
            link_url: null,
            position: 'home',
            sort_order: 0,
            status: 'active',
          });
          message.success('Banner 上传成功');
          await fetchBanners();
          onSuccess?.({}, file);
        } catch (e) {
          onError?.(e);
        } finally {
          setUploading(false);
        }
      },
    };
  }, []);

  return (
    <div className="page-container fade-in">
      <h2 className="font-serif brand-heading-md" style={{ marginBottom: 24 }}>Banner 配置</h2>
      
      <Card className="brand-card" title="首页轮播图">
        <div style={{ marginBottom: 16 }}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />} loading={uploading}>上传新图片</Button>
          </Upload>
        </div>
        
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={banners}
          loading={loading}
          renderItem={item => (
            <List.Item>
              <Card 
                cover={<img alt={item.title || 'Banner'} src={item.image_url} style={{ height: 150, objectFit: 'cover' }} />}
                actions={[
                  <DeleteOutlined
                    key="delete"
                    style={{ color: 'red' }}
                    onClick={async () => {
                      await deleteBanner(item.id);
                      message.success('已删除');
                      fetchBanners();
                    }}
                  />
                ]}
              >
                <Card.Meta
                  title={
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Input
                        value={item.title || ''}
                        placeholder="Banner 标题"
                        onChange={async (e) => {
                          const next = e.target.value;
                          setBanners((prev) => prev.map((b) => (b.id === item.id ? { ...b, title: next } : b)));
                        }}
                        onBlur={async (e) => {
                          await updateBanner(item.id, { title: e.target.value || '' });
                        }}
                      />
                      <Input
                        value={item.link_url || ''}
                        placeholder="跳转链接（可选）"
                        onChange={async (e) => {
                          const next = e.target.value;
                          setBanners((prev) => prev.map((b) => (b.id === item.id ? { ...b, link_url: next } : b)));
                        }}
                        onBlur={async (e) => {
                          await updateBanner(item.id, { link_url: e.target.value || null });
                        }}
                      />
                    </Space>
                  }
                  description={
                    <Space size={12}>
                      <span style={{ color: 'var(--text-secondary)' }}>启用</span>
                      <Switch
                        checked={item.status === 'active'}
                        onChange={async (checked) => {
                          const status = checked ? 'active' : 'inactive';
                          setBanners((prev) => prev.map((b) => (b.id === item.id ? { ...b, status } : b)));
                          await updateBanner(item.id, { status });
                        }}
                      />
                    </Space>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default BannerSettings;
