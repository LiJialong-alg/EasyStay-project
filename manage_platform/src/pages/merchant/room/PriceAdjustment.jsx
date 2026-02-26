import React, { useState, useEffect } from 'react';
/**
 * @component PriceAdjustment
 * @description 批量改价页面
 * @features
 * 1. 展示酒店列表
 * 2. 选择酒店后展示房型列表
 * 3. 支持选择日期范围、勾选房型进行批量改价（设置划线价和售价）
 */
import { Card, Input, List, Checkbox, Button, Modal, DatePicker, InputNumber, Row, Col, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getHotels } from '../../../services/hotelService';
import { getRoomTypes, batchUpdatePrice } from '../../../services/roomService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const PriceAdjustment = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelList, setHotelList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [selectedRoomKeys, setSelectedRoomKeys] = useState([]);
  const [hotelQuery, setHotelQuery] = useState('');
  const [roomQuery, setRoomQuery] = useState('');
  
  // Form State
  const [dates, setDates] = useState([]);
  const [originalPrice, setOriginalPrice] = useState(null);
  const [newPrice, setNewPrice] = useState(null);

  useEffect(() => {
      loadHotels();
  }, []);

  const filteredHotels = (() => {
    const q = (hotelQuery || '').trim().toLowerCase();
    if (!q) return hotelList;
    return (hotelList || []).filter((h) => {
      const name = (h?.name || '').toString().toLowerCase();
      const id = (h?.id ?? '').toString().toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  })();

  const filteredRooms = (() => {
    const q = (roomQuery || '').trim().toLowerCase();
    if (!q) return roomList;
    return (roomList || []).filter((r) => ((r?.name || '').toString().toLowerCase().includes(q)));
  })();

  const loadHotels = async () => {
      try {
          const res = await getHotels();
          // Map response to match UI needs
          const mapped = res.data.map(h => ({
              ...h,
              img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80', // Fallback
          }));
          setHotelList(mapped);
      } catch (error) {
          // handled by interceptor
      }
  };

  const handleCardClick = async (hotel) => {
      if (hotel?.listed === false) {
          message.warning(`该酒店已下线${hotel?.unlist_reason ? `：${hotel.unlist_reason}` : ''}`);
          return;
      }
      setSelectedHotel(hotel);
      try {
          const res = await getRoomTypes(hotel.id);
          setRoomList(res.data);
          setSelectedRoomKeys([]);
          setDates([]);
          setOriginalPrice(null);
          setNewPrice(null);
          setIsModalVisible(true);
      } catch (error) {
          // handled
      }
  };

  const handleBatchUpdate = async () => {
      if (selectedRoomKeys.length === 0) {
          message.warning('请至少选择一个房型进行改价');
          return;
      }
      if (!dates || dates.length !== 2) {
          message.warning('请选择时间范围');
          return;
      }
      if (!newPrice) {
          message.warning('请输入实际售卖价格');
          return;
      }

      const payload = {
          hotelId: selectedHotel.id,
          roomTypeIds: selectedRoomKeys,
          dateRange: {
              start: dates[0].format('YYYY-MM-DD'),
              end: dates[1].format('YYYY-MM-DD')
          },
          newPrice: newPrice,
          // originalPrice is not used in backend logic currently, but could be stored if schema supported it
      };

      try {
          const res = await batchUpdatePrice(payload);
          message.success(`成功更新价格！受影响记录数: ${res.data.updated || 0}`);
          setIsModalVisible(false);
      } catch (error) {
          // handled
      }
  };

  const handleRoomSelect = (id, checked) => {
      if (checked) {
          setSelectedRoomKeys(prev => [...prev, id]);
      } else {
          setSelectedRoomKeys(prev => prev.filter(k => k !== id));
      }
  };

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24 }}>
          <Input 
            placeholder="输入酒店ID或名称搜索" 
            prefix={<SearchOutlined style={{ color: 'var(--brand-primary)' }} />} 
            style={{ width: 300, borderRadius: 'var(--radius-sm)' }} 
            className="brand-input"
            allowClear
            value={hotelQuery}
            onChange={(e) => setHotelQuery(e.target.value)}
          />
      </div>

      <List
        grid={{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={filteredHotels}
        renderItem={item => (
            <List.Item>
                <Card
                    hoverable
                    className="brand-card"
                    cover={<img alt={item.name} src={item.img} style={{ height: 160, objectFit: 'cover' }} />}
                    onClick={() => handleCardClick(item)}
                    bordered={false}
                >
                    <Card.Meta 
                        title={<span className="font-serif brand-heading-sm">{item.name}</span>} 
                        description={
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                                <Text type="secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>ID: {item.id}</Text>
                                <Text strong style={{ color: 'var(--brand-accent)', fontSize: 16, fontFamily: 'var(--font-serif)' }}>¥{item.minPrice}<span style={{ fontSize: 12, fontWeight: 'normal' }}> 起</span></Text>
                            </div>
                        } 
                    />
                </Card>
            </List.Item>
        )}
      />

      <Modal
        title={<span className="font-serif brand-heading-sm">{selectedHotel ? `批量改价 - ${selectedHotel.name}` : '批量改价'}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)} style={{ borderRadius: 'var(--radius-sm)' }}>取消</Button>,
            <Button key="save" type="primary" onClick={handleBatchUpdate} className="brand-btn-primary">保存应用</Button>
        ]}
        width={800}
        className="brand-modal"
      >
        <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8 }} className="brand-text-primary font-serif">选择时间范围:</div>
            <RangePicker 
                style={{ width: '100%' }} 
                className="brand-input" 
                value={dates}
                onChange={setDates}
            />
        </div>

        <div style={{ marginBottom: 24, maxHeight: 400, overflowY: 'auto', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-sm)' }}>
             <List
                header={
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid var(--brand-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontWeight: 600 }}>选择需要改价的房型</span>
                          <Input
                            allowClear
                            value={roomQuery}
                            onChange={(e) => setRoomQuery(e.target.value)}
                            placeholder="按房型名称检索"
                            prefix={<SearchOutlined style={{ color: 'var(--brand-primary)' }} />}
                            style={{ width: 220 }}
                            className="brand-input"
                          />
                        </div>
                        <Checkbox 
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedRoomKeys(filteredRooms.map(r => r.id));
                                } else {
                                    setSelectedRoomKeys([]);
                                }
                            }}
                            checked={filteredRooms.length > 0 && selectedRoomKeys.length === filteredRooms.length}
                            indeterminate={selectedRoomKeys.length > 0 && selectedRoomKeys.length < filteredRooms.length}
                        >
                            全选
                        </Checkbox>
                    </div>
                }
                dataSource={filteredRooms}
                locale={{ emptyText: '暂无房型' }}
                renderItem={item => (
                    <List.Item style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => handleRoomSelect(item.id, !selectedRoomKeys.includes(item.id))}>
                        <Checkbox 
                            checked={selectedRoomKeys.includes(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleRoomSelect(item.id, e.target.checked)}
                        >
                            <span style={{ fontWeight: 500 }}>{item.name}</span>
                            <span style={{ color: '#64748b', marginLeft: 8 }}>(当前: ¥{item.base_price})</span>
                        </Checkbox>
                    </List.Item>
                )}
             />
        </div>
        
        <Row gutter={16}>
            <Col span={12}>
                <div style={{ marginBottom: 8 }} className="brand-text-primary font-serif">折前价 (原价):</div>
                <InputNumber 
                    style={{ width: '100%', textDecoration: 'line-through', color: '#999' }} 
                    prefix="¥" 
                    placeholder="展示用划线价"
                    className="brand-input"
                    value={originalPrice}
                    onChange={setOriginalPrice}
                />
            </Col>
            <Col span={12}>
                <div style={{ marginBottom: 8 }} className="brand-text-primary font-serif">折后价 (售价):</div>
                <InputNumber 
                    style={{ width: '100%' }} 
                    prefix="¥" 
                    placeholder="实际售卖价格"
                    className="brand-input"
                    value={newPrice}
                    onChange={setNewPrice}
                />
            </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default PriceAdjustment;
