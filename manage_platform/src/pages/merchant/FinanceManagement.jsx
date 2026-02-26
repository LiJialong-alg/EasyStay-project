import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, DatePicker, Select, Tag, Statistic, Space, message } from 'antd';
import { PayCircleOutlined, DownloadOutlined, DollarOutlined, TransactionOutlined, BankOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFinanceSummary, getTransactions } from '../../services/financeService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FinanceManagement = () => {
  const [summary, setSummary] = useState({ monthIncome: 0, unsettled: 0, withdrawn: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: null, endDate: null, type: 'all', status: 'all' });

  useEffect(() => {
      fetchSummary();
      fetchTransactions();
  }, [filters]);

  const fetchSummary = async () => {
      try {
          const res = await getFinanceSummary();
          setSummary(res.data);
      } catch (error) {
          // handled
      }
  };

  const fetchTransactions = async () => {
      setLoading(true);
      try {
          const params = {
              ...filters,
              startDate: filters.startDate ? filters.startDate.format('YYYY-MM-DD') : undefined,
              endDate: filters.endDate ? filters.endDate.format('YYYY-MM-DD') : undefined,
          };
          const res = await getTransactions(params);
          const list = res.data.map(t => ({
              key: t.id,
              id: `TRX${t.id}`, // Mock TRX ID format
              date: dayjs(t.timestamp).format('YYYY-MM-DD HH:mm'),
              type: t.type,
              amount: t.amount,
              status: t.status,
              category: t.type === 'income' ? '订单收入' : t.type === 'refund' ? '订单退款' : '提现', // Simple category mapping
              method: 'System' // Mock method
          }));
          setTransactions(list);
      } catch (error) {
          // handled
      } finally {
          setLoading(false);
      }
  };

  const columns = [
    { title: '交易单号', dataIndex: 'id', key: 'id', render: text => <span className="font-mono">{text}</span> },
    { title: '交易时间', dataIndex: 'date', key: 'date' },
    { title: '类型', dataIndex: 'type', key: 'type', render: type => <Tag color={type === 'income' ? 'success' : type === 'refund' ? 'error' : 'default'}>{type === 'income' ? '收入' : type === 'refund' ? '退款' : '提现'}</Tag> },
    { title: '类目', dataIndex: 'category', key: 'category' },
    { 
        title: '金额', 
        dataIndex: 'amount', 
        key: 'amount', 
        render: (amount, record) => (
            <span style={{ color: record.type === 'income' ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>
                {record.type === 'income' ? '+' : '-'}{Math.abs(amount).toFixed(2)}
            </span>
        ) 
    },
    { title: '状态', dataIndex: 'status', key: 'status', render: status => <Tag color={status === 'success' ? 'green' : 'orange'}>{status === 'success' ? '成功' : '处理中'}</Tag> },
  ];

  return (
    <div className="page-container fade-in">
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-serif brand-heading-lg" style={{ margin: 0 }}>财务管理</h2>
            <Space>
                <RangePicker 
                    className="brand-input" 
                    onChange={(dates) => setFilters(prev => ({ ...prev, startDate: dates ? dates[0] : null, endDate: dates ? dates[1] : null }))}
                />
                <Button icon={<DownloadOutlined />} className="brand-btn-default">导出报表</Button>
            </Space>
        </div>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
                <Card className="brand-card" bodyStyle={{ padding: 20 }}>
                    <Statistic 
                        title={<span className="brand-text-secondary">本月总收入</span>}
                        value={summary.monthIncome}
                        precision={2}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="brand-card" bodyStyle={{ padding: 20 }}>
                    <Statistic 
                        title={<span className="brand-text-secondary">待结算金额</span>}
                        value={summary.unsettled}
                        precision={2}
                        prefix={<TransactionOutlined />}
                        valueStyle={{ color: 'var(--brand-accent)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="brand-card" bodyStyle={{ padding: 20 }}>
                    <Statistic 
                        title={<span className="brand-text-secondary">累计提现</span>}
                        value={summary.withdrawn}
                        precision={2}
                        prefix={<BankOutlined />}
                        valueStyle={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className="brand-card" bodyStyle={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                        <div>
                            <div className="brand-text-secondary" style={{ marginBottom: 4 }}>账户余额</div>
                            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)' }}>¥ {summary.balance.toFixed(2)}</div>
                        </div>
                        <Button type="primary" className="brand-btn-primary">提现</Button>
                    </div>
                </Card>
            </Col>
        </Row>

        {/* Transactions Table */}
        <Card className="brand-card" bordered={false} title={<span className="font-serif brand-heading-md">交易明细</span>} extra={
            <Space>
                <Select defaultValue="all" className="brand-select" style={{ width: 120 }} onChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
                    <Option value="all">全部类型</Option>
                    <Option value="income">收入</Option>
                    <Option value="refund">退款</Option>
                    <Option value="withdrawal">提现</Option>
                </Select>
                <Select defaultValue="all" className="brand-select" style={{ width: 120 }} onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
                    <Option value="all">全部状态</Option>
                    <Option value="success">成功</Option>
                    <Option value="pending">处理中</Option>
                </Select>
            </Space>
        }>
            <Table loading={loading} columns={columns} dataSource={transactions} pagination={{ pageSize: 10 }} size="middle" />
        </Card>
    </div>
  );
};

export default FinanceManagement;
