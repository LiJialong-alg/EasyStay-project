import React, { useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Button } from 'antd';
import { 
  UserOutlined, 
  BankOutlined, 
  TransactionOutlined, 
  RiseOutlined, 
  AuditOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats] = useState({
    gmv: 1258000,
    revenue: 125800, // 10% commission
    merchants: 128,
    users: 4520,
    pendingHotels: 3,
    pendingWithdrawals: 5
  });

  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } }
    },
    series: [
      {
        name: '平台交易额',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: { width: 3, color: '#722ed1' },
        showSymbol: false,
        areaStyle: { opacity: 0.1, color: '#722ed1' },
        emphasis: { focus: 'series' },
        data: [12000, 13200, 10100, 13400, 9000, 23000, 21000]
      }
    ]
  };

  const pendingTasks = [];

  return (
    <div className="page-container fade-in">
      <h2 className="font-serif brand-heading-lg" style={{ marginBottom: 24 }}>平台概览</h2>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="brand-card" bodyStyle={{ padding: 20 }}>
            <Statistic 
              title="累计交易额 (GMV)" 
              value={stats.gmv} 
              prefix={<TransactionOutlined />} 
              precision={2}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="brand-card" bodyStyle={{ padding: 20 }}>
            <Statistic 
              title="平台累计营收" 
              value={stats.revenue} 
              prefix={<RiseOutlined />} 
              precision={2}
              valueStyle={{ color: '#10b981', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="brand-card" bodyStyle={{ padding: 20 }}>
            <Statistic 
              title="入驻商家总数" 
              value={stats.merchants} 
              prefix={<BankOutlined />} 
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="brand-card" bodyStyle={{ padding: 20 }}>
            <Statistic 
              title="注册用户总数" 
              value={stats.users} 
              prefix={<UserOutlined />} 
              valueStyle={{ color: '#0f172a', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card className="brand-card" title="近7日交易趋势" bordered={false} style={{ marginBottom: 24 }}>
            <ReactECharts option={chartOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card className="brand-card" title="待办事项" bordered={false}>
            <List
              dataSource={pendingTasks}
              locale={{ emptyText: '暂无待办事项' }}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<AuditOutlined style={{ fontSize: 20, color: '#722ed1' }} />}
                    title={item.title}
                    description={item.time}
                  />
                  <Button size="small" type="primary" ghost onClick={() => {
                      if(item.type === 'hotel') navigate('/admin/hotel/list');
                      if(item.type === 'finance') navigate('/admin/finance/withdrawals');
                  }}>处理</Button>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
