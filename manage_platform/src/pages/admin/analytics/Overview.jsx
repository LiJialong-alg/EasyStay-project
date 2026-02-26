import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Statistic } from 'antd';
import ReactECharts from 'echarts-for-react';
import { getAdminPlatformAnalytics } from '../../../services/analyticsService';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const res = await getAdminPlatformAnalytics();
              setData(res.data);
          } catch (error) {
              // handled by interceptor
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, []);

  if (loading || !data) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  const kpis = data.kpis || {};
  const themeColor = '#722ed1';

  const revenueOption = {
    grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.revenue7d?.x || [], axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } } },
    series: [{ type: 'line', smooth: true, data: data.revenue7d?.y || [], itemStyle: { color: themeColor }, areaStyle: { opacity: 0.15 } }]
  };

  const ordersOption = {
    grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: (data.orders24h || []).map(i => `${i.hour}`), axisLine: { show: false }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } } },
    series: [{ type: 'bar', data: (data.orders24h || []).map(i => i.value), itemStyle: { color: '#b37feb' }, barWidth: '50%' }]
  };

  return (
    <div className="page-container fade-in">
      <h2 className="font-serif brand-heading-lg" style={{ marginBottom: 16 }}>平台数据中心</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="累计营收" value={Number(kpis.revenueTotal || 0)} prefix="¥" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="今日营收" value={Number(kpis.revenueToday || 0)} prefix="¥" /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="订单总量" value={Number(kpis.ordersTotal || 0)} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="待处理订单" value={Number(kpis.pendingOrders || 0)} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="用户总数" value={Number(kpis.usersTotal || 0)} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="商家总数" value={Number(kpis.merchantsTotal || 0)} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="酒店总数" value={Number(kpis.hotelsTotal || 0)} /></Card></Col>
        <Col xs={24} sm={12} lg={6}><Card className="brand-card"><Statistic title="已上架酒店" value={Number(kpis.listedHotels || 0)} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="brand-card" title="近 7 天游收趋势">
            <ReactECharts option={revenueOption} style={{ height: 280 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="brand-card" title="近 24 小时下单量">
            <ReactECharts option={ordersOption} style={{ height: 280 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminAnalytics;
