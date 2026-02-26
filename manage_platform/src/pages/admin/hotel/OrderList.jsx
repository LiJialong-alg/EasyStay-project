import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Tag, Input, DatePicker, Button, Row, Col, List, Avatar, Space, message, Select, Modal, Divider, Badge, Typography, Spin } from 'antd';
import { SearchOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getOrders } from '../../../services/orderService'; // Use real service

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const AdminOrderList = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
      fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
      setLoading(true);
      try {
          // Map admin tabs to API status
          const statusMap = {
              'all': undefined,
              'pending': 'pending',
              'active': 'checked_in',
              'new': 'pending' // Just for demo
          };
          
          const res = await getOrders({ 
              status: statusMap[activeTab],
              page: 1, 
              pageSize: 50 
          });
          
          if (res.data && res.data.list) {
              const formattedList = res.data.list.map(o => ({
                  key: o.id,
                  orderNo: `ORD${dayjs(o.createdAt || o.created_at).format('YYYYMMDD')}${String(o.id).padStart(4, '0')}`,
                  shortOrderNo: String(o.id).padStart(5, '0'),
                  customer: o.customer_name,
                  roomType: o.RoomType ? o.RoomType.name : 'Unknown Room',
                  roomImg: (o.RoomType && o.RoomType.image_url) || (o.Hotel && o.Hotel.image_url) || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&q=80',
                  dates: [o.check_in_date, o.check_out_date],
                  nights: dayjs(o.check_out_date).diff(dayjs(o.check_in_date), 'day'),
                  total: o.total_amount,
                  discount: 0,
                  actual: o.total_amount,
                  status: o.status === 'pending' ? 'pending' : o.status,
                  createTime: dayjs(o.createdAt || o.created_at).format('YYYY-MM-DD HH:mm'),
                  remark: '无',
                  hotelName: o.Hotel ? o.Hotel.name : 'Unknown Hotel' // Admin view adds Hotel Name
              }));
              setOrders(formattedList);
          }
      } catch (error) {
          console.error(error);
          message.error('获取订单列表失败');
      } finally {
          setLoading(false);
      }
  };

  const handleAction = (action) => {
    message.success(`管理端操作: ${action}`);
    // TODO: Implement actual admin actions (e.g., force cancel)
  };

  const statusMap = {
      'pending_checkin': { color: '#f59e0b', bg: '#fffbeb', text: '待入住' },
      'pending': { color: '#f59e0b', bg: '#fffbeb', text: '待处理' },
      'confirmed': { color: '#10b981', bg: '#ecfdf5', text: '已确认' },
      'pending_payment': { color: '#ef4444', bg: '#fef2f2', text: '待支付' },
      'checked_in': { color: '#3b82f6', bg: '#eff6ff', text: '在住' },
      'completed': { color: '#10b981', bg: '#ecfdf5', text: '已完成' },
      'cancelled': { color: '#64748b', bg: '#f1f5f9', text: '已取消' },
  };

  return (
    <div className="page-container fade-in" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Filter Bar */}
      <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }} size="large">
             <TabPane tab="全部订单" key="all" />
             <TabPane tab="待处理" key="pending" />
             <TabPane tab="在住中" key="active" />
        </Tabs>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space wrap size={16}>
                <Input placeholder="搜索客人姓名/订单号/酒店名" prefix={<SearchOutlined style={{ color: '#94a3b8' }} />} style={{ width: 320, borderRadius: 6 }} size="large" />
                <RangePicker size="large" style={{ borderRadius: 6 }} />
                <Button type="primary" size="large" style={{ background: '#722ed1', borderColor: '#722ed1' }}>筛选</Button>
            </Space>
        </div>
      </Card>

      {/* Split Layout */}
      <Row gutter={24} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Left: List View */}
        <Col span={8} style={{ height: '100%', overflowY: 'auto', paddingRight: 4 }}>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
            <List
                dataSource={orders}
                renderItem={item => (
                    <Card 
                        hoverable 
                        className="order-card"
                        style={{ 
                            marginBottom: 16, 
                            border: selectedOrder?.key === item.key ? '1px solid #722ed1' : '1px solid #e2e8f0',
                            borderRadius: 12,
                            boxShadow: selectedOrder?.key === item.key ? '0 4px 12px rgba(114, 46, 209, 0.1)' : 'none',
                            transition: 'all 0.2s'
                        }}
                        bodyStyle={{ padding: 16 }}
                        onClick={() => setSelectedOrder(item)}
                    >
                        <div style={{ display: 'flex' }}>
                            <img src={item.roomImg} alt="room" style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8, marginRight: 16 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>{item.hotelName}</span>
                                        <Tag style={{ 
                                            color: (statusMap[item.status] || statusMap['pending']).color, 
                                            background: (statusMap[item.status] || statusMap['pending']).bg, 
                                            border: 'none', 
                                            marginRight: 0,
                                            fontWeight: 600
                                        }}>
                                            {(statusMap[item.status] || statusMap['pending']).text}
                                        </Tag>
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: 13, marginBottom: 2 }}>{item.roomType}</div>
                                    <div style={{ color: '#64748b', fontSize: 13 }}>{item.customer} · {item.dates[0]} 入住</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <span style={{ fontWeight: 700, color: '#722ed1', fontSize: 16 }}>¥{item.actual}</span>
                                    <RightOutlined style={{ color: '#cbd5e1', fontSize: 12 }} />
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            />
            )}
        </Col>

        {/* Right: Detail View */}
        <Col span={16} style={{ height: '100%' }}>
            <Card 
                style={{ height: '100%', overflowY: 'auto', borderRadius: 16, border: '1px solid #e2e8f0' }} 
                title={<span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18 }}>订单详情 (管理员视图)</span>}
                headStyle={{ borderBottom: '1px solid #f1f5f9', padding: '0 32px' }}
                bodyStyle={{ padding: 32 }}
            >
                {selectedOrder ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <div>
                                <h2 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: 24 }}>{selectedOrder.hotelName} - {selectedOrder.roomType}</h2>
                                <span style={{ color: '#64748b', fontSize: 14 }}>订单号: {selectedOrder.orderNo}</span>
                            </div>
                            <Tag style={{ 
                                color: (statusMap[selectedOrder.status] || statusMap['pending']).color, 
                                background: (statusMap[selectedOrder.status] || statusMap['pending']).bg, 
                                border: 'none', 
                                fontSize: 14, 
                                padding: '6px 16px',
                                borderRadius: 6,
                                fontWeight: 600
                            }}>
                                {(statusMap[selectedOrder.status] || statusMap['pending']).text}
                            </Tag>
                        </div>

                        <Divider orientation="left" style={{ borderColor: '#e2e8f0', color: '#94a3b8', fontSize: 13 }}>预订信息</Divider>
                        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                            <Col span={8}>
                                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>预订人</div>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedOrder.customer}</div>
                            </Col>
                            <Col span={8}>
                                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>联系方式</div>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>138****8888</div>
                            </Col>
                            <Col span={8}>
                                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>下单时间</div>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedOrder.createTime}</div>
                            </Col>
                            <Col span={8}>
                                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>入住日期</div>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedOrder.dates[0]}</div>
                            </Col>
                            <Col span={8}>
                                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>离店日期</div>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedOrder.dates[1]}</div>
                            </Col>
                            <Col span={8}>
                                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>共几晚</div>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>{selectedOrder.nights}晚</div>
                            </Col>
                        </Row>

                        <Divider orientation="left" style={{ borderColor: '#e2e8f0', color: '#94a3b8', fontSize: 13 }}>费用明细</Divider>
                        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 12, marginBottom: 32 }}>
                            <Row gutter={[24, 24]} align="middle">
                                <Col span={8}>
                                    <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>原价</div>
                                    <div style={{ color: '#0f172a', fontWeight: 500 }}>¥{selectedOrder.total}</div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>平台佣金 (10%)</div>
                                    <div style={{ color: '#722ed1', fontWeight: 500 }}>¥{(selectedOrder.actual * 0.1).toFixed(2)}</div>
                                </Col>
                                <Col span={8}>
                                    <div style={{ color: '#64748b', fontSize: 13, marginBottom: 4 }}>实付金额</div>
                                    <div style={{ color: '#d97706', fontSize: 24, fontWeight: 700, fontFamily: 'Playfair Display' }}>¥{selectedOrder.actual}</div>
                                </Col>
                            </Row>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
                            <Button danger size="large" onClick={() => handleAction('强制取消')}>强制取消</Button>
                            <Button type="primary" size="large" onClick={() => handleAction('联系商家')}>联系商家</Button>
                        </div>
                    </div>
                ) : (
                    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', flexDirection: 'column' }}>
                        <div style={{ width: 80, height: 80, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <CheckCircleOutlined style={{ fontSize: 32, color: '#cbd5e1' }} />
                        </div>
                        <div style={{ fontSize: 16 }}>请选择左侧订单查看详情</div>
                    </div>
                )}
            </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminOrderList;
