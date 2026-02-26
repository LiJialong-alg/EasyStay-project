import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, message, Input, Drawer, Descriptions } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getHotels, updateHotelListing, updateHotelStatus, updateRoomType } from '../../../services/hotelService';

const HotelList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailHotel, setDetailHotel] = useState(null);

  useEffect(() => {
      fetchHotels();
  }, []);

  const fetchHotels = async () => {
      setLoading(true);
      try {
          const res = await getHotels();
          if (res.data) {
              const list = res.data.map(h => ({
                  ...h,
                  key: h.id,
                  merchant: h.Owner ? h.Owner.name : 'Unknown',
              }));
              setData(list || []);
          }
      } catch (error) {
          console.error(error);
          message.error('获取酒店列表失败');
      } finally {
          setLoading(false);
      }
  };

  const toggleListing = (record) => {
    const nextListed = false;
    const actionText = '下线';
    let reason = '';
    
    Modal.confirm({
      title: `确认${actionText}酒店？`,
      content: (
        <div>
          <div style={{ marginBottom: 12 }}>{`确定要${actionText} "${record.name}" 吗？`}</div>
          {(
            <Input.TextArea
              placeholder="请输入下线原因（将同步给商家端）"
              rows={3}
              onChange={(e) => { reason = e.target.value; }}
            />
          )}
        </div>
      ),
      onOk: async () => {
        try {
            await updateHotelListing(record.key, nextListed, reason);
            setData(data.map(item => item.key === record.key ? { ...item, listed: nextListed } : item));
            message.success(`已${actionText}酒店 ${record.name}`);
        } catch (error) {
            // Error handled by interceptor
        }
      }
    });
  };

  const toggleBusinessStatus = (record) => {
    const newStatus = record.status === 'operating' ? 'closed' : 'operating';
    const actionText = newStatus === 'operating' ? '恢复营业' : '暂停营业';

    Modal.confirm({
      title: `确认${actionText}？`,
      content: `确定要${actionText} "${record.name}" 吗？`,
      onOk: async () => {
        try {
          await updateHotelStatus(record.key, newStatus);
          setData(data.map(item => item.key === record.key ? { ...item, status: newStatus } : item));
          message.success(`${record.name} 已${actionText}`);
        } catch (error) {
        }
      }
    });
  };

  const handleRoomAudit = (hotelId, room, action) => {
    let reason = '';
    Modal.confirm({
      title: action === 'approve' ? '通过审核' : '驳回申请',
      content: (
        <div>
          <div style={{ marginBottom: 12 }}>{`确认${action === 'approve' ? '通过' : '驳回'} "${room.name}" 的上架申请吗？`}</div>
          {action !== 'approve' && (
            <Input.TextArea
              rows={3}
              placeholder="请输入驳回原因（将同步给商家端）"
              onChange={(e) => { reason = e.target.value; }}
            />
          )}
        </div>
      ),
      onOk: async () => {
        try {
          if (action === 'approve') {
            await updateRoomType(room.id, { audit_status: 'approved', audit_reason: null, status: 'available' });
          } else {
            await updateRoomType(room.id, { audit_status: 'rejected', audit_reason: reason || null, status: 'offline' });
          }
          setData((prev) => prev.map((h) => {
            if (h.id !== hotelId) return h;
            const nextRooms = (h.RoomTypes || []).map((rt) => rt.id === room.id
              ? { ...rt, audit_status: action === 'approve' ? 'approved' : 'rejected', audit_reason: action === 'approve' ? null : (reason || null), status: action === 'approve' ? 'available' : 'offline' }
              : rt
            );
            return { ...h, RoomTypes: nextRooms };
          }));
          message.success(`已${action === 'approve' ? '通过' : '驳回'}申请`);
        } catch (error) {
        }
      }
    });
  };

  const renderRoomAuditStatus = (rt) => {
    const s = rt.audit_status || (rt.status === 'available' ? 'approved' : 'pending');
    if (s === 'approved') return <Tag color="green">已通过</Tag>;
    if (s === 'rejected') return <Tag color="red">已驳回</Tag>;
    return <Tag color="orange">待审核</Tag>;
  };

  const asText = (v) => {
    if (v === null || v === undefined) return '-';
    if (Array.isArray(v)) return v.join('、');
    if (typeof v === 'boolean') return v ? '是' : '否';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const openDetail = (record) => {
    setDetailHotel(record);
    setDetailOpen(true);
  };

  const columns = [
    { title: '酒店名称', dataIndex: 'name', key: 'name' },
    { title: '所属商家', dataIndex: 'merchant', key: 'merchant' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { 
      title: '上架状态',
      dataIndex: 'listed',
      key: 'listed',
      render: listed => (
        <Tag color={listed ? 'green' : 'red'}>
          {listed ? '已上架' : '已下线'}
        </Tag>
      ),
    },
    {
      title: '经营状态',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const effectiveStatus = record.listed ? record.status : 'closed';
        return (
          <Tag color={effectiveStatus === 'operating' ? 'blue' : 'default'}>
            {effectiveStatus === 'operating' ? '营业中' : '休息中'}
          </Tag>
        );
      }
    },
    {
      title: '接单状态',
      key: 'order_status',
      render: (_, record) => {
        const effectiveStatus = record.listed ? record.status : 'closed';
        return (
          <Tag color={effectiveStatus === 'operating' ? 'green' : 'default'}>
            {effectiveStatus === 'operating' ? '接单中' : '休息中'}
          </Tag>
        );
      }
    },
    {
      title: '房型',
      key: 'rooms',
      render: (_, record) => <span>{(record.RoomTypes || []).length}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => openDetail(record)}>查看</Button>
          <Button 
            type="text" 
            danger={record.listed}
            disabled={!record.listed}
            onClick={() => toggleListing(record)}
          >
            下线
          </Button>
          <Button
            type="text"
            disabled={!record.listed}
            onClick={() => toggleBusinessStatus(record)}
          >
            {record.status === 'operating' ? '暂停营业' : '恢复营业'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="font-serif brand-heading-md">酒店监管</h2>
        <Input 
          placeholder="搜索酒店名称" 
          prefix={<SearchOutlined />} 
          style={{ width: 300, borderRadius: 20 }} 
        />
      </div>
      <div className="brand-card">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: true }}
          expandable={{
            expandedRowRender: (record) => {
              const rooms = record.RoomTypes || [];
              const roomCols = [
                { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
                { title: '房型名称', dataIndex: 'name', key: 'name', width: 160 },
                { title: '默认价', dataIndex: 'base_price', key: 'base_price', width: 120, render: (p) => `¥${p}` },
                { title: '库存', dataIndex: 'total_stock', key: 'total_stock', width: 90 },
                {
                  title: '房态',
                  key: 'status',
                  width: 110,
                  render: (_, rt) => {
                    if (!record.listed) return <Tag color="default">休息中</Tag>;
                    if (rt.status === 'offline') return <Tag color="red">已下线</Tag>;
                    if (rt.status === 'sold_out') return <Tag color="orange">已售罄</Tag>;
                    return <Tag color="green">可售</Tag>;
                  }
                },
                {
                  title: '审核状态',
                  key: 'audit_status',
                  width: 110,
                  render: (_, rt) => renderRoomAuditStatus(rt),
                },
                { title: '床型', dataIndex: 'bed_type', key: 'bed_type', width: 140, render: (v) => asText(v) },
                { title: '面积(㎡)', dataIndex: 'room_size_sqm', key: 'room_size_sqm', width: 110, render: (v) => asText(v) },
                { title: '楼层', dataIndex: 'floor_info', key: 'floor_info', width: 120, render: (v) => asText(v) },
                {
                  title: '操作',
                  key: 'action',
                  width: 220,
                  render: (_, rt) => {
                    const s = rt.audit_status || (rt.status === 'available' ? 'approved' : 'pending');
                    if (s !== 'pending') return null;
                    return (
                      <Space size="middle">
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          disabled={!record.listed}
                          onClick={() => handleRoomAudit(record.id, rt, 'approve')}
                        >
                          通过
                        </Button>
                        <Button
                          danger
                          size="small"
                          icon={<CloseCircleOutlined />}
                          disabled={!record.listed}
                          onClick={() => handleRoomAudit(record.id, rt, 'reject')}
                        >
                          驳回
                        </Button>
                      </Space>
                    );
                  }
                },
              ];

              return (
                <Table
                  columns={roomCols}
                  dataSource={rooms.map((r) => ({ ...r, key: r.id }))}
                  pagination={false}
                  size="small"
                  scroll={{ x: 1200 }}
                  expandable={{
                    expandedRowRender: (rt) => (
                      <Descriptions size="small" bordered column={2}>
                        <Descriptions.Item label="描述">{asText(rt.description)}</Descriptions.Item>
                        <Descriptions.Item label="下线原因">{asText(rt.offline_reason)}</Descriptions.Item>
                        <Descriptions.Item label="驳回原因">{asText(rt.audit_reason)}</Descriptions.Item>
                        <Descriptions.Item label="WiFi">{asText(rt.has_wifi)}</Descriptions.Item>
                        <Descriptions.Item label="窗户">{asText(rt.has_window)}</Descriptions.Item>
                        <Descriptions.Item label="清洁服务">{asText(rt.has_housekeeping)}</Descriptions.Item>
                        <Descriptions.Item label="禁烟">{asText(rt.is_non_smoking)}</Descriptions.Item>
                        <Descriptions.Item label="含早餐">{asText(rt.includes_breakfast)}</Descriptions.Item>
                        <Descriptions.Item label="客房设施">{asText(rt.guest_facilities)}</Descriptions.Item>
                        <Descriptions.Item label="饮品和食品">{asText(rt.food_drink)}</Descriptions.Item>
                        <Descriptions.Item label="家具设施">{asText(rt.furniture)}</Descriptions.Item>
                        <Descriptions.Item label="卫浴设施">{asText(rt.bathroom_facilities)}</Descriptions.Item>
                        <Descriptions.Item label="图片">{asText(rt.image_urls)}</Descriptions.Item>
                        <Descriptions.Item label="创建时间">{asText(rt.createdAt)}</Descriptions.Item>
                        <Descriptions.Item label="更新时间">{asText(rt.updatedAt)}</Descriptions.Item>
                      </Descriptions>
                    ),
                    rowExpandable: () => true,
                  }}
                />
              );
            },
            rowExpandable: (record) => (record.RoomTypes || []).length > 0,
          }}
        />
      </div>

      <Drawer
        title="酒店详情"
        placement="right"
        width={860}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {detailHotel && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="酒店ID">{asText(detailHotel.id)}</Descriptions.Item>
              <Descriptions.Item label="所属商家">{asText(detailHotel.merchant)}</Descriptions.Item>
              <Descriptions.Item label="酒店名称" span={2}>{asText(detailHotel.name)}</Descriptions.Item>
              <Descriptions.Item label="地址" span={2}>{asText(detailHotel.address)}</Descriptions.Item>
              <Descriptions.Item label="经度">{asText(detailHotel.longitude)}</Descriptions.Item>
              <Descriptions.Item label="纬度">{asText(detailHotel.latitude)}</Descriptions.Item>
              <Descriptions.Item label="星级">{asText(detailHotel.star_level)}</Descriptions.Item>
              <Descriptions.Item label="评分">{asText(detailHotel.rating)}</Descriptions.Item>
              <Descriptions.Item label="平台上架">{asText(detailHotel.listed)}</Descriptions.Item>
              <Descriptions.Item label="下架原因">{asText(detailHotel.unlist_reason)}</Descriptions.Item>
              <Descriptions.Item label="经营状态">{asText(detailHotel.status)}</Descriptions.Item>
              <Descriptions.Item label="最小价">{asText(detailHotel.minPrice)}</Descriptions.Item>
              <Descriptions.Item label="封面">{asText(detailHotel.image_url)}</Descriptions.Item>
              <Descriptions.Item label="图片列表" span={2}>{asText(detailHotel.image_urls)}</Descriptions.Item>
              <Descriptions.Item label="简介" span={2}>{asText(detailHotel.description)}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{asText(detailHotel.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{asText(detailHotel.updatedAt)}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 600 }}>房型详情</div>
            <Table
              size="small"
              rowKey="id"
              dataSource={(detailHotel.RoomTypes || []).map((r) => ({ ...r, key: r.id }))}
              pagination={false}
              scroll={{ x: 1600 }}
              columns={[
                { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
                { title: '名称', dataIndex: 'name', key: 'name', width: 160 },
                { title: '默认价', dataIndex: 'base_price', key: 'base_price', width: 120, render: (p) => `¥${p}` },
                { title: '库存', dataIndex: 'total_stock', key: 'total_stock', width: 90 },
                { title: '状态', dataIndex: 'status', key: 'status', width: 110, render: (v) => asText(v) },
                { title: '审核', dataIndex: 'audit_status', key: 'audit_status', width: 110, render: (v, rt) => renderRoomAuditStatus(rt) },
                { title: '床型', dataIndex: 'bed_type', key: 'bed_type', width: 140, render: (v) => asText(v) },
                { title: '面积', dataIndex: 'room_size_sqm', key: 'room_size_sqm', width: 110, render: (v) => asText(v) },
                { title: '楼层', dataIndex: 'floor_info', key: 'floor_info', width: 120, render: (v) => asText(v) },
                { title: 'WiFi', dataIndex: 'has_wifi', key: 'has_wifi', width: 90, render: (v) => asText(v) },
                { title: '窗户', dataIndex: 'has_window', key: 'has_window', width: 90, render: (v) => asText(v) },
                { title: '清洁', dataIndex: 'has_housekeeping', key: 'has_housekeeping', width: 90, render: (v) => asText(v) },
                { title: '禁烟', dataIndex: 'is_non_smoking', key: 'is_non_smoking', width: 90, render: (v) => asText(v) },
                { title: '早餐', dataIndex: 'includes_breakfast', key: 'includes_breakfast', width: 90, render: (v) => asText(v) },
                { title: '下线原因', dataIndex: 'offline_reason', key: 'offline_reason', width: 180, render: (v) => asText(v) },
                { title: '驳回原因', dataIndex: 'audit_reason', key: 'audit_reason', width: 180, render: (v) => asText(v) },
                { title: '描述', dataIndex: 'description', key: 'description', width: 240, render: (v) => asText(v) },
                { title: '图片', dataIndex: 'image_urls', key: 'image_urls', width: 180, render: (v) => asText(v) },
                { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 190, render: (v) => asText(v) },
                { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 190, render: (v) => asText(v) },
              ]}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default HotelList;
