import React, { useState, useEffect } from 'react';
/**
 * @component ReceptionSettings
 * @description 接单设置页面
 * @features
 * 1. 酒店接单总开关（营业/休息）
 * 2. 房型上下线开关
 * 3. 全局接单规则设置（自动接单时间、每日最大接单量、通知方式）
 */
import { Card, Form, TimePicker, InputNumber, Switch, Button, message, Alert, Table, Checkbox, Row, Col, Badge, Tag } from 'antd';
import dayjs from 'dayjs';
import { getHotels, updateHotelStatus } from '../../../services/hotelService';
import { updateRoomStatus } from '../../../services/roomService';

const ReceptionSettings = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      fetchHotels();
  }, []);

  const fetchHotels = async () => {
      setLoading(true);
      try {
          const res = await getHotels();
          const data = res.data.map(h => ({
              key: h.id,
              name: h.name,
              listed: h.listed,
              isAccepting: h.status === 'operating',
              children: (h.RoomTypes || []).map(rt => ({
                  ...rt,
                  key: rt.id, // Table needs key
                  stock: rt.total_stock,
                  price: rt.base_price
              }))
          }));
          setHotels(data);
      } catch (error) {
          // handled
      } finally {
          setLoading(false);
      }
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [notificationMethods, setNotificationMethods] = useState(['sms', 'app']);

  const handleToggleHotel = async (id, checked) => {
      const status = checked ? 'operating' : 'closed';
      try {
          await updateHotelStatus(id, status);
          setHotels(prev => prev.map(h => h.key === id ? { ...h, isAccepting: checked } : h));
          message.success(checked ? `${id}号酒店已开启接单` : `${id}号酒店已暂停接单`);
      } catch (error) {
          // handled
      }
  };

  const handleToggleRoom = async (hotelId, roomId, checked) => {
      const status = checked ? 'available' : 'offline'; // Simplified logic
      try {
          await updateRoomStatus(roomId, status);
          message.success(checked ? '房型已上线' : '房型已下线');
          // Update local state
          setHotels(prev => prev.map(h => {
              if (h.key === hotelId) {
                  return {
                      ...h,
                      children: h.children.map(r => r.id === roomId ? { ...r, status: status } : r)
                  };
              }
              return h;
          }));
      } catch (error) {
          // handled
      }
  };

  const onFinish = (values) => {
    console.log('Success:', values);
    message.success('接单设置已保存');
  };

  const hotelColumns = [
      { 
        title: '酒店名称', 
        dataIndex: 'name', 
        key: 'name', 
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="font-serif brand-text-primary" style={{ fontWeight: 600 }}>{text}</span>
            {record.listed === false && <Tag color="red" style={{ margin: 0 }}>平台已下线</Tag>}
          </div>
        )
      },
      { 
          title: '酒店接单总开关', 
          dataIndex: 'isAccepting', 
          key: 'isAccepting',
          render: (val, record) => (
              <Switch 
                  checked={val} 
                  onChange={(checked) => handleToggleHotel(record.key, checked)} 
                  checkedChildren="接单中" 
                  unCheckedChildren="休息中" 
                  style={{ background: val ? '#0f172a' : undefined }}
                  disabled={record.listed === false}
              />
          )
      }
  ];

  const roomColumns = [
      { title: '房型名称', dataIndex: 'name', key: 'name' },
      { title: '当前库存', dataIndex: 'stock', key: 'stock' },
      { title: '价格', dataIndex: 'price', key: 'price', render: (val) => `¥${val}` },
      { 
          title: '上下线状态', 
          key: 'status', 
          render: (_, record) => {
              const isActive = record.status !== 'offline';
              return (
                <Switch 
                    size="small"
                    checked={isActive} 
                    onChange={(checked) => handleToggleRoom(null, record.id, checked)} // Note: We need parent ID in real app
                    checkedChildren="上线" 
                    unCheckedChildren="下线"
                />
              );
          }
      }
  ];

  // Enhanced expandedRowRender to pass hotelId
  const expandedRowRender = (record) => {
      const data = record.children || [];
      const columns = [
        { title: '房型名称', dataIndex: 'name', key: 'name' },
        { title: '当前库存', dataIndex: 'stock', key: 'stock' },
        { title: '价格', dataIndex: 'price', key: 'price', render: (val) => `¥${val}` },
        { 
            title: '上下线状态', 
            key: 'status', 
            render: (_, room) => {
                const isActive = room.status !== 'offline';
                return (
                  <Switch 
                      size="small"
                      checked={isActive} 
                      onChange={(checked) => handleToggleRoom(record.key, room.id, checked)}
                      checkedChildren="上线" 
                      unCheckedChildren="下线"
                      disabled={record.listed === false}
                  />
                );
            }
        }
      ];
      return <Table columns={columns} dataSource={data} pagination={false} size="small" rowKey="id" />;
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 32 }} className="font-serif brand-heading-lg text-center">接单设置</h2>
      
      <Card className="brand-card" bordered={false} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 24 }} className="font-serif brand-heading-md">各店接单开关</h3>
          <Table 
            loading={loading}
            dataSource={hotels} 
            columns={hotelColumns} 
            pagination={false} 
            size="middle"
            expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.children && record.children.length > 0,
            }}
          />
      </Card>

      <Card className="brand-card" bordered={false}>
        <h3 style={{ marginBottom: 24 }} className="font-serif brand-heading-md">全局接单规则</h3>
        <Form
          layout="vertical"
          initialValues={{
              autoAcceptTime: [dayjs('08:00', 'HH:mm'), dayjs('22:00', 'HH:mm')],
              maxDailyOrders: 50
          }}
          onFinish={onFinish}
        >
          <Row gutter={32}>
              <Col span={12}>
                <Form.Item 
                    label={<span className="brand-text-primary">自动接单时间段</span>} 
                    name="autoAcceptTime"
                    help="在此时间段内的新订单将自动确认接单"
                >
                    <TimePicker.RangePicker format="HH:mm" style={{ width: '100%' }} className="brand-input" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                    label={<span className="brand-text-primary">每日最大接单量 (单店)</span>} 
                    name="maxDailyOrders"
                    help="超过此数量后该店将自动停止接单"
                >
                    <InputNumber min={1} max={1000} style={{ width: '100%' }} className="brand-input" />
                </Form.Item>
              </Col>
          </Row>

          <Form.Item label={<span className="brand-text-primary">新订单通知方式</span>}>
              <Checkbox.Group 
                options={[
                    { label: '短信通知', value: 'sms' },
                    { label: '邮件通知', value: 'email' },
                    { label: 'APP推送', value: 'app' },
                    { label: '微信通知', value: 'wechat' }
                ]}
                value={notificationMethods}
                onChange={setNotificationMethods}
              />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" size="large" className="brand-btn-primary" block style={{ height: 48, fontSize: 16 }}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ReceptionSettings;
