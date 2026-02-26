import React, { useEffect, useMemo, useState } from 'react';
import { Card, Tabs, Table, Tag, Input, DatePicker, Button, Row, Col, List, Avatar, Space, message, Select, Modal, Divider, Badge, Typography, Spin } from 'antd';
import { SearchOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, RightOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getOrders } from '../../../services/orderService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const OrderList = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [quickRange, setQuickRange] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  
  useEffect(() => {
    fetchOrders();
  }, [activeTab, quickRange, dateRange]);

  useEffect(() => {
    fetchNewCount();
  }, []);

  const mapStatus = (s) => {
    if (s === 'pending') return 'pending_payment';
    if (s === 'confirmed') return 'pending_checkin';
    return s;
  };

  const buildCheckInRange = () => {
    const today = dayjs().startOf('day');
    if (quickRange === 'today') return [today, today];
    if (quickRange === 'past7') return [today.subtract(6, 'day'), today];
    if (quickRange === 'future7') return [today, today.add(6, 'day')];
    if (dateRange && dateRange.length === 2) return [dateRange[0].startOf('day'), dateRange[1].startOf('day')];
    return null;
  };

  const fetchNewCount = async () => {
    try {
      const start = dayjs().startOf('day').toISOString();
      const end = dayjs().endOf('day').toISOString();
      const res = await getOrders({ status: 'pending', createdStart: start, createdEnd: end, page: 1, pageSize: 1 });
      setNewCount(Number(res.data?.total || 0));
    } catch {
      setNewCount(0);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const statusMap = {
        all: undefined,
        pending: undefined,
        active: 'checked_in',
        new: 'pending',
      };
      const range = buildCheckInRange();
      const res = await getOrders({
        status: statusMap[activeTab],
        q: keyword.trim() || undefined,
        checkInStart: range ? range[0].format('YYYY-MM-DD') : undefined,
        checkInEnd: range ? range[1].format('YYYY-MM-DD') : undefined,
        page: 1,
        pageSize: 50,
      });
      const list = (res.data?.list || []).map((o) => {
        const createdAt = o.createdAt || o.created_at || new Date().toISOString();
        const updatedAt = o.updatedAt || o.updated_at || createdAt;
        const hotelName = o.Hotel?.name || '未知酒店';
        const roomName = o.RoomType?.name || '未知房型';
        const roomImg = o.RoomType?.image_url || o.Hotel?.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=100&q=80';
        const shortOrderNo = String(o.id).padStart(5, '0');
        const contactPhone = o.contact_phone || o.contactPhone || null;
        const roomCount = Number(o.room_count || 1);
        return {
          key: o.id,
          orderNo: `ORD${dayjs(createdAt).format('YYYYMMDD')}${shortOrderNo}`,
          shortOrderNo,
          customer: o.customer_name,
          contactPhone,
          hotelName,
          roomType: roomName,
          roomImg,
          dates: [o.check_in_date, o.check_out_date],
          nights: dayjs(o.check_out_date).diff(dayjs(o.check_in_date), 'day'),
          roomCount,
          total: Number(o.total_amount || 0),
          discount: 0,
          actual: Number(o.total_amount || 0),
          status: mapStatus(o.status),
          statusRaw: o.status,
          createTime: dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
          updateTime: dayjs(updatedAt).format('YYYY-MM-DD HH:mm'),
          remark: o.remark || '无',
          roomMeta: o.RoomType || null,
          hotelMeta: o.Hotel || null,
        };
      });
      setOrders(list);
      if (list.length > 0 && !selectedOrder) setSelectedOrder(list[0]);
      fetchNewCount();
    } catch (e) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(o => {
        if (activeTab === 'pending') return o.status === 'pending_checkin' || o.status === 'pending_payment';
        if (activeTab === 'active') return o.status === 'checked_in';
        if (activeTab === 'new') return o.status === 'pending_payment';
        return true;
    });

  const handleAction = (action) => {
    message.success(`操作成功: ${action}`);
  };

  const statusMap = {
      'pending_checkin': { color: '#f59e0b', bg: '#fffbeb', text: '待入住' },
      'pending_payment': { color: '#ef4444', bg: '#fef2f2', text: '待支付' },
      'checked_in': { color: '#3b82f6', bg: '#eff6ff', text: '在住' },
      'completed': { color: '#10b981', bg: '#ecfdf5', text: '已完成' },
      'cancelled': { color: '#64748b', bg: '#f1f5f9', text: '已取消' },
  };

  return (
    <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Filter Bar */}
      <Card bordered={false} bodyStyle={{ padding: '24px' }} style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }} size="large">
             <TabPane tab="全部订单" key="all" />
             <TabPane tab="未处理订单" key="pending" />
             <TabPane tab="已入住订单" key="active" />
             <TabPane tab={<Badge count={newCount} offset={[10, 0]} color="#d97706">新增订单</Badge>} key="new" />
        </Tabs>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space wrap size={16}>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索客人姓名/订单号"
                  prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                  style={{ width: 280, borderRadius: 6 }}
                  size="large"
                  allowClear
                  onPressEnter={fetchOrders}
                />
                <Button.Group>
                    <Button size="large" type={quickRange === 'today' ? 'primary' : 'default'} onClick={() => { setQuickRange('today'); setDateRange(null); }}>今日</Button>
                    <Button size="large" type={quickRange === 'past7' ? 'primary' : 'default'} onClick={() => { setQuickRange('past7'); setDateRange(null); }}>过去7日</Button>
                    <Button size="large" type={quickRange === 'future7' ? 'primary' : 'default'} onClick={() => { setQuickRange('future7'); setDateRange(null); }}>未来7日</Button>
                </Button.Group>
                {activeTab === 'all' && (
                  <RangePicker
                    size="large"
                    style={{ borderRadius: 6 }}
                    value={dateRange}
                    onChange={(v) => { setDateRange(v); setQuickRange(null); }}
                  />
                )}
                <Button type="primary" size="large" style={{ background: '#0f172a', borderColor: '#0f172a' }} onClick={fetchOrders}>筛选</Button>
            </Space>
            {activeTab === 'all' && (
                <Button icon={<CalendarOutlined />} size="large" onClick={() => setCalendarOpen(true)}>日历视图</Button>
            )}
        </div>
      </Card>

      {/* Split Layout */}
      <Row gutter={24} style={{ flex: 1, overflow: 'hidden' }}>
        {/* Left: List View */}
        <Col span={8} style={{ height: '100%', overflowY: 'auto', paddingRight: 4 }}>
            {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
              <List
                  dataSource={filteredOrders}
                  renderItem={item => (
                      <Card 
                          hoverable 
                          className="order-card"
                          style={{ 
                              marginBottom: 16, 
                              border: selectedOrder?.key === item.key ? '1px solid #d97706' : '1px solid #e2e8f0',
                              borderRadius: 12,
                              boxShadow: selectedOrder?.key === item.key ? '0 4px 12px rgba(217, 119, 6, 0.1)' : 'none',
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
                                              color: (statusMap[item.status] || statusMap['pending_payment']).color, 
                                              background: (statusMap[item.status] || statusMap['pending_payment']).bg, 
                                              border: 'none', 
                                              marginRight: 0,
                                              fontWeight: 600
                                          }}>
                                              {(statusMap[item.status] || statusMap['pending_payment']).text}
                                          </Tag>
                                      </div>
                                      <div style={{ color: '#64748b', fontSize: 13, marginBottom: 2 }}>{item.roomType}</div>
                                      <div style={{ color: '#64748b', fontSize: 13 }}>入住: {item.dates[0]}</div>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                      <span style={{ fontWeight: 700, color: '#d97706', fontSize: 16 }}>¥{item.actual}</span>
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
                style={{ height: '100%', borderRadius: 16, border: '1px solid #e2e8f0' }} 
                title={<span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 18 }}>订单详情</span>}
                headStyle={{ borderBottom: '1px solid #f1f5f9', padding: '0 32px' }}
                bodyStyle={{ padding: 0, height: 'calc(100% - 58px)', overflow: 'hidden' }}
            >
                {selectedOrder ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '20px 24px 16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{ minWidth: 0 }}>
                                    <Title level={4} style={{ margin: 0, color: '#0f172a', lineHeight: 1.25 }}>
                                      {selectedOrder.roomType}
                                    </Title>
                                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                        <Text type="secondary">订单号：{selectedOrder.orderNo}</Text>
                                        <Text type="secondary">ID：{selectedOrder.key}</Text>
                                        <Text type="secondary">创建：{selectedOrder.createTime}</Text>
                                        <Text type="secondary">更新：{selectedOrder.updateTime}</Text>
                                    </div>
                                </div>
                                <Tag style={{ 
                                    color: statusMap[selectedOrder.status].color, 
                                    background: statusMap[selectedOrder.status].bg, 
                                    border: 'none', 
                                    fontSize: 14, 
                                    padding: '6px 14px',
                                    borderRadius: 6,
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap'
                                }}>
                                    {statusMap[selectedOrder.status].text}
                                </Tag>
                            </div>
                        </div>

                        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
                            <Row gutter={[16, 16]}>
                                <Col span={14}>
                                    <Card bordered={false} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>基本信息</div>
                                        <Row gutter={[12, 12]}>
                                            <Col span={12}><Text type="secondary">订单状态</Text><div style={{ fontWeight: 600 }}>{selectedOrder.statusRaw || '-'}</div></Col>
                                            <Col span={12}><Text type="secondary">入住天数</Text><div style={{ fontWeight: 600 }}>{selectedOrder.nights} 晚</div></Col>
                                            <Col span={12}><Text type="secondary">入住日期</Text><div style={{ fontWeight: 600 }}>{selectedOrder.dates?.[0] || '-'}</div></Col>
                                            <Col span={12}><Text type="secondary">离店日期</Text><div style={{ fontWeight: 600 }}>{selectedOrder.dates?.[1] || '-'}</div></Col>
                                            <Col span={12}><Text type="secondary">房间数量</Text><div style={{ fontWeight: 600 }}>{selectedOrder.roomCount || 1}</div></Col>
                                            <Col span={12}><Text type="secondary">备注</Text><div style={{ fontWeight: 600 }}>{selectedOrder.remark || '-'}</div></Col>
                                        </Row>
                                    </Card>

                                    <Card bordered={false} style={{ marginTop: 16, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>住客信息</div>
                                        <Row gutter={[12, 12]}>
                                            <Col span={12}><Text type="secondary">姓名</Text><div style={{ fontWeight: 600 }}>{selectedOrder.customer || '-'}</div></Col>
                                            <Col span={12}><Text type="secondary">手机号</Text><div style={{ fontWeight: 600 }}>{selectedOrder.contactPhone || '-'}</div></Col>
                                        </Row>
                                    </Card>

                                    <Card bordered={false} style={{ marginTop: 16, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>酒店与房型</div>
                                        <Row gutter={[12, 12]}>
                                            <Col span={24}>
                                                <Text type="secondary">酒店</Text>
                                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedOrder.hotelName || '-'}</div>
                                                <div style={{ marginTop: 4, color: '#64748b' }}>{selectedOrder.hotelMeta?.address || '-'}</div>
                                            </Col>
                                            <Col span={12}>
                                                <Text type="secondary">平台状态</Text>
                                                <div style={{ marginTop: 4 }}>
                                                    {selectedOrder.hotelMeta?.listed === false ? <Tag color="red">平台已下线</Tag> : <Tag color="green">已上架</Tag>}
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <Text type="secondary">营业状态</Text>
                                                <div style={{ marginTop: 4 }}>
                                                    {selectedOrder.hotelMeta?.status === 'closed' ? <Tag>休息中</Tag> : <Tag color="blue">营业中</Tag>}
                                                </div>
                                            </Col>
                                            <Col span={12}><Text type="secondary">房型</Text><div style={{ fontWeight: 600 }}>{selectedOrder.roomType || '-'}</div></Col>
                                            <Col span={12}><Text type="secondary">房型ID</Text><div style={{ fontWeight: 600 }}>{selectedOrder.roomMeta?.id || '-'}</div></Col>
                                            <Col span={12}><Text type="secondary">床型</Text><div style={{ fontWeight: 600 }}>{selectedOrder.roomMeta?.bed_type || '-'}</div></Col>
                                            <Col span={12}><Text type="secondary">面积</Text><div style={{ fontWeight: 600 }}>{selectedOrder.roomMeta?.room_size_sqm ? `${selectedOrder.roomMeta.room_size_sqm}㎡` : '-'}</div></Col>
                                        </Row>
                                    </Card>
                                </Col>

                                <Col span={10}>
                                    <Card bordered={false} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>费用明细</div>
                                        <Row gutter={[12, 12]} align="middle">
                                            <Col span={12}><Text type="secondary">原价</Text><div style={{ fontWeight: 600 }}>¥{selectedOrder.total}</div></Col>
                                            <Col span={12}><Text type="secondary">优惠</Text><div style={{ fontWeight: 600, color: '#ef4444' }}>-¥{selectedOrder.discount}</div></Col>
                                            <Col span={24}>
                                                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <Text type="secondary">实付</Text>
                                                    <span style={{ color: '#d97706', fontSize: 28, fontWeight: 800, fontFamily: 'Playfair Display' }}>¥{selectedOrder.actual}</span>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card>

                                    <Card bordered={false} style={{ marginTop: 16, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>系统字段</div>
                                        <Row gutter={[12, 12]}>
                                            <Col span={12}><Text type="secondary">订单ID</Text><div style={{ fontWeight: 600 }}>{selectedOrder.key}</div></Col>
                                            <Col span={12}><Text type="secondary">酒店ID</Text><div style={{ fontWeight: 600 }}>{selectedOrder.hotelMeta?.id || '-'}</div></Col>
                                            <Col span={24}><Text type="secondary">Hotel 图片</Text><div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{selectedOrder.hotelMeta?.image_url || '-'}</div></Col>
                                        </Row>
                                    </Card>

                                    <Card bordered={false} style={{ marginTop: 16, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>操作</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                            {selectedOrder.status === 'pending_checkin' && (
                                                <>
                                                    <Button danger onClick={() => handleAction('取消订单')}>取消订单</Button>
                                                    <Button type="primary" style={{ background: '#0f172a', borderColor: '#0f172a' }} onClick={() => handleAction('办理入住')}>办理入住</Button>
                                                </>
                                            )}
                                            {selectedOrder.status === 'pending_payment' && (
                                                <Button type="primary" style={{ background: '#0f172a', borderColor: '#0f172a' }} onClick={() => handleAction('确认收款')}>确认收款</Button>
                                            )}
                                            {selectedOrder.status === 'checked_in' && (
                                                <Button type="primary" style={{ background: '#0f172a', borderColor: '#0f172a' }} onClick={() => handleAction('办理退房')}>办理退房</Button>
                                            )}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
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

      <Modal
        title="订单日历视图"
        open={calendarOpen}
        onCancel={() => setCalendarOpen(false)}
        footer={null}
        width={980}
      >
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height={620}
          events={filteredOrders.map((o) => ({
            id: String(o.key),
            title: `${o.customer} · ${o.hotelName}`,
            start: o.dates[0],
            end: dayjs(o.dates[1]).add(1, 'day').format('YYYY-MM-DD'),
          }))}
          eventClick={(info) => {
            const id = Number(info.event.id);
            const found = filteredOrders.find((x) => x.key === id);
            if (found) setSelectedOrder(found);
            setCalendarOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default OrderList;
