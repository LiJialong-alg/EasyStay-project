import React, { useState } from 'react';
import { Table, Tag, Space, Button, Modal, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const WithdrawalAudit = () => {
  const [data, setData] = useState([
    { key: '1', merchant: '张三', amount: 5000, bank: '招商银行 (8888)', date: '2023-10-26', status: 'pending' },
  ]);

  const handleAudit = (record, action) => {
    Modal.confirm({
      title: action === 'approve' ? '确认打款' : '驳回申请',
      content: `确认${action === 'approve' ? '向' : '驳回'} "${record.merchant}" 的提现申请吗？金额: ¥${record.amount}`,
      onOk: () => {
        setData(data.filter(item => item.key !== record.key));
        message.success(`已${action === 'approve' ? '通过' : '驳回'}申请`);
      }
    });
  };

  const columns = [
    { title: '申请商户', dataIndex: 'merchant', key: 'merchant' },
    { title: '提现金额', dataIndex: 'amount', key: 'amount', render: val => <span style={{ color: '#cf1322', fontWeight: 600 }}>¥{val}</span> },
    { title: '收款账户', dataIndex: 'bank', key: 'bank' },
    { title: '申请时间', dataIndex: 'date', key: 'date' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: () => <Tag color="orange">待审批</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<CheckCircleOutlined />} 
            onClick={() => handleAudit(record, 'approve')}
          >
            打款
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<CloseCircleOutlined />} 
            onClick={() => handleAudit(record, 'reject')}
          >
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fade-in">
      <h2 className="font-serif brand-heading-md" style={{ marginBottom: 24 }}>提现审批</h2>
      <div className="brand-card">
        <Table columns={columns} dataSource={data} />
      </div>
    </div>
  );
};

export default WithdrawalAudit;