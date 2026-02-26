import React, { useState, useEffect } from 'react';
/**
 * @component OrderManagement
 * @description 订单管理页面
 * @features
 * 1. 订单列表展示（分页、筛选）
 * 2. 订单状态筛选（全部、待入住、在住、已离店、已取消）
 * 3. 订单操作（办理入住、办理退房、取消订单）
 * 4. 订单详情查看
 */
import { Table, Tag, Button, Space, Modal, message, Select, DatePicker, Tabs, Input } from 'antd';
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getOrders, updateOrderStatus } from '../../services/orderService';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrderManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: undefined });
  
  useEffect(() => {
      fetchData();
  }, [filters]);

  const fetchData = async () => {
      setLoading(true);
      try {
          const res = await getOrders({ 
              status: filters.status === 'all' ? undefined : filters.status,
              page: 1,
              pageSize: 50 // fetch more for list view
          });
          const mapped = res.data.list.map(o => ({
              key: o.id,
              orderNo: o.id,
              customer: o.customer_name,
              roomType: o.RoomType ? o.RoomType.name : 'Unknown',
              dates: [o.check_in_date, o.check_out_date],
              total: o.total_amount,
              paymentStatus: o.status === 'pending' ? 'unpaid' : 'paid', // Simple logic
              status: o.status
          }));
          setData(mapped);
      } catch (error) {
          // handled
      } finally {
          setLoading(false);
      }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const handleAction = (record, action) => {
    let newStatus = record.status;
    let msg = '';

    switch (action) {
      case 'checkin':
        newStatus = 'checked_in';
        msg = '办理入住成功';
        break;
      case 'checkout':
        newStatus = 'completed';
        msg = '办理退房成功';
        break;
      case 'cancel':
        newStatus = 'cancelled';
        msg = '订单已取消';
        break;
      default:
        return;
    }

    Modal.confirm({
      title: '确认操作',
      content: `确定要对订单 ${record.orderNo} 进行此操作吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
            await updateOrderStatus(record.key, newStatus);
            setData(prev => prev.map(item => item.key === record.key ? { ...item, status: newStatus } : item));
            message.success(msg);
        } catch (error) {
            // handled
        }
      }
    });
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      render: text => <a onClick={() => { setCurrentOrder(data.find(d => d.orderNo === text)); setIsModalVisible(true); }}>{text}</a>
    },
    {
      title: '客户姓名',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '房间类型',
      dataIndex: 'roomType',
      key: 'roomType',
    },
    {
      title: '入住/离店日期',
      dataIndex: 'dates',
      key: 'dates',
      render: dates => `${dates[0]} 至 ${dates[1]}`
    },
    {
      title: '总金额',
      dataIndex: 'total',
      key: 'total',
      render: val => `¥${val}`
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: status => {
        const config = {
          paid: { color: 'blue', text: '已支付' }, // Changed green to blue
          unpaid: { color: 'red', text: '未支付' },
          refunded: { color: 'default', text: '已退款' }
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      }
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        const config = {
          pending_checkin: { color: 'orange', text: '待入住' },
          pending_payment: { color: 'red', text: '待支付' },
          checked_in: { color: 'blue', text: '在住' }, // Changed green to blue
          completed: { color: 'default', text: '已完成' },
          cancelled: { color: 'default', text: '已取消' }
        };
        return <Tag color={config[status].color}>{config[status].text}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending_checkin' && (
            <Button type="link" size="small" icon={<LoginOutlined />} onClick={() => handleAction(record, 'checkin')}>入住</Button>
          )}
          {record.status === 'checked_in' && (
            <Button type="link" size="small" icon={<LogoutOutlined />} onClick={() => handleAction(record, 'checkout')}>退房</Button>
          )}
          {(record.status === 'pending_checkin' || record.status === 'pending_payment') && (
            <Button type="text" danger size="small" onClick={() => handleAction(record, 'cancel')}>取消</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fade-in">
      <Card className="brand-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Input placeholder="搜索订单号/客户姓名" style={{ width: 200 }} prefix={<SearchOutlined style={{ color: 'var(--brand-primary)' }} />} className="brand-input" />
          <Select 
            defaultValue="all" 
            style={{ width: 120 }} 
            className="brand-select"
            onChange={(val) => setFilters({ status: val })}
          >
            <Option value="all">所有状态</Option>
            <Option value="pending">待入住</Option>
            <Option value="checked_in">在住</Option>
            <Option value="completed">已离店</Option>
            <Option value="cancelled">已取消</Option>
          </Select>
          <RangePicker className="brand-input" />
          <Button type="primary" className="brand-btn-primary">查询</Button>
        </div>
      </Card>

      <Card className="brand-card" bordered={false} bodyStyle={{ padding: '0 24px 24px' }}>
        <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={<span className="font-serif brand-heading-sm">订单详情</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsModalVisible(false)} style={{ borderRadius: 'var(--radius-sm)' }}>关闭</Button>]}
        className="brand-modal"
      >
        {currentOrder && (
          <div style={{ lineHeight: 2, fontSize: 15 }}>
            <p><strong className="brand-text-primary">订单号：</strong>{currentOrder.orderNo}</p>
            <p><strong className="brand-text-primary">客户：</strong>{currentOrder.customer}</p>
            <p><strong className="brand-text-primary">房型：</strong>{currentOrder.roomType}</p>
            <p><strong className="brand-text-primary">日期：</strong>{currentOrder.dates[0]} - {currentOrder.dates[1]}</p>
            <p><strong className="brand-text-primary">金额：</strong><span className="brand-text-accent font-serif" style={{ fontSize: 18 }}>¥{currentOrder.total}</span></p>
            <p><strong className="brand-text-primary">备注：</strong>无特殊备注</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
