import React, { useState, useEffect } from 'react';
/**
 * @component Dashboard
 * @description 商家端首页看板
 * @features
 * 1. 核心指标展示（营收、PV、入住率、待办）
 * 2. 营收趋势图表
 * 3. 待办事项列表
 * 4. 门店状态概览
 * 5. 快捷入口导航
 * 6. 平台公告展示
 * 7. 今日日程管理（支持增删改）
 */
import { Card, Row, Col, Typography, Button, Tabs, List, Tag, Avatar, Statistic, Badge, Modal, Form, Input, Select, TimePicker, message, Popconfirm, Spin } from 'antd';
import { 
  BellOutlined, 
  RightOutlined, 
  RiseOutlined, 
  FallOutlined, 
  UserOutlined, 
  CalendarOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import ReactECharts from 'echarts-for-react';
// import * as echarts from 'echarts'; // Removed to prevent "echarts is not defined" if package is missing or bundling issues
import { getDashboardStats, getRevenueChart, getSchedules, addSchedule, updateSchedule, deleteSchedule } from '../../services/dashboardService';
import { getHotels } from '../../services/hotelService';
import { getOrders } from '../../services/orderService';
import { getAnnouncements } from '../../services/announcementService';

dayjs.extend(customParseFormat);

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Custom Metric Card Component
const MetricCard = ({ title, value, trend, trendValue, icon, color }) => (
  <div style={{ 
    background: '#fff', 
    padding: 16, 
    borderRadius: 'var(--radius-md)', 
    border: '1px solid var(--brand-border)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
    overflow: 'hidden'
  }} className="hover-lift">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div>
        <div className="brand-text-secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 32, fontFamily: 'var(--font-serif)', color: 'var(--brand-primary)', fontWeight: 700, lineHeight: 1 }}>{value}</div>
      </div>
      <div style={{ 
        width: 48, height: 48, 
        borderRadius: '50%', 
        background: `${color}15`, 
        color: color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20
      }}>
        {icon}
      </div>
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 13 }}>
      <span style={{ 
        color: trend === 'up' ? '#10b981' : '#ef4444', 
        fontWeight: 600, 
        display: 'flex', alignItems: 'center',
        background: trend === 'up' ? '#ecfdf5' : '#fef2f2',
        padding: '2px 8px',
        borderRadius: 100,
        marginRight: 8
      }}>
        {trend === 'up' ? <RiseOutlined style={{ marginRight: 4 }} /> : <FallOutlined style={{ marginRight: 4 }} />}
        {trendValue}
      </span>
      <span className="brand-text-secondary">较昨日</span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
      revenue: 0,
      revenueGrowth: 0,
      pv: 0,
      occupancy: 0,
      pendingOrders: 0
  });
  const [scheduleList, setScheduleList] = useState([]);
  const [hotelList, setHotelList] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState({ dates: [], values: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [announcementVisible, setAnnouncementVisible] = useState(false);
  const [announcementMinimized, setAnnouncementMinimized] = useState(false);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const [chartPeriod, setChartPeriod] = useState('week');

  useEffect(() => {
      fetchDashboardData();
  }, []);
  
  useEffect(() => {
      fetchRevenueChart(chartPeriod);
  }, [chartPeriod]);

  const fetchDashboardData = async () => {
      setLoading(true);
      try {
          const [statsRes, schedulesRes, hotelsRes, ordersRes, announcementsRes] = await Promise.all([
              getDashboardStats(),
              getSchedules(),
              getHotels(),
              getOrders({ status: 'pending', page: 1, pageSize: 5 }),
              getAnnouncements({ role: 'merchant', status: 'published' })
          ]);

          if (statsRes && statsRes.data) {
              setStats(statsRes.data);
          }
          if (schedulesRes && schedulesRes.data) {
              setScheduleList(schedulesRes.data);
          }
          if (hotelsRes && hotelsRes.data) {
              setHotelList(hotelsRes.data);
          }
          if (announcementsRes && announcementsRes.data) {
              setAnnouncements(announcementsRes.data);
          }
          
          // Format pending orders for the list
          if (ordersRes && ordersRes.data && ordersRes.data.list) {
            const formattedTasks = ordersRes.data.list.map(order => ({
                title: '新的预订申请',
                desc: `${order.customer_name} · ${order.room_count}间 · ¥${order.total_amount}`,
                time: dayjs(order.createdAt).format('HH:mm'),
                type: 'order',
                id: order.id
            }));
            setPendingTasks(formattedTasks);
            // Sync pending orders count with list length to ensure consistency
            setStats(prev => ({
                ...prev,
                pendingOrders: ordersRes.data.total || formattedTasks.length
            }));
          }
          
      } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          message.error("获取数据失败，请检查网络或后端服务");
      } finally {
          setLoading(false);
      }
  };

  const fetchRevenueChart = async (period) => {
      try {
          const chartRes = await getRevenueChart({ period });
          if (chartRes && chartRes.data) {
              setRevenueChartData({
                  dates: chartRes.data.x,
                  values: chartRes.data.y
              });
          }
      } catch (error) {
          console.error("Failed to fetch chart data:", error);
      }
  };

  const handleAddSchedule = () => {
      setEditingItem(null);
      form.resetFields();
      setIsModalVisible(true);
  };

  const handleEditSchedule = (item) => {
      setEditingItem(item);
      form.setFieldsValue({
          time: dayjs(item.event_time, 'HH:mm'),
          event: item.event_content,
          loc: item.location,
          type: item.type
      });
      setIsModalVisible(true);
  };

  const handleDeleteSchedule = async (id) => {
      try {
          await deleteSchedule(id);
          setScheduleList(prev => prev.filter(item => item.id !== id));
          message.success('已删除日程');
      } catch (error) {
          // Error handled by interceptor
      }
  };

  const handleSaveSchedule = () => {
      form.validateFields().then(async values => {
          const formattedTime = values.time.format('HH:mm');
          const payload = {
              ...values,
              time: formattedTime
          };
          
          try {
              if (editingItem) {
                  const res = await updateSchedule(editingItem.id, payload);
                  setScheduleList(prev => prev.map(item => item.id === editingItem.id ? res.data : item));
                  message.success('日程更新成功');
              } else {
                  const res = await addSchedule(payload);
                  setScheduleList(prev => [...prev, res.data].sort((a, b) => a.event_time.localeCompare(b.event_time)));
                  message.success('日程添加成功');
              }
              setIsModalVisible(false);
          } catch (error) {
              // Error handled by interceptor
          }
      });
  };

  // Chart Option for Sales Trend
  const salesOption = {
      grid: { top: 20, right: 20, bottom: 20, left: 40, containLabel: true },
      tooltip: { trigger: 'axis' },
      xAxis: { 
          type: 'category', 
          data: revenueChartData.dates.length > 0 ? revenueChartData.dates : ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#64748b' }
      },
      yAxis: { 
          type: 'value', 
          splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } },
          axisLabel: { color: '#64748b' }
      },
      series: [{
          data: revenueChartData.values.length > 0 ? revenueChartData.values : [0, 0, 0, 0, 0, 0, 0],
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#d97706', borderColor: '#fff', borderWidth: 2 },
          lineStyle: { width: 3, color: '#d97706' },
          areaStyle: {
              // Use plain object for gradient instead of new echarts.graphic.LinearGradient to avoid dependency issues
              color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [{
                      offset: 0, color: 'rgba(217, 119, 6, 0.2)' // 0% 处的颜色
                  }, {
                      offset: 1, color: 'rgba(217, 119, 6, 0)' // 100% 处的颜色
                  }],
                  global: false // 缺省为 false
              }
          }
      }]
  };

  if (loading) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  return (
    <div className="page-container fade-in" style={{ paddingBottom: 40 }}>
      {/* 1. Hero Welcome Section */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="font-serif brand-heading-lg" style={{ fontSize: 24, marginBottom: 0 }}>欢迎回来，店长</h1>
          <Text className="brand-text-secondary" style={{ fontSize: 13 }}>这里是您今天的经营概况，祝您生意兴隆。</Text>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="今日总营收" 
            value={`¥ ${Number(stats.revenue).toLocaleString()}`} 
            trend={Number(stats.revenueGrowth) >= 0 ? "up" : "down"} 
            trendValue={`${Math.abs(stats.revenueGrowth)}%`} 
            icon={<ShoppingOutlined />} 
            color="#d97706" 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="今日浏览量 (PV)" 
            value={stats.pv.toLocaleString()} 
            trend="up" 
            trendValue="8.2%" 
            icon={<UserOutlined />} 
            color="#0f172a" 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="实时入住率" 
            value={`${stats.occupancy}%`} 
            trend="down" 
            trendValue="2.1%" 
            icon={<CheckCircleOutlined />} 
            color="#10b981" 
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard 
            title="待处理订单" 
            value={stats.pendingOrders} 
            trend={stats.pendingOrders > 5 ? "up" : "down"} 
            trendValue={stats.pendingOrders > 0 ? `+${stats.pendingOrders}` : "0"} 
            icon={<BellOutlined />} 
            color="#ef4444" 
          />
        </Col>
      </Row>

      {/* 3. Main Content Area: Charts & Lists */}
      <Row gutter={16}>
        {/* Left Column: Revenue & Tasks & Status */}
        <Col xs={24} lg={16}>
          {/* Revenue Chart */}
          <div style={{ marginBottom: 12 }}>
            <div className="brand-card" style={{ padding: 12, background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-border)', height: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 className="font-serif brand-heading-md" style={{ margin: 0, fontSize: 16 }}>营收趋势</h3>
                <Tabs
                  activeKey={chartPeriod}
                  onChange={setChartPeriod}
                  size="small"
                  className="brand-tabs-small"
                  style={{ marginBottom: -10, transform: 'scale(0.9)', transformOrigin: 'right center' }}
                >
                  <TabPane tab="本周" key="week" />
                  <TabPane tab="本月" key="month" />
                  <TabPane tab="全年" key="year" />
                </Tabs>
              </div>
              <ReactECharts option={salesOption} style={{ height: 190 }} />
            </div>
          </div>

          <Row gutter={16}>
            {/* Pending Tasks List (Shrunk to half width) */}
            <Col xs={24} lg={12}>
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, height: 24 }}>
                        <h3 className="font-serif brand-heading-md" style={{ margin: 0, fontSize: 16 }}>待办事项</h3>
                        <Button type="link" size="small" className="brand-text-accent" onClick={() => navigate('/merchant/order/list')}>查看全部 <RightOutlined /></Button>
                    </div>
                    <div style={{ height: 300, overflowY: 'auto' }}>
                    <List
                        className="brand-list"
                        itemLayout="horizontal"
                        dataSource={pendingTasks}
                        renderItem={item => (
                            <List.Item style={{ 
                                background: '#fff', 
                                padding: '10px 12px', 
                                marginBottom: 8, 
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--brand-border)',
                                transition: 'all 0.2s'
                            }} className="hover-lift">
                                <List.Item.Meta
                                    avatar={
                                        <Avatar 
                                            icon={<ShoppingOutlined />} 
                                            style={{ 
                                                backgroundColor: '#ecfdf5', 
                                                color: '#10b981',
                                                borderRadius: 6
                                            }} 
                                            size={28}
                                        />
                                    }
                                    title={<span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-primary)' }}>{item.title}</span>}
                                    description={<span className="brand-text-secondary" style={{ fontSize: 11 }}>{item.desc}</span>}
                                />
                                <div style={{ textAlign: 'right', minWidth: 60 }}>
                                    <div className="brand-text-secondary" style={{ fontSize: 11, marginBottom: 2 }}><ClockCircleOutlined /> {item.time}</div>
                                    <Button size="small" type="primary" className="brand-btn-primary" style={{ fontSize: 11, height: 22, padding: '0 6px' }} onClick={() => navigate('/merchant/order/list')}>
                                        处理
                                    </Button>
                                </div>
                            </List.Item>
                        )}
                    />
                    </div>
                </div>
            </Col>

            {/* Hotel Status (Aligned with Tasks) */}
            <Col xs={24} lg={12}>
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, height: 24 }}>
                        <h3 className="font-serif brand-heading-md" style={{ marginBottom: 0, fontSize: 16 }}>门店状态</h3>
                    </div>
                    <div className="brand-card" style={{ background: '#fff', padding: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--brand-border)', height: 300, overflowY: 'auto' }}>
                        {hotelList.map((hotel, index) => (
                            <div key={hotel.id} style={{ 
                                padding: '12px 16px', 
                                borderBottom: index !== hotelList.length - 1 ? '1px solid var(--brand-border)' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--brand-primary)', marginBottom: 2, fontSize: 13 }}>{hotel.name}</div>
                                    <div className="brand-text-secondary" style={{ fontSize: 11 }}>评分: {hotel.rating}</div>
                                </div>
                                {!hotel.listed ? (
                                  <Tag color="red" style={{ margin: 0, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>
                                    平台已下线
                                  </Tag>
                                ) : (
                                  <Tag color={hotel.status === 'operating' ? '#0f172a' : 'default'} style={{ margin: 0, borderRadius: 4, padding: '2px 8px', fontSize: 11 }}>
                                      {hotel.status === 'operating' ? '营业中' : '休息中'}
                                  </Tag>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Col>
          </Row>
        </Col>

        {/* Right Column: Quick Actions & Notices & Schedule */}
        <Col xs={24} lg={8}>
          <div style={{ height: 240, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="brand-card" style={{ padding: 10, background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-border)', height: 82 }}>
              <Row gutter={[8, 8]}>
                {[
                  { label: '房态管理', icon: <CalendarOutlined />, color: '#0f172a', path: '/merchant/room/calendar' },
                  { label: '活动报名', icon: <RiseOutlined />, color: '#d97706', path: '/merchant/marketing/campaigns' },
                  { label: '住客登记', icon: <UserOutlined />, color: '#10b981', path: '/merchant/order/list' },
                  { label: '财务报表', icon: <ShoppingOutlined />, color: '#6366f1', path: '/merchant/finance' },
                ].map(action => (
                  <Col span={6} key={action.label}>
                    <div
                      style={{
                        background: '#fff',
                        padding: '8px 6px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--brand-border)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        height: 58,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                      className="hover-lift"
                      onClick={() => navigate(action.path)}
                    >
                      <div style={{ fontSize: 18, color: action.color, lineHeight: 1 }}>{action.icon}</div>
                      <div style={{ fontWeight: 600, color: 'var(--brand-primary)', fontSize: 11, marginTop: 6, whiteSpace: 'nowrap', lineHeight: 1 }}>{action.label}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            <div className="brand-card" style={{ background: '#fff', padding: 10, borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-border)', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, height: 24 }}>
                <h3 className="font-serif brand-heading-md" style={{ margin: 0, fontSize: 14 }}>平台公告</h3>
                <Tag color="#ef4444" style={{ fontSize: 10, lineHeight: '16px', height: 16, padding: '0 4px' }}>NEW</Tag>
              </div>
              <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                <List
                  size="small"
                  split={false}
                  dataSource={announcements}
                  locale={{ emptyText: <span className="brand-text-secondary">暂无公告</span> }}
                  renderItem={item => (
                    <List.Item
                      style={{ padding: '6px 0', cursor: 'pointer' }}
                      onClick={() => {
                        setActiveAnnouncement(item);
                        setAnnouncementVisible(true);
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {item.type === 'activity' && <Tag color="gold" style={{ marginRight: 6, fontSize: 10, lineHeight: '16px', height: 16, padding: '0 4px' }}>活动</Tag>}
                        {item.type === 'maintenance' && <Tag color="red" style={{ marginRight: 6, fontSize: 10, lineHeight: '16px', height: 16, padding: '0 4px' }}>维护</Tag>}
                        {item.type === 'feature' && <Tag color="blue" style={{ marginRight: 6, fontSize: 10, lineHeight: '16px', height: 16, padding: '0 4px' }}>功能</Tag>}
                        {(!item.type || item.type === 'notification') && <Tag style={{ marginRight: 6, fontSize: 10, lineHeight: '16px', height: 16, padding: '0 4px' }}>通知</Tag>}
                        <Typography.Text ellipsis style={{ flex: 1, color: 'var(--brand-primary)', fontSize: 12 }}>{item.title}</Typography.Text>
                        <span className="brand-text-secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                          {dayjs(item.published_at || item.createdAt).format('MM-DD')}
                        </span>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Editable Calendar Module */}
          <div style={{ marginBottom: 12 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, height: 24 }}>
                <h3 className="font-serif brand-heading-md" style={{ margin: 0, fontSize: 16 }}>今日日程</h3>
                <Button type="text" icon={<PlusOutlined />} size="small" onClick={handleAddSchedule} style={{ fontSize: 12 }}>添加</Button>
             </div>
             <div className="brand-card" style={{ background: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-border)', height: 300, overflowY: 'auto' }}>
                 <List
                    size="small"
                    split={false}
                    dataSource={scheduleList}
                    renderItem={item => (
                        <List.Item 
                            style={{ padding: '6px 0' }}
                            actions={[
                                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEditSchedule(item)} style={{ color: '#64748b' }} />,
                                <Popconfirm title="确定删除吗？" onConfirm={() => handleDeleteSchedule(item.id)}>
                                    <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} />
                                </Popconfirm>
                            ]}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <div style={{ width: 40, fontSize: 11, color: '#64748b', fontWeight: 500 }}>{item.event_time}</div>
                                <div style={{ 
                                    width: 3, 
                                    height: 24, 
                                    background: item.type === 'meeting' ? '#3b82f6' : '#10b981', 
                                    marginRight: 8,
                                    borderRadius: 2
                                }}></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: '#334155', fontWeight: 500 }}>{item.event_content}</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{item.location}</div>
                                </div>
                            </div>
                        </List.Item>
                    )}
                 />
             </div>
          </div>
        </Col>
      </Row>

      <Modal
          title={editingItem ? "编辑日程" : "添加日程"}
          open={isModalVisible}
          onOk={handleSaveSchedule}
          onCancel={() => setIsModalVisible(false)}
          okText="保存"
          cancelText="取消"
      >
          <Form form={form} layout="vertical">
              <Form.Item name="time" label="时间" rules={[{ required: true, message: '请选择时间' }]}>
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="event" label="事件内容" rules={[{ required: true, message: '请输入事件内容' }]}>
                  <Input placeholder="例如：早班例会" />
              </Form.Item>
              <Form.Item name="loc" label="地点" rules={[{ required: true, message: '请输入地点' }]}>
                  <Input placeholder="例如：会议室A" />
              </Form.Item>
              <Form.Item name="type" label="类型" initialValue="task">
                  <Select>
                      <Option value="meeting">会议 (蓝色)</Option>
                      <Option value="task">任务 (绿色)</Option>
                  </Select>
              </Form.Item>
          </Form>
      </Modal>

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>{activeAnnouncement?.title || '公告详情'}</span>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                onClick={() => {
                  setAnnouncementVisible(false);
                  setAnnouncementMinimized(true);
                }}
              >
                最小化
              </Button>
              <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                onClick={() => { setAnnouncementVisible(false); setAnnouncementMinimized(false); setActiveAnnouncement(null); }}
              >
                关闭
              </Button>
            </div>
          </div>
        }
        open={announcementVisible}
        footer={null}
        onCancel={() => { setAnnouncementVisible(false); setAnnouncementMinimized(false); setActiveAnnouncement(null); }}
        width={760}
        centered
        bodyStyle={{ maxHeight: '65vh', overflowY: 'auto' }}
      >
        <div style={{ color: 'var(--color-text-sub)', fontSize: 12, marginBottom: 12 }}>
          {activeAnnouncement ? dayjs(activeAnnouncement.published_at || activeAnnouncement.createdAt).format('YYYY-MM-DD HH:mm') : ''}
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {activeAnnouncement?.content || ''}
        </div>
      </Modal>

      {announcementMinimized && activeAnnouncement && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 2100,
            background: '#0f172a',
            color: '#fff',
            borderRadius: 12,
            padding: '10px 12px',
            boxShadow: '0 12px 30px rgba(2,6,23,0.35)',
            width: 320,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeAnnouncement.title || '公告'}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                size="small"
                type="link"
                style={{ padding: 0, color: '#fff' }}
                onClick={() => { setAnnouncementMinimized(false); setAnnouncementVisible(true); }}
              >
                恢复
              </Button>
              <Button
                size="small"
                type="link"
                style={{ padding: 0, color: '#fff' }}
                onClick={() => { setAnnouncementMinimized(false); setActiveAnnouncement(null); }}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
