import React, { useState, useEffect } from 'react';
/**
 * @component Analytics
 * @description 数据中心页面
 * @features
 * 1. 展示10个核心数据图表
 * 2. 包含：提前预订趋势、24h下单热力、连住天数、来源地、单单房量、性别、年龄、新老客、本异地、出行时间
 */
import { Card, Row, Col, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
// import * as echarts from 'echarts';
import { getAnalyticsOverview } from '../../services/analyticsService';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const res = await getAnalyticsOverview();
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

  const commonTextStyle = { color: '#64748b', fontFamily: 'Plus Jakarta Sans, serif', fontSize: 12 };
  
  // Chart 1: Gender (Pie)
  const genderOption = {
      // title: { text: '性别比例', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'item' },
      color: ['#0f172a', '#d97706'],
      series: [
          {
              type: 'pie',
              radius: '60%',
              data: [
                  { value: data.gender.male, name: '男性' },
                  { value: data.gender.female, name: '女性' },
              ],
              label: { show: true, formatter: '{b}: {d}%', fontSize: 11 }
          }
      ]
  };

  // Chart 2: Age (Bar)
  const ageOption = {
      // title: { text: '年龄分布', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 20, bottom: 20, left: 30, right: 10, containLabel: true },
      xAxis: { type: 'category', data: data.age.buckets, axisLabel: commonTextStyle, axisLine: { show: false }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLabel: commonTextStyle, splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } } },
      series: [{ 
          data: data.age.values, 
          type: 'bar', 
          barWidth: '40%',
          itemStyle: { color: '#0f172a', borderRadius: [2, 2, 0, 0] }
      }]
  };

  // Chart 3: New vs Old (Donut)
  const newOldOption = {
      // title: { text: '新老客分布', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'item' },
      series: [
          {
              type: 'pie',
              radius: ['40%', '70%'],
              itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
              label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
              data: [
                  { value: data.newOld.new, name: '新客', itemStyle: { color: '#d97706' } },
                  { value: data.newOld.old, name: '老客', itemStyle: { color: '#0f172a' } }
              ]
          }
      ]
  };

  // Chart 4: Source Origin (Horizontal Bar)
  const originOption = {
      // title: { text: '来源地排行 (Top 3)', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 20, bottom: 20, left: 10, right: 30, containLabel: true },
      xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
      yAxis: { type: 'category', data: data.originTop3.map(i => i.city), axisLabel: commonTextStyle, axisLine: { show: false }, axisTick: { show: false } },
      series: [
          {
              type: 'bar',
              data: data.originTop3.map(i => i.value),
              barWidth: '40%',
              itemStyle: { color: '#475569', borderRadius: [0, 2, 2, 0] },
              label: { show: true, position: 'right', formatter: '{c}', fontSize: 11 }
          }
      ]
  };

  // Chart 5: Local vs Non-local (Pie)
  const localOption = {
      // title: { text: '本异地分布', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'item' },
      color: ['#334155', '#fbbf24'],
      series: [
          {
              type: 'pie',
              radius: '60%',
              data: [
                  { value: data.localVsRemote.local, name: '本地' },
                  { value: data.localVsRemote.remote, name: '异地' }
              ],
              label: { show: true, formatter: '{b}: {d}%', fontSize: 11 }
          }
      ]
  };

  // Chart 6: Travel Time (Pie)
  const travelTimeOption = {
      // title: { text: '出行时间偏好', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'item' },
      color: ['#0f172a', '#d97706'],
      series: [
          {
              type: 'pie',
              radius: '60%',
              data: [
                  { value: data.travelTimePref.workday, name: '工作日' },
                  { value: data.travelTimePref.holiday, name: '节假日' }
              ],
              label: { show: true, formatter: '{b}: {d}%', fontSize: 11 }
          }
      ]
  };

  // Chart 7: Advance Booking (Bar)
  const advanceOption = {
      // title: { text: '提前预订天数', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 20, bottom: 20, left: 30, right: 10, containLabel: true },
      xAxis: { type: 'category', data: data.advanceBooking.buckets, axisLabel: { ...commonTextStyle, interval: 0, fontSize: 10 }, axisLine: { show: false }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLabel: commonTextStyle, splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } } },
      series: [
          { 
              type: 'bar', 
              data: data.advanceBooking.values,
              barWidth: '50%',
              itemStyle: { 
                  color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#0f172a' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#334155' // 100% 处的颜色
                    }],
                    global: false // 缺省为 false
                  },
                  borderRadius: [2, 2, 0, 0]
              }
          }
      ]
  };

  // Chart 8: Stay Duration (Bar)
  const stayDurationOption = {
      // title: { text: '连住天数', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 20, bottom: 20, left: 30, right: 10, containLabel: true },
      xAxis: { type: 'category', data: data.stayDuration.buckets, axisLabel: commonTextStyle, axisLine: { show: false }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLabel: commonTextStyle, splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } } },
      series: [{
          data: data.stayDuration.values,
          type: 'bar',
          barWidth: '40%',
          itemStyle: { color: '#fbbf24', borderRadius: [2, 2, 0, 0] },
          label: { show: true, position: 'top', color: '#d97706', fontSize: 11 }
      }]
  };

  // Chart 9: Order Time Distribution (Line)
  const orderTimeOption = {
      // title: { text: '下单时间分布 (24h)', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      grid: { top: 20, bottom: 20, left: 30, right: 20, containLabel: true },
      xAxis: { 
          type: 'category', 
          boundaryGap: false,
          data: data.orderTime24h.map(i => `${i.hour}`), 
          axisLabel: { ...commonTextStyle, interval: 3 },
          axisLine: { show: false }, 
          axisTick: { show: false }
      },
      yAxis: { type: 'value', axisLabel: commonTextStyle, splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } } },
      series: [{
          data: data.orderTime24h.map(i => i.value),
          type: 'line',
          smooth: true,
          areaStyle: {
            color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                    offset: 0, color: 'rgba(217, 119, 6, 0.3)' // 0% 处的颜色
                }, {
                    offset: 1, color: 'rgba(217, 119, 6, 0)' // 100% 处的颜色
                }],
                global: false // 缺省为 false
            }
          },
          itemStyle: { color: '#d97706' },
          symbol: 'none'
      }]
  };

  // Chart 10: Room Count Per Order (Pie)
  const roomCountOption = {
      // title: { text: '单单房量', left: 'center', textStyle: { fontFamily: 'Playfair Display, serif', color: '#0f172a', fontSize: 14 } },
      tooltip: { trigger: 'item' },
      color: ['#0f172a', '#334155', '#64748b'],
      series: [
          {
              type: 'pie',
              radius: ['40%', '70%'],
              roseType: 'area',
              data: [
                  { value: data.roomsPerOrder.one, name: '1间' },
                  { value: data.roomsPerOrder.two, name: '2间' },
                  { value: data.roomsPerOrder.many, name: '多间' }
              ],
              label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 }
          }
      ]
  };

  const ChartCard = ({ title, option, height = 250 }) => (
      <Card className="brand-card" hoverable bodyStyle={{ padding: 10 }}>
          <ReactECharts option={option} style={{ height }} />
          <div className="brand-heading-sm" style={{ textAlign: 'center', marginTop: 10, color: '#64748b', fontSize: 14 }}>{title}</div>
      </Card>
  );

  return (
    <div className="page-container fade-in">
        <h2 className="font-serif brand-heading-lg" style={{ marginBottom: 16 }}>数据中心</h2>
        
        {/* Row 1: Key Performance Indicators (Big Charts) */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} lg={16}>
                <ChartCard title="提前预订趋势" option={advanceOption} height={350} />
            </Col>
            <Col xs={24} lg={8}>
                <ChartCard title="24h 下单热力" option={orderTimeOption} height={350} />
            </Col>
        </Row>

        {/* Row 2: Secondary Metrics (Medium Charts) */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
             <Col xs={24} md={12}>
                <ChartCard title="连住天数分布" option={stayDurationOption} />
            </Col>
            <Col xs={24} md={6}>
                <ChartCard title="来源地 Top 3" option={originOption} />
            </Col>
            <Col xs={24} md={6}>
                <ChartCard title="单单房量" option={roomCountOption} />
            </Col>
        </Row>

        {/* Row 3: User Demographics (Mixed Sizes) */}
        <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={10}>
                <ChartCard title="性别比例" option={genderOption} height={200} />
            </Col>
            <Col xs={24} md={12} lg={14}>
                <ChartCard title="年龄分布" option={ageOption} height={200} />
            </Col>
            
            <Col xs={24} md={8}>
                <ChartCard title="新老客分布" option={newOldOption} height={180} />
            </Col>
            <Col xs={24} md={16}>
                <ChartCard title="出行时间偏好" option={travelTimeOption} height={180} />
            </Col>
        </Row>
    </div>
  );
};

export default Analytics;
