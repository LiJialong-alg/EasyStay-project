import React, { useState } from 'react';
import { Card, Tabs, Button, Table, Tag, Modal, Form, Input, DatePicker, InputNumber, Switch, Upload, message, List, Avatar } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const Marketing = () => {
  // Coupon State
  const [coupons, setCoupons] = useState([
    { key: '1', name: '五一早鸟券', amount: 50, type: 'cash', total: 100, used: 25, status: 'active' },
    { key: '2', name: '连住9折券', amount: 0.9, type: 'discount', total: 500, used: 120, status: 'active' },
  ]);
  const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);

  // Banner State
  const [banners, setBanners] = useState([
    { key: '1', title: '夏季促销', image: 'https://via.placeholder.com/300x100', status: 'active' }
  ]);
  const [isBannerModalVisible, setIsBannerModalVisible] = useState(false);

  // Discount State
  const [discounts, setDiscounts] = useState([
    { key: '1', roomType: '豪华大床房', discount: 0.8, dates: ['2024-05-01', '2024-05-05'], status: 'active' }
  ]);
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);

  // Coupon Handlers
  const couponColumns = [
    { title: '优惠券名称', dataIndex: 'name', key: 'name' },
    { title: '面额/折扣', dataIndex: 'amount', key: 'amount', render: (val, record) => record.type === 'cash' ? `¥${val}` : `${val*10}折` },
    { title: '发放总量', dataIndex: 'total', key: 'total' },
    { title: '已使用', dataIndex: 'used', key: 'used' },
    { title: '使用率', key: 'rate', render: (_, r) => `${((r.used / r.total) * 100).toFixed(1)}%` },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'active' ? 'blue' : 'default'}>{s === 'active' ? '进行中' : '已结束'}</Tag> },
    { title: '操作', key: 'action', render: () => <Button type="link" danger>结束</Button> }
  ];

  const handleCreateCoupon = (values) => {
    setCoupons([...coupons, { key: Date.now(), ...values, used: 0, status: 'active' }]);
    setIsCouponModalVisible(false);
    message.success('优惠券创建成功');
  };

  // Banner Handlers
  const handleAddBanner = (values) => {
     setBanners([...banners, { key: Date.now(), ...values, image: 'https://via.placeholder.com/300x100', status: 'active' }]);
     setIsBannerModalVisible(false);
     message.success('横幅添加成功');
  };

  // Discount Handlers
  const discountColumns = [
    { title: '房型', dataIndex: 'roomType', key: 'roomType' },
    { title: '折扣力度', dataIndex: 'discount', key: 'discount', render: val => `${val*10}折` },
    { title: '活动时间', dataIndex: 'dates', key: 'dates', render: d => `${d[0]} 至 ${d[1]}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => <Switch checked={s === 'active'} /> },
    { title: '操作', key: 'action', render: () => <Button type="text" danger icon={<DeleteOutlined />} /> }
  ];

  const handleCreateDiscount = (values) => {
      setDiscounts([...discounts, { key: Date.now(), ...values, dates: [values.dates[0].format('YYYY-MM-DD'), values.dates[1].format('YYYY-MM-DD')], status: 'active' }]);
      setIsDiscountModalVisible(false);
      message.success('折扣设置成功');
  };

  return (
    <div className="page-container fade-in">
      <Tabs defaultActiveKey="1" className="brand-tabs" type="card">
        {/* 1. Coupon Management */}
        <TabPane tab="优惠券管理" key="1">
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCouponModalVisible(true)} className="brand-btn-primary">创建优惠券</Button>
          </div>
          <div className="brand-card" style={{ padding: 24, background: '#fff', borderRadius: 'var(--radius-md)' }}>
            <Table columns={couponColumns} dataSource={coupons} pagination={false} />
          </div>
          
          <Modal 
            title={<span className="font-serif brand-heading-sm">创建优惠券</span>} 
            open={isCouponModalVisible} 
            onCancel={() => setIsCouponModalVisible(false)} 
            footer={null}
            className="brand-modal"
          >
             <Form layout="vertical" onFinish={handleCreateCoupon}>
                <Form.Item name="name" label={<span className="brand-text-primary">优惠券名称</span>} rules={[{ required: true }]}>
                    <Input className="brand-input" />
                </Form.Item>
                <Form.Item name="type" label={<span className="brand-text-primary">类型</span>} initialValue="cash">
                    <Select className="brand-select">
                        <Select.Option value="cash">满减券</Select.Option>
                        <Select.Option value="discount">折扣券</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item name="amount" label={<span className="brand-text-primary">面额/折扣率</span>} rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} className="brand-input" />
                </Form.Item>
                <Form.Item name="total" label={<span className="brand-text-primary">发放总量</span>} rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} className="brand-input" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block className="brand-btn-primary">确认创建</Button>
             </Form>
          </Modal>
        </TabPane>

        {/* 2. Banner Management */}
        <TabPane tab="活动横幅" key="2">
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsBannerModalVisible(true)} className="brand-btn-primary">添加横幅</Button>
            </div>
            <List
                grid={{ gutter: 24, column: 3 }}
                dataSource={banners}
                renderItem={item => (
                    <List.Item>
                        <Card
                            hoverable
                            className="brand-card"
                            cover={<img alt="banner" src={item.image} style={{ height: 120, objectFit: 'cover' }} />}
                            actions={[<DeleteOutlined key="delete" style={{ color: 'var(--brand-accent)' }} />]}
                        >
                            <Card.Meta 
                                title={<span className="font-serif brand-text-primary">{item.title}</span>} 
                                description={<Tag color={item.status === 'active' ? '#0f172a' : 'default'}>{item.status === 'active' ? '展示中' : '已下架'}</Tag>} 
                            />
                        </Card>
                    </List.Item>
                )}
            />
            <Modal 
                title={<span className="font-serif brand-heading-sm">添加活动横幅</span>} 
                open={isBannerModalVisible} 
                onCancel={() => setIsBannerModalVisible(false)} 
                footer={null}
                className="brand-modal"
            >
                <Form layout="vertical" onFinish={handleAddBanner}>
                    <Form.Item name="title" label={<span className="brand-text-primary">横幅标题</span>} rules={[{ required: true }]}>
                        <Input className="brand-input" />
                    </Form.Item>
                    <Form.Item label={<span className="brand-text-primary">上传图片</span>}>
                        <Upload>
                            <Button icon={<UploadOutlined />} className="brand-btn-secondary">点击上传</Button>
                        </Upload>
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block className="brand-btn-primary">保存</Button>
                </Form>
            </Modal>
        </TabPane>

        {/* 3. Discount Settings */}
        <TabPane tab="限时折扣" key="3">
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsDiscountModalVisible(true)} className="brand-btn-primary">设置新折扣</Button>
            </div>
            <div className="brand-card" style={{ padding: 24, background: '#fff', borderRadius: 'var(--radius-md)' }}>
                <Table columns={discountColumns} dataSource={discounts} pagination={false} />
            </div>

             <Modal 
                title={<span className="font-serif brand-heading-sm">设置限时折扣</span>} 
                open={isDiscountModalVisible} 
                onCancel={() => setIsDiscountModalVisible(false)} 
                footer={null}
                className="brand-modal"
            >
                <Form layout="vertical" onFinish={handleCreateDiscount}>
                    <Form.Item name="roomType" label={<span className="brand-text-primary">适用房型</span>} rules={[{ required: true }]}>
                        <Select className="brand-select">
                            <Select.Option value="豪华大床房">豪华大床房</Select.Option>
                            <Select.Option value="标准双床房">标准双床房</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="discount" label={<span className="brand-text-primary">折扣力度 (如0.8为8折)</span>} rules={[{ required: true }]}>
                        <InputNumber min={0.1} max={1.0} step={0.1} style={{ width: '100%' }} className="brand-input" />
                    </Form.Item>
                    <Form.Item name="dates" label={<span className="brand-text-primary">活动时间</span>} rules={[{ required: true }]}>
                        <RangePicker style={{ width: '100%' }} className="brand-input" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block className="brand-btn-primary">确认设置</Button>
                </Form>
            </Modal>
        </TabPane>
      </Tabs>
    </div>
  );
};

// Missing import fix
import { Select } from 'antd';

export default Marketing;
