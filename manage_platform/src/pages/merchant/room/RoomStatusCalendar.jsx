import React, { useState, useEffect, useMemo } from 'react';
/**
 * @component RoomStatusCalendar
 * @description 房态日历页面
 * @features
 * 1. 展示未来10天的房态日历（价格、库存、状态）
 * 2. 支持切换酒店
 * 3. 点击日历单元格进行单日房态设置（改价、改库存、开关房、标记售罄）
 */
import { Card, Select, Button, Modal, Form, InputNumber, Switch, Radio, message, Tooltip, Row, Col, Spin, DatePicker, Segmented, Alert, Tag, Input } from 'antd';
import { SettingOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getHotels, updateRoomType } from '../../../services/hotelService';
import { getRoomCalendar, batchUpdatePrice } from '../../../services/roomService';

const { RangePicker } = DatePicker;

const RoomStatusCalendar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [dates, setDates] = useState([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [dayCount, setDayCount] = useState(10);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [hotelQuery, setHotelQuery] = useState('');
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomQuery, setRoomQuery] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [bulkVisible, setBulkVisible] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkForm] = Form.useForm();

  // Initialize dates
  useEffect(() => {
      loadHotels();
  }, []);

  useEffect(() => {
    const nextDays = Array.from({ length: dayCount }, (_, i) => {
      const d = dayjs(startDate).add(i, 'day');
      return {
        full: d.format('YYYY-MM-DD'),
        display: d.format('MM-DD'),
        week: d.format('ddd')
      };
    });
    setDates(nextDays);
  }, [startDate, dayCount]);

  const loadHotels = async () => {
      try {
          const res = await getHotels();
          setHotels(res.data);
          if (res.data.length > 0) {
              setSelectedHotel(res.data[0].id);
          }
      } catch (error) {
          // handled
      }
  };

  useEffect(() => {
      if (selectedHotel && dates.length > 0) {
          loadCalendarData();
      }
  }, [selectedHotel, dates]);

  const filteredRoomTypes = useMemo(() => {
    const q = (roomQuery || '').trim().toLowerCase();
    if (!q) return roomTypes;
    return (roomTypes || []).filter((rt) => ((rt?.name || '').toString().toLowerCase().includes(q)));
  }, [roomTypes, roomQuery]);

  const filteredHotels = useMemo(() => {
    const q = (hotelQuery || '').trim().toLowerCase();
    if (!q) return hotels;
    return (hotels || []).filter((h) => ((h?.name || '').toString().toLowerCase().includes(q)));
  }, [hotels, hotelQuery]);

  useEffect(() => {
    if (selectedHotel && !filteredHotels.some((h) => h.id === selectedHotel)) {
      setSelectedHotel(filteredHotels[0]?.id || null);
    }
  }, [filteredHotels, selectedHotel]);

  const loadCalendarData = async () => {
      setLoading(true);
      try {
          const res = await getRoomCalendar({
              hotelId: selectedHotel,
              startDate: dates[0].full,
              endDate: dates[dates.length - 1].full
          });
          setRoomTypes(res.data.roomTypes);
          setInventory(res.data.inventory);
      } catch (error) {
          // handled
      } finally {
          setLoading(false);
      }
  };

  // Helper to get or init cell data
  const getCellData = (roomId, date) => {
      const item = inventory.find(i => i.room_type_id === roomId && i.date === date);
      const room = roomTypes.find(r => r.id === roomId);
      
      if (item) {
          return {
              status: item.status,
              price: item.price,
              count: item.available_stock,
              mode: 'full' // Assuming default for now as DB doesn't have mode
          };
      }
      
      // Default init from room type base info
      return { 
          status: room ? (room.status === 'sold_out' ? 'sold_out' : 'available') : 'available',
          price: room ? room.base_price : 0, 
          count: room ? room.total_stock : 0,
          mode: 'full'
      };
  };

  const handleCellClick = (room, date) => {
    const currentHotel = hotels.find((h) => h.id === selectedHotel);
    if (currentHotel?.listed === false) {
      message.warning(`该酒店已下线${currentHotel?.unlist_reason ? `：${currentHotel.unlist_reason}` : ''}`);
      return;
    }
    if (room?.status === 'offline') {
      message.warning('该房型已下线，无法进行房态/改价/开关房操作');
      return;
    }
    const data = getCellData(room.id, date.full);
    setSelectedCell({ room, date, data });
    form.setFieldsValue({
        price: data.price,
        status: data.status !== 'closed', // true = open, false = closed
        isSoldOut: data.status === 'sold_out',
        count: data.count,
        mode: data.mode,
        alsoUpdateBasePrice: false
    });
    setIsModalVisible(true);
  };

  const handleSave = async (values) => {
      const { price, status, isSoldOut, count, mode, alsoUpdateBasePrice } = values;
      let newStatus = 'available';
      if (!status) newStatus = 'closed';
      else if (isSoldOut || count <= 0) newStatus = 'sold_out';

      try {
          if (alsoUpdateBasePrice && selectedCell?.room?.id) {
            await updateRoomType(selectedCell.room.id, { base_price: price });
          }
          // Use batch update API for single cell update
          await batchUpdatePrice({
              hotelId: selectedHotel,
              roomTypeIds: [selectedCell.room.id],
              dateRange: {
                  start: selectedCell.date.full,
                  end: selectedCell.date.full
              },
              newPrice: price,
              newStock: count,
              status: newStatus // Pass the calculated status (sold_out/closed/available)
          });
          
          // Since my batchUpdatePrice in backend now supports status update, 
          // I can rely on reloading to get fresh data.
          
          message.success('房态设置已更新');
          setIsModalVisible(false);
          loadCalendarData(); // Reload to get fresh data
      } catch (error) {
          // handled
      }
  };

  const openBulk = () => {
    const currentHotel = hotels.find((h) => h.id === selectedHotel);
    if (currentHotel?.listed === false) {
      message.warning(`该酒店已下线${currentHotel?.unlist_reason ? `：${currentHotel.unlist_reason}` : ''}`);
      return;
    }
    bulkForm.setFieldsValue({
      roomTypeIds: roomTypes.filter((r) => r.status !== 'offline').map((r) => r.id),
      dateRange: [dayjs(), dayjs().add(6, 'day')],
      newPrice: null,
      newStock: null,
    });
    setBulkVisible(true);
  };

  const submitBulk = async (values) => {
    const { roomTypeIds, dateRange, newPrice, newStock } = values || {};
    if (!roomTypeIds || roomTypeIds.length === 0) {
      message.warning('请至少选择一个房型');
      return;
    }
    if (!dateRange || dateRange.length !== 2) {
      message.warning('请选择时间范围');
      return;
    }
    if (newPrice === undefined || newPrice === null) {
      message.warning('请输入售价');
      return;
    }
    setBulkLoading(true);
    try {
      const res = await batchUpdatePrice({
        hotelId: selectedHotel,
        roomTypeIds,
        dateRange: { start: dateRange[0].format('YYYY-MM-DD'), end: dateRange[1].format('YYYY-MM-DD') },
        newPrice,
        newStock: newStock === undefined || newStock === null ? undefined : newStock,
      });
      message.success(`批量改价成功！受影响记录数: ${res.data?.updated || 0}`);
      setBulkVisible(false);
      loadCalendarData();
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {(() => {
        const currentHotel = hotels.find((h) => h.id === selectedHotel);
        if (currentHotel?.listed === false) {
          return (
            <Alert
              type="warning"
              showIcon
              message="该酒店已下线"
              description={`${currentHotel?.unlist_reason ? `原因：${currentHotel.unlist_reason}；` : ''}下线酒店及其房间不可进行任何接单/房态/改价操作。`}
              style={{ marginBottom: 16 }}
            />
          );
        }
        return null;
      })()}
      <Card 
        className="brand-card"
        title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className="font-serif brand-heading-md">房态日历</span>
                <DatePicker value={startDate} onChange={(v) => v && setStartDate(v)} allowClear={false} />
                <Segmented
                  value={dayCount}
                  onChange={setDayCount}
                  options={[
                    { label: '10天', value: 10 },
                    { label: '14天', value: 14 },
                    { label: '30天', value: 30 },
                  ]}
                />
                <Input
                  allowClear
                  value={hotelQuery}
                  onChange={(e) => setHotelQuery(e.target.value)}
                  placeholder="搜索酒店名称"
                  prefix={<SearchOutlined style={{ color: 'var(--brand-primary)' }} />}
                  style={{ width: 220, borderRadius: 'var(--radius-sm)' }}
                  className="brand-input"
                />
                <Select 
                    value={selectedHotel} 
                    onChange={setSelectedHotel} 
                    style={{ width: 200 }} 
                    className="brand-select"
                >
                    {filteredHotels.map(h => (
                      <Select.Option key={h.id} value={h.id}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span>{h.name}</span>
                          {h.listed === false && (
                            <Tag color="red" style={{ margin: 0 }}>
                              {(h?.unlist_reason || '').toString().startsWith('商家自主下线') ? '商家已下线' : '平台已下线'}
                            </Tag>
                          )}
                          {h.status === 'closed' && <Tag style={{ margin: 0 }}>休息中</Tag>}
                        </span>
                      </Select.Option>
                    ))}
                </Select>
                <Input
                  allowClear
                  value={roomQuery}
                  onChange={(e) => setRoomQuery(e.target.value)}
                  placeholder="按房型名称检索"
                  prefix={<SearchOutlined style={{ color: 'var(--brand-primary)' }} />}
                  style={{ width: 220, borderRadius: 'var(--radius-sm)' }}
                  className="brand-input"
                />
            </div>
        } 
        extra={
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13 }}>
            <Button onClick={openBulk} className="brand-btn-default">批量改价</Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#fff', border: '1px solid #ddd', borderRadius: 2 }}></div> 可售</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#ff4d4f', borderRadius: 2 }}></div> 已售罄</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#d9d9d9', borderRadius: 2 }}></div> 关房</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: '#94a3b8', borderRadius: 2 }}></div> 下线</div>
          </div>
      }>
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                    <tr>
                        <th style={{ padding: 12, background: 'var(--brand-bg-light)', border: '1px solid var(--brand-border)', width: 150, color: 'var(--brand-secondary)' }}>房型 / 日期</th>
                        {dates.map(d => (
                            <th key={d.full} style={{ padding: 12, background: 'var(--brand-bg-light)', border: '1px solid var(--brand-border)', minWidth: 80 }}>
                                <div style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{d.display}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 'normal' }}>{d.week}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                         <tr><td colSpan={dates.length + 1} style={{ padding: 40 }}><Spin /></td></tr>
                    ) : filteredRoomTypes.map(room => (
                        <tr key={room.id}>
                            <td style={{ padding: 12, border: '1px solid var(--brand-border)', fontWeight: 600, background: '#fff', color: 'var(--brand-primary)' }}>
                                {room.name}
                                {room.status === 'offline' && <div style={{ marginTop: 6 }}><Tag color="red" style={{ margin: 0 }}>已下线</Tag></div>}
                            </td>
                            {dates.map(d => {
                                const cellData = getCellData(room.id, d.full);
                                const isOffline = room.status === 'offline';
                                const isSoldOut = cellData.status === 'sold_out';
                                const isClosed = cellData.status === 'closed';
                                
                                let bg = '#fff';
                                let color = 'inherit';
                                let text = '';

                                if (isOffline) {
                                    bg = '#94a3b8';
                                    color = '#fff';
                                    text = '已下线';
                                } else if (isClosed) {
                                    bg = '#f1f5f9';
                                    color = '#94a3b8';
                                    text = '关房';
                                } else if (isSoldOut) {
                                    bg = '#fef2f2'; // Light red
                                    color = '#ef4444';
                                    text = '已售罄';
                                }

                                return (
                                    <td 
                                        key={d.full}
                                        onClick={() => {
                                          if (isOffline) return;
                                          handleCellClick(room, d);
                                        }}
                                        style={{ 
                                            padding: 12, 
                                            border: '1px solid var(--brand-border)', 
                                            cursor: 'pointer',
                                            background: bg,
                                            color: color,
                                            transition: 'all 0.2s'
                                        }}
                                        className="calendar-cell hover:shadow-inner"
                                    >
                                        {text ? (
                                            <div style={{ fontSize: 12, fontWeight: 500 }}>{text}</div>
                                        ) : (
                                            <>
                                                <div style={{ fontWeight: 700, color: 'var(--brand-accent)' }}>¥{cellData.price}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>余{cellData.count}</div>
                                            </>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal
        title={<span className="font-serif brand-heading-sm">{selectedCell ? `房态设置 - ${selectedCell.room.name} (${selectedCell.date.display})` : '房态设置'}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="brand-modal"
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="price" label={<span className="brand-text-primary">当日售价</span>}>
                        <InputNumber prefix="¥" style={{ width: '100%' }} className="brand-input" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="count" label={<span className="brand-text-primary">剩余库存</span>}>
                        <InputNumber style={{ width: '100%' }} min={0} className="brand-input" />
                    </Form.Item>
                </Col>
            </Row>
            
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item name="status" label={<span className="brand-text-primary">开关房状态</span>} valuePropName="checked">
                        <Switch checkedChildren="开房" unCheckedChildren="关房" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="isSoldOut" label={<span className="brand-text-primary">是否售罄</span>} valuePropName="checked">
                        <Switch checkedChildren="是" unCheckedChildren="否" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="mode" label={<span className="brand-text-primary">售卖模式</span>}>
                <Radio.Group>
                    <Radio.Button value="full">全日房</Radio.Button>
                    <Radio.Button value="hour">4小时钟点房</Radio.Button>
                </Radio.Group>
            </Form.Item>
            <Form.Item name="alsoUpdateBasePrice" valuePropName="checked">
              <Switch checkedChildren="同步默认价" unCheckedChildren="不同步默认价" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block className="brand-btn-primary">保存设置</Button>
        </Form>
      </Modal>

      <Modal
        title={<span className="font-serif brand-heading-sm">批量改价</span>}
        open={bulkVisible}
        onCancel={() => setBulkVisible(false)}
        onOk={() => bulkForm.submit()}
        confirmLoading={bulkLoading}
        okText="保存"
        cancelText="取消"
        width={640}
        className="brand-modal"
      >
        <Form layout="vertical" form={bulkForm} onFinish={submitBulk}>
          <Form.Item name="roomTypeIds" label={<span className="brand-text-primary">选择房型</span>}>
            <Select
              mode="multiple"
              placeholder="请选择房型"
              className="brand-select"
              options={roomTypes
                .filter((r) => r.status !== 'offline')
                .map((r) => ({ label: `${r.name} (默认¥${r.base_price})`, value: r.id }))}
            />
          </Form.Item>
          <Form.Item name="dateRange" label={<span className="brand-text-primary">时间范围</span>}>
            <RangePicker style={{ width: '100%' }} className="brand-input" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="newPrice" label={<span className="brand-text-primary">售价</span>}>
                <InputNumber prefix="¥" style={{ width: '100%' }} className="brand-input" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="newStock" label={<span className="brand-text-primary">库存（可选）</span>}>
                <InputNumber style={{ width: '100%' }} className="brand-input" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomStatusCalendar;
