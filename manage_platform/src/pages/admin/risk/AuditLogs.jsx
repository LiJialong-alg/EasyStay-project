import React from 'react';
import { Table, Tag, Card, Input, DatePicker, Button, Space } from 'antd';
import { SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const AuditLogs = () => {
  const columns = [
    { title: '操作时间', dataIndex: 'time', width: 180 },
    { title: '操作人', dataIndex: 'user', width: 120, render: t => <b>{t}</b> },
    { title: 'IP地址', dataIndex: 'ip', width: 140, render: t => <span style={{ fontFamily: 'monospace' }}>{t}</span> },
    { title: '操作模块', dataIndex: 'module', width: 120 },
    { title: '操作内容', dataIndex: 'action' },
    { title: '状态', dataIndex: 'status', width: 100, render: s => <Tag color={s === 'success' ? 'green' : 'red'}>{s === 'success' ? '成功' : '失败'}</Tag> },
  ];

  const data = [
    { key: 1, time: '2023-10-27 10:30:00', user: 'Admin', ip: '192.168.1.1', module: '商家管理', action: '封禁商户 [ID: 1002]', status: 'success' },
    { key: 2, time: '2023-10-27 09:15:22', user: 'Finance', ip: '10.0.0.5', module: '提现审批', action: '驳回提现申请 [ID: 5501]', status: 'success' },
    { key: 3, time: '2023-10-26 18:20:11', user: 'System', ip: '127.0.0.1', module: '系统任务', action: '自动取消超时订单', status: 'success' },
  ];

  return (
    <div className="page-container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="brand-heading-md"><SafetyCertificateOutlined /> 风控审计日志</h2>
        <Space>
          <Input placeholder="搜索关键词" prefix={<SearchOutlined />} style={{ width: 200 }} />
          <DatePicker.RangePicker />
          <Button type="primary">查询</Button>
        </Space>
      </div>

      <Card bodyStyle={{ padding: 0 }} bordered={false}>
        <Table columns={columns} dataSource={data} pagination={{ pageSize: 20 }} size="middle" />
      </Card>
    </div>
  );
};

export default AuditLogs;