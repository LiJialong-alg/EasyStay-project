import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, message, Input, Spin } from 'antd';
import { SearchOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getMerchants, updateMerchantStatus } from '../../../services/adminMerchantService';

const MerchantList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const res = await getMerchants();
      setData((res.data || []).map((m) => ({ ...m, key: m.id })));
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (record) => {
    const newStatus = record.status === 'active' ? 'banned' : 'active';
    const actionText = newStatus === 'active' ? '解封' : '封禁';
    let reason = '';
    
    Modal.confirm({
      title: `确认${actionText}商家？`,
      content: (
        <div>
          <div style={{ marginBottom: 12 }}>{`确定要${actionText}商家 "${record.name}" 吗？`}</div>
          {newStatus === 'banned' && (
            <Input.TextArea rows={3} placeholder="请输入封禁原因（将同步给商家端）" onChange={(e) => { reason = e.target.value; }} />
          )}
        </div>
      ),
      onOk: async () => {
        await updateMerchantStatus(record.id, newStatus, reason);
        message.success(`已${actionText}商家 ${record.name}`);
        fetchMerchants();
      }
    });
  };

  const columns = [
    { title: '商家姓名', dataIndex: 'name', key: 'name' },
    { title: '账号', dataIndex: 'username', key: 'username' },
    { title: '旗下酒店数', dataIndex: 'hotelCount', key: 'hotelCount' },
    { title: '入驻时间', dataIndex: 'joinDate', key: 'joinDate', render: (t) => new Date(t).toLocaleDateString() },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已封禁'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">查看详情</Button>
          <Button 
            type="text" 
            danger={record.status === 'active'}
            onClick={() => toggleStatus(record)}
          >
            {record.status === 'active' ? '封禁' : '解封'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="font-serif brand-heading-md">商家列表</h2>
        <Input 
          placeholder="搜索商家姓名/手机号" 
          prefix={<SearchOutlined />} 
          style={{ width: 300, borderRadius: 20 }} 
        />
      </div>
      <div className="brand-card">
        <Table columns={columns} dataSource={data} loading={loading} />
      </div>
    </div>
  );
};

export default MerchantList;
