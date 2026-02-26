import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from '../../../services/announcementService';

const Announcement = () => {
  const [data, setData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements({ role: 'admin', status: 'all' });
      setData((res.data || []).map((a) => ({ ...a, key: a.id })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    await createAnnouncement({
      title: values.title,
      type: values.type,
      content: values.content,
      target_role: values.target_role,
      status: values.status
    });
    setIsModalVisible(false);
    message.success(values.status === 'published' ? '公告已发布' : '草稿已保存');
    fetchData();
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: type => {
        const map = { activity: '活动', notification: '通知', maintenance: '维护', feature: '功能' };
        return <Tag>{map[type] || type}</Tag>;
      }
    },
    {
      title: '投放对象',
      dataIndex: 'target_role',
      key: 'target_role',
      render: t => <Tag>{t === 'all' ? '全部' : (t === 'merchant' ? '商家' : t)}</Tag>
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: status => (
        <Tag color={status === 'published' ? 'green' : 'default'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      )
    },
    { 
      title: '发布时间', 
      dataIndex: 'published_at', 
      key: 'published_at',
      render: (t) => t ? new Date(t).toLocaleString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={async () => {
              await updateAnnouncement(record.id, { status: record.status === 'published' ? 'draft' : 'published' });
              message.success(record.status === 'published' ? '已下线为草稿' : '已发布');
              fetchData();
            }}
          >
            {record.status === 'published' ? '撤回' : '发布'}
          </Button>
          <Popconfirm
            title="确定删除该公告吗？"
            okText="删除"
            cancelText="取消"
            onConfirm={async () => {
              await deleteAnnouncement(record.id);
              message.success('已删除');
              fetchData();
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="font-serif brand-heading-md">公告管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="brand-btn-primary">
          发布公告
        </Button>
      </div>
      <div className="brand-card">
        <Table columns={columns} dataSource={data} loading={loading} />
      </div>

      <Modal
        title="发布新公告"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="notification">通知</Select.Option>
              <Select.Option value="activity">活动</Select.Option>
              <Select.Option value="maintenance">维护</Select.Option>
              <Select.Option value="feature">功能</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="target_role" label="投放对象" initialValue="merchant" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="merchant">商家端</Select.Option>
              <Select.Option value="all">全部</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="发布状态" initialValue="published" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="published">立即发布</Select.Option>
              <Select.Option value="draft">保存草稿</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请输入公告内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Announcement;
