import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Statistic, DatePicker } from 'antd';
import { DollarOutlined, AreaChartOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { getTransactions } from '../../../services/financeService';

const { RangePicker } = DatePicker;

const PlatformReport = () => {
  const [range, setRange] = useState([dayjs().subtract(6, 'day'), dayjs()]);
  const [stats, setStats] = useState({ totalFlow: 0, platformRevenue: 0 });
  const [series, setSeries] = useState([]);
  const [xAxis, setXAxis] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      if (!range || range.length !== 2) return;
      const start = range[0].startOf('day');
      const end = range[1].endOf('day');
      const res = await getTransactions({
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        type: 'income',
        status: 'success',
      });
      const list = res.data || [];
      const totalFlow = list.reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const platformRevenue = totalFlow * 0.1;

      const days = [];
      const dayTotals = new Map();
      let cursor = start.startOf('day');
      while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
        const key = cursor.format('YYYY-MM-DD');
        days.push({ key, label: cursor.format('MM-DD') });
        dayTotals.set(key, 0);
        cursor = cursor.add(1, 'day');
      }
      for (const t of list) {
        const key = dayjs(t.timestamp).format('YYYY-MM-DD');
        if (!dayTotals.has(key)) continue;
        dayTotals.set(key, dayTotals.get(key) + Number(t.amount || 0));
      }

      setStats({ totalFlow, platformRevenue });
      setXAxis(days.map((d) => d.label));
      setSeries(days.map((d) => Number(dayTotals.get(d.key) || 0)));
    };
    fetch();
  }, [range]);

  const chartOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxis
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '平台流水',
        type: 'bar',
        barWidth: '40%',
        data: series,
        itemStyle: { color: '#722ed1', borderRadius: [4, 4, 0, 0] }
      }
    ]
  }), [series, xAxis]);

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="font-serif brand-heading-md">资金报表</h2>
        <RangePicker value={range} onChange={(v) => v && setRange(v)} allowClear={false} />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card className="brand-card">
            <Statistic 
              title="期间总流水" 
              value={stats.totalFlow} 
              precision={2} 
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className="brand-card">
            <Statistic 
              title="平台净营收 (佣金)" 
              value={stats.platformRevenue} 
              precision={2} 
              prefix={<AreaChartOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="brand-card" title="流水趋势">
        <ReactECharts option={chartOption} style={{ height: 400 }} />
      </Card>
    </div>
  );
};

export default PlatformReport;
