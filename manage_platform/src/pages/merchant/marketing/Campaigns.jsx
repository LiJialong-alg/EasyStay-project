import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Empty, Form, InputNumber, Modal, Row, Select, Space, Spin, Table, Tag, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getHotels } from '../../../services/hotelService';
import { applyActivity, cancelActivity, getActivityCatalog, getActivityPricing, getMyActivityEnrollments } from '../../../services/activityService';

const Campaigns = () => {
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeActivity, setActiveActivity] = useState(null);
  const [activeHotelId, setActiveHotelId] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const pricingMode = Form.useWatch('pricing_mode', form);
  const discountType = Form.useWatch('discount_type', form);
  const discountValue = Form.useWatch('discount_value', form);

  const enrollmentMap = useMemo(() => {
    const m = new Map();
    for (const e of enrollments || []) {
      m.set(`${e.activity_code}:${e.hotel_id}`, e);
    }
    return m;
  }, [enrollments]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [cRes, hRes, eRes] = await Promise.all([
        getActivityCatalog(),
        getHotels(),
        getMyActivityEnrollments(),
      ]);
      setCatalog(cRes.data || []);
      setHotels(hRes.data || []);
      setEnrollments(eRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openApply = async (activity) => {
    setActiveActivity(activity);
    const firstHotelId = hotels?.[0]?.id || null;
    setActiveHotelId(firstHotelId);
    form.resetFields();
    setModalOpen(true);
    if (!firstHotelId) return;
    setPricingLoading(true);
    try {
      const res = await getActivityPricing(activity.code, firstHotelId);
      const enrollment = res.data?.enrollment || null;
      const map = {};
      for (const row of res.data?.room_prices || []) {
        map[String(row.room_type_id)] = Number(row.price);
      }
      form.setFieldsValue({
        date_range: enrollment?.start_at && enrollment?.end_at ? [dayjs(enrollment.start_at), dayjs(enrollment.end_at)] : undefined,
        pricing_mode: enrollment?.pricing_mode || 'manual',
        discount_type: enrollment?.discount_type || 'rate',
        discount_value: enrollment?.discount_value !== null && enrollment?.discount_value !== undefined ? Number(enrollment.discount_value) : undefined,
        room_prices: map,
      });
    } finally {
      setPricingLoading(false);
    }
  };

  const loadPricing = async (activity, hotelId) => {
    if (!activity || !hotelId) return;
    setPricingLoading(true);
    try {
      const res = await getActivityPricing(activity.code, hotelId);
      const enrollment = res.data?.enrollment || null;
      const map = {};
      for (const row of res.data?.room_prices || []) {
        map[String(row.room_type_id)] = Number(row.price);
      }
      form.setFieldsValue({
        date_range: enrollment?.start_at && enrollment?.end_at ? [dayjs(enrollment.start_at), dayjs(enrollment.end_at)] : undefined,
        pricing_mode: enrollment?.pricing_mode || 'manual',
        discount_type: enrollment?.discount_type || 'rate',
        discount_value: enrollment?.discount_value !== null && enrollment?.discount_value !== undefined ? Number(enrollment.discount_value) : undefined,
        room_prices: map,
      });
    } finally {
      setPricingLoading(false);
    }
  };

  const computedActivityPrice = useMemo(() => {
    if (pricingMode !== 'discount') return null;
    const dType = discountType || 'rate';
    const dVal = Number(discountValue);
    if (!Number.isFinite(dVal)) return (base) => base;
    if (dType === 'rate') return (base) => Number((base * dVal / 10).toFixed(2));
    if (dType === 'amount') return (base) => Number((base - dVal).toFixed(2));
    return (base) => base;
  }, [discountType, discountValue, pricingMode]);

  const roomRows = useMemo(() => {
    const h = hotels.find((x) => x.id === activeHotelId) || null;
    return h?.RoomTypes || [];
  }, [activeHotelId, hotels]);

  const roomColumns = useMemo(() => [
    {
      title: '房型',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: '默认价',
      dataIndex: 'base_price',
      key: 'base_price',
      render: (v) => `¥${Number(v || 0)}`,
    },
    {
      title: '活动价',
      key: 'activity_price',
      render: (_, r) => {
        const base = Number(r.base_price || 0);
        if (pricingMode === 'discount') {
          const price = computedActivityPrice ? computedActivityPrice(base) : base;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>¥{Number.isFinite(price) ? price : '-'}</span>
              <Tag style={{ margin: 0 }}>自动计算</Tag>
            </div>
          );
        }
        return (
          <Form.Item
            name={['room_prices', String(r.id)]}
            style={{ margin: 0 }}
            rules={[
              { required: true, message: '请输入活动价' },
              {
                validator: (_, value) => {
                  const n = Number(value);
                  if (!Number.isFinite(n) || n <= 0) return Promise.reject(new Error('活动价无效'));
                  if (n > Number(r.base_price || 0)) return Promise.reject(new Error('不能高于默认价'));
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber min={1} precision={0} style={{ width: 140 }} />
          </Form.Item>
        );
      },
    },
  ], [computedActivityPrice, form, pricingMode]);

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="brand-heading-md" style={{ margin: 0 }}>活动报名</h2>
        <Button icon={<ReloadOutlined />} onClick={refresh}>刷新</Button>
      </div>

      <Spin spinning={loading}>
        {catalog.length === 0 ? (
          <Card className="brand-card">
            <Empty description="暂无活动" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {catalog.map((a) => (
              <Col key={a.code} xs={24} md={12} lg={8}>
                <Card
                  className="brand-card"
                  title={<span className="font-serif brand-heading-sm">{a.title}</span>}
                  extra={<Tag color={a.tag === '推荐' ? 'green' : a.tag === '热门' ? 'orange' : 'blue'}>{a.tag}</Tag>}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <div style={{ color: '#475569', lineHeight: 1.7 }}>{a.subtitle}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Tag>可设置活动价</Tag>
                    <Tag>即时生效</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>按酒店报名，支持多活动并存</span>
                    <Button type="primary" style={{ background: '#0f172a', borderColor: '#0f172a' }} onClick={() => openApply(a)}>报名/管理</Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      <Modal
        title={activeActivity ? `活动报名：${activeActivity.title}` : '活动报名'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setActiveActivity(null); setActiveHotelId(null); form.resetFields(); }}
        okText="保存活动价"
        cancelText="关闭"
        confirmLoading={saving}
        onOk={async () => {
          if (!activeActivity) return;
          if (!activeHotelId) return message.error('请先选择酒店');
          const values = await form.validateFields();
          const range = values.date_range || null;
          if (!range || !range[0] || !range[1]) return message.error('请选择活动时间');
          const startAt = dayjs(range[0]).startOf('day').toISOString();
          const endAt = dayjs(range[1]).endOf('day').toISOString();
          const mode = values.pricing_mode || 'manual';
          const payload = {
            hotel_id: activeHotelId,
            start_at: startAt,
            end_at: endAt,
            pricing_mode: mode,
          };
          if (mode === 'discount') {
            payload.discount_type = values.discount_type || 'rate';
            payload.discount_value = values.discount_value;
          } else {
            const roomPricesMap = values.room_prices || {};
            payload.room_prices = roomRows.map((r) => ({
              room_type_id: r.id,
              price: roomPricesMap[String(r.id)],
            }));
          }
          setSaving(true);
          try {
            await applyActivity(activeActivity.code, payload);
            message.success('已保存活动价');
            setModalOpen(false);
            setActiveActivity(null);
            setActiveHotelId(null);
            form.resetFields();
            refresh();
          } finally {
            setSaving(false);
          }
        }}
      >
        <Spin spinning={pricingLoading}>
          <Form form={form} layout="vertical">
            <Form.Item label="选择酒店" required>
              <Space.Compact style={{ width: '100%' }}>
                <Select
                  value={activeHotelId}
                  onChange={async (v) => {
                    setActiveHotelId(v);
                    form.setFieldsValue({ room_prices: {} });
                    await loadPricing(activeActivity, v);
                  }}
                  placeholder="请选择酒店"
                  style={{ flex: 1 }}
                  options={(hotels || []).map((h) => ({ label: h.name, value: h.id }))}
                />
                <Button
                  danger
                  disabled={!activeActivity || !activeHotelId || !enrollmentMap.has(`${activeActivity?.code}:${activeHotelId}`)}
                  onClick={() => {
                    Modal.confirm({
                      title: '取消报名',
                      content: '确认取消该酒店的活动报名？活动价将被移除。',
                      okText: '确认',
                      cancelText: '取消',
                      okButtonProps: { danger: true },
                      onOk: async () => {
                        if (!activeActivity || !activeHotelId) return;
                        await cancelActivity(activeActivity.code, activeHotelId);
                        message.success('已取消报名');
                        setModalOpen(false);
                        setActiveActivity(null);
                        setActiveHotelId(null);
                        form.resetFields();
                        refresh();
                      },
                    });
                  }}
                >
                  取消报名
                </Button>
              </Space.Compact>
            </Form.Item>

            <Form.Item
              name="date_range"
              label="活动时间"
              rules={[{ required: true, message: '请选择活动时间' }]}
            >
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item name="pricing_mode" label="定价方式" initialValue="manual" rules={[{ required: true }]}>
              <Select
                options={[
                  { label: '自定义活动价', value: 'manual' },
                  { label: '按折扣/优惠自动计算', value: 'discount' },
                ]}
              />
            </Form.Item>

            {pricingMode === 'discount' && (
              <Space style={{ width: '100%' }} size={12} align="start">
                <Form.Item name="discount_type" label="折扣类型" initialValue="rate" rules={[{ required: true }]}>
                  <Select
                    style={{ width: 180 }}
                    options={[
                      { label: '折扣（x 折）', value: 'rate' },
                      { label: '立减金额（元）', value: 'amount' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="discount_value"
                  label={discountType === 'amount' ? '优惠金额' : '折扣'}
                  rules={[
                    { required: true, message: '请输入折扣/优惠' },
                    {
                      validator: (_, v) => {
                        const n = Number(v);
                        if (!Number.isFinite(n)) return Promise.reject(new Error('数值无效'));
                        if ((discountType || 'rate') === 'rate') {
                          if (n <= 0 || n > 10) return Promise.reject(new Error('请输入 0~10 的折扣'));
                        } else {
                          if (n < 0) return Promise.reject(new Error('金额不能为负'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    style={{ width: 220 }}
                    placeholder={discountType === 'amount' ? '例如 50' : '例如 8.5'}
                  />
                </Form.Item>
                <div style={{ color: '#94a3b8', fontSize: 12, paddingTop: 30 }}>
                  自动按默认价计算并写入活动价
                </div>
              </Space>
            )}

            {roomRows.length === 0 ? (
              <Card className="brand-card">
                <Empty description="该酒店暂无房型" />
              </Card>
            ) : (
              <Table
                rowKey="id"
                columns={roomColumns}
                dataSource={roomRows}
                pagination={false}
                size="small"
              />
            )}
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default Campaigns;
