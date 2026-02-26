import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Input, Modal, Space, Table, Tag, message } from 'antd';
import { adminGetHotelRegistrationRequests, adminReviewHotelRegistrationRequest } from '../../../services/hotelRegistrationService';

const HotelRegistrationAudit = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('pending');
  const [comment, setComment] = useState('');
  const [active, setActive] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await adminGetHotelRegistrationRequests({ status });
      setItems(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const columns = useMemo(() => [
    { title: '酒店名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address', render: (v) => <span style={{ color: '#475569' }}>{v || '-'}</span> },
    {
      title: '申请状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => {
        if (v === 'pending') return <Tag color="orange">待审核</Tag>;
        if (v === 'approved') return <Tag color="green">已通过</Tag>;
        if (v === 'rejected') return <Tag color="red">已驳回</Tag>;
        return <Tag>{String(v)}</Tag>;
      }
    },
    { title: '申请说明', dataIndex: 'reason', key: 'reason', render: (v) => <span style={{ color: '#475569' }}>{v || '-'}</span> },
    {
      title: '操作',
      key: 'action',
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            disabled={r.status !== 'pending'}
            onClick={() => { setActive({ id: r.id, action: 'approve' }); setComment(''); }}
            style={{ background: '#0f172a', borderColor: '#0f172a' }}
          >
            通过
          </Button>
          <Button
            danger
            disabled={r.status !== 'pending'}
            onClick={() => { setActive({ id: r.id, action: 'reject' }); setComment(''); }}
          >
            驳回
          </Button>
        </Space>
      )
    }
  ], []);

  const onConfirm = async () => {
    if (!active) return;
    await adminReviewHotelRegistrationRequest(active.id, active.action, comment);
    message.success(active.action === 'approve' ? '已通过' : '已驳回');
    setActive(null);
    fetchData();
  };

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="font-serif brand-heading-md" style={{ margin: 0 }}>酒店注册审核</h2>
        <Space>
          <Button type={status === 'pending' ? 'primary' : 'default'} onClick={() => setStatus('pending')} style={status === 'pending' ? { background: '#0f172a', borderColor: '#0f172a' } : undefined}>待审核</Button>
          <Button type={status === 'approved' ? 'primary' : 'default'} onClick={() => setStatus('approved')} style={status === 'approved' ? { background: '#0f172a', borderColor: '#0f172a' } : undefined}>已通过</Button>
          <Button type={status === 'rejected' ? 'primary' : 'default'} onClick={() => setStatus('rejected')} style={status === 'rejected' ? { background: '#0f172a', borderColor: '#0f172a' } : undefined}>已驳回</Button>
          <Button onClick={fetchData}>刷新</Button>
        </Space>
      </div>

      <Card className="brand-card" bodyStyle={{ padding: 0 }}>
        <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={active?.action === 'approve' ? '通过注册申请' : '驳回注册申请'}
        open={Boolean(active)}
        onOk={onConfirm}
        onCancel={() => setActive(null)}
        okText="确认"
        cancelText="取消"
      >
        <div style={{ color: '#475569', marginBottom: 8 }}>可选：填写审核备注（商家端可见）</div>
        <Input.TextArea rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="例如：请补充营业执照/消防验收证明…" />
      </Modal>
    </div>
  );
};

export default HotelRegistrationAudit;

