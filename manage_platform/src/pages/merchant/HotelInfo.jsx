import React, { useEffect, useMemo, useState } from 'react';
import { Table, Tag, Upload, Button, message, Spin, Modal, Form, Input, InputNumber, Space, Tooltip, Select, Drawer, Descriptions, Switch, List, Carousel } from 'antd';
import { UploadOutlined, EnvironmentOutlined, ReloadOutlined, EditOutlined, EyeOutlined, AimOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getHotels, updateHotelInfo, updateRoomType, uploadHotelImage, uploadRoomImage, deleteHotel, createRoomType, deleteRoomType, updateHotelSelfListing } from '../../services/hotelService';
import { createHotelListingRequest, getMyHotelListingRequests } from '../../services/hotelService';
import { updateRoomStatus } from '../../services/roomService';
import { createHotelRegistrationRequest, getMyHotelRegistrationRequests } from '../../services/hotelRegistrationService';

const HotelInfo = () => {
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [hotelModalOpen, setHotelModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState('hotel');
  const [mapQuery, setMapQuery] = useState('');
  const [mapResults, setMapResults] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingRoomHotelId, setEditingRoomHotelId] = useState(null);
  const [detailHotel, setDetailHotel] = useState(null);
  const [hotelQuery, setHotelQuery] = useState('');
  const [hotelCoverFileList, setHotelCoverFileList] = useState([]);
  const [roomImageFileList, setRoomImageFileList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [listingRequests, setListingRequests] = useState([]);
  const [regRequests, setRegRequests] = useState([]);
  const [regOpen, setRegOpen] = useState(false);
  const [regCoverFileList, setRegCoverFileList] = useState([]);
  const [regSaving, setRegSaving] = useState(false);
  const [regForm] = Form.useForm();
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyHotel, setApplyHotel] = useState(null);
  const [applyReason, setApplyReason] = useState('');
  const [applying, setApplying] = useState(false);
  const [hotelForm] = Form.useForm();
  const [roomForm] = Form.useForm();

  const parseTagValue = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(v)
        .split(/,|，|\n/)
        .map(s => s.trim())
        .filter(Boolean);
    }
  };

  const parseImageUrls = (entity) => {
    const raw = entity?.image_urls;
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (raw && typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {}
    }
    if (entity?.image_url) return [entity.image_url];
    return [];
  };

  const toUploadFileListFromUrls = (urls, prefix) => {
    return (urls || []).map((url, idx) => ({
      uid: `${prefix}-${idx}`,
      name: `image-${idx + 1}`,
      status: 'done',
      url,
    }));
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const [res, reqRes, regRes] = await Promise.all([
        getHotels(),
        getMyHotelListingRequests(),
        getMyHotelRegistrationRequests(),
      ]);
      setHotels(res.data || []);
      setListingRequests(reqRes.data || []);
      setRegRequests(regRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const openEditHotel = (hotel) => {
    setEditingHotel(hotel);
    hotelForm.setFieldsValue({
      name: hotel.name,
      address: hotel.address,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      status: hotel.status,
      star_level: hotel.star_level,
      description: hotel.description,
    });
    setHotelCoverFileList(toUploadFileListFromUrls(parseImageUrls(hotel).slice(0, 5), `hotel-${hotel.id}`));
    setHotelModalOpen(true);
  };

  const openHotelDetail = (hotel) => {
    setDetailHotel(hotel);
    setDetailOpen(true);
  };

  const confirmDeleteHotel = (hotel) => {
    Modal.confirm({
      title: '删除酒店',
      content: `确认删除“${hotel.name}”？删除后不可恢复。`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteHotel(hotel.id);
        message.success('已删除');
        fetchHotels();
      },
    });
  };

  const saveHotel = async () => {
    const values = await hotelForm.validateFields();
    setSaving(true);
    try {
      const existingUrls = hotelCoverFileList.filter((f) => Boolean(f.url)).map((f) => f.url);
      const newFiles = hotelCoverFileList.filter((f) => f.originFileObj).map((f) => f.originFileObj);
      const uploaded = [];
      for (const file of newFiles) {
        const res = await uploadHotelImage(file);
        if (res.data?.url) uploaded.push(res.data.url);
      }
      const finalUrls = [...existingUrls, ...uploaded].slice(0, 5);
      await updateHotelInfo(editingHotel.id, { ...values, image_urls: finalUrls });
      message.success('酒店信息已更新');
      setHotelModalOpen(false);
      fetchHotels();
    } finally {
      setSaving(false);
    }
  };

  const openCreateRoom = (hotel) => {
    setEditingRoom(null);
    setEditingRoomHotelId(hotel.id);
    roomForm.resetFields();
    roomForm.setFieldsValue({
      has_wifi: true,
      has_window: true,
      has_housekeeping: true,
      is_non_smoking: true,
      includes_breakfast: false,
    });
    setRoomImageFileList([]);
    setRoomModalOpen(true);
  };

  const openEditRoom = (hotelId, room) => {
    setEditingRoomHotelId(hotelId);
    setEditingRoom(room);
    roomForm.setFieldsValue({
      name: room.name,
      base_price: Number(room.base_price),
      total_stock: Number(room.total_stock),
      status: room.status,
      description: room.description,
      bed_type: room.bed_type,
      room_size_sqm: room.room_size_sqm !== null && room.room_size_sqm !== undefined ? Number(room.room_size_sqm) : undefined,
      floor_info: room.floor_info,
      has_wifi: room.has_wifi !== undefined ? Boolean(room.has_wifi) : true,
      has_window: room.has_window !== undefined ? Boolean(room.has_window) : true,
      has_housekeeping: room.has_housekeeping !== undefined ? Boolean(room.has_housekeeping) : true,
      is_non_smoking: room.is_non_smoking !== undefined ? Boolean(room.is_non_smoking) : true,
      includes_breakfast: room.includes_breakfast !== undefined ? Boolean(room.includes_breakfast) : false,
      guest_facilities: parseTagValue(room.guest_facilities),
      food_drink: parseTagValue(room.food_drink),
      furniture: parseTagValue(room.furniture),
      bathroom_facilities: parseTagValue(room.bathroom_facilities),
    });
    setRoomImageFileList(toUploadFileListFromUrls(parseImageUrls(room).slice(0, 9), `room-${room.id}`));
    setRoomModalOpen(true);
  };

  const saveRoom = async () => {
    const values = await roomForm.validateFields();
    setSaving(true);
    try {
      const existingUrls = roomImageFileList.filter((f) => Boolean(f.url)).map((f) => f.url);
      const newFiles = roomImageFileList.filter((f) => f.originFileObj).map((f) => f.originFileObj);
      const uploaded = [];
      for (const file of newFiles) {
        const res = await uploadRoomImage(file);
        if (res.data?.url) uploaded.push(res.data.url);
      }
      const finalUrls = [...existingUrls, ...uploaded].slice(0, 9);
      if (editingRoom?.id) {
        await updateRoomType(editingRoom.id, { ...values, image_urls: finalUrls });
        message.success('房型信息已更新');
      } else {
        await createRoomType(editingRoomHotelId, { ...values, image_urls: finalUrls });
        message.success('已新增房型，等待平台审核');
      }
      setRoomModalOpen(false);
      fetchHotels();
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteRoom = (room) => {
    Modal.confirm({
      title: '确认删除房型？',
      content: `删除后不可恢复：${room.name || ''}`,
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await deleteRoomType(room.id);
        message.success('已删除房型');
        fetchHotels();
      },
    });
  };

  const handleRoomToggle = (room, checked) => {
    const nextStatus = checked ? 'available' : 'offline';
    let reason = '';
    if (nextStatus === 'available') {
      updateRoomStatus(room.id, 'available').then(() => {
        message.success('房型已上线');
        fetchHotels();
      });
      return;
    }
    Modal.confirm({
      title: '确认下线房型？',
      content: (
        <div>
          <div style={{ marginBottom: 12 }}>{`确定要下线 "${room.name}" 吗？`}</div>
          <Input.TextArea rows={3} placeholder="请输入下线原因（可选）" onChange={(e) => { reason = e.target.value; }} />
        </div>
      ),
      onOk: async () => {
        await updateRoomStatus(room.id, 'offline', reason);
        message.success('房型已下线');
        fetchHotels();
      }
    });
  };

  const runGeocode = async () => {
    const q = (mapQuery || '').trim();
    if (!q) return;
    setMapLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=8&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'zh-CN' } });
      const data = await res.json();
      setMapResults(Array.isArray(data) ? data : []);
    } finally {
      setMapLoading(false);
    }
  };

  const selectLocation = (item) => {
    const lat = Number(item.lat);
    const lon = Number(item.lon);
    const form = mapTarget === 'register' ? regForm : hotelForm;
    form.setFieldsValue({
      address: item.display_name,
      latitude: lat,
      longitude: lon,
    });
    setMapModalOpen(false);
  };

  const isMerchantUnlisted = (hotel) => {
    const r = (hotel?.unlist_reason || '').toString();
    return r.startsWith('商家自主下线');
  };

  const confirmSelfUnlistHotel = (hotel) => {
    let reason = '';
    Modal.confirm({
      title: '确认下线酒店？',
      content: (
        <div>
          <div style={{ marginBottom: 12 }}>{`确定要下线 "${hotel.name}" 吗？`}</div>
          <Input.TextArea rows={3} placeholder="请输入下线原因（可选）" onChange={(e) => { reason = e.target.value; }} />
        </div>
      ),
      okText: '下线',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await updateHotelSelfListing(hotel.id, false, reason);
        message.success('酒店已下线');
        fetchHotels();
      },
    });
  };

  const confirmSelfListHotel = (hotel) => {
    Modal.confirm({
      title: '确认上线酒店？',
      content: `确定要上线 "${hotel.name}" 吗？`,
      okText: '上线',
      cancelText: '取消',
      onOk: async () => {
        await updateHotelSelfListing(hotel.id, true);
        message.success('酒店已上线');
        fetchHotels();
      },
    });
  };

  const columns = [
    {
      title: '酒店',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{name}</span>
          {!record.listed && (
            <Tooltip title={record.unlist_reason || '已下线'}>
              <Tag color="red" style={{ margin: 0 }}>{isMerchantUnlisted(record) ? '商家已下线' : '平台已下线'}</Tag>
            </Tooltip>
          )}
          <Tag color={(record.listed ? record.status : 'closed') === 'operating' ? 'green' : 'default'} style={{ margin: 0 }}>
            {(record.listed ? record.status : 'closed') === 'operating' ? '营业中' : '休息中'}
          </Tag>
        </div>
      )
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      render: (v) => (
        <span style={{ color: 'var(--color-text-sub)' }}>
          <EnvironmentOutlined /> {v || '-'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => openHotelDetail(record)}>详情</Button>
          <Button type="link" size="small" style={{ padding: 0 }} onClick={() => openEditHotel(record)}>编辑</Button>
          {record.listed ? (
            <Button
              type="link"
              size="small"
              danger
              style={{ padding: 0 }}
              onClick={() => confirmSelfUnlistHotel(record)}
            >
              下线
            </Button>
          ) : isMerchantUnlisted(record) ? (
            <Button
              type="link"
              size="small"
              style={{ padding: 0, color: '#0f172a' }}
              onClick={() => confirmSelfListHotel(record)}
            >
              上线
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              disabled={Boolean(listingRequests.some((r) => r.hotel_id === record.id && r.status === 'pending'))}
              onClick={() => { setApplyHotel(record); setApplyReason(''); setApplyOpen(true); }}
              style={{ padding: 0, color: '#0f172a' }}
            >
              {listingRequests.some((r) => r.hotel_id === record.id && r.status === 'pending') ? '申请中' : '申请上线'}
            </Button>
          )}
          <Button type="link" size="small" danger style={{ padding: 0 }} onClick={() => confirmDeleteHotel(record)}>删除</Button>
        </Space>
      )
    }
  ];

  const filteredHotels = useMemo(() => {
    const q = (hotelQuery || '').trim().toLowerCase();
    if (!q) return hotels;
    return (hotels || []).filter((h) => ((h?.name || '').toString().toLowerCase().includes(q)));
  }, [hotels, hotelQuery]);

  const expandedRowRender = (hotel) => {
    const roomColumns = [
      { title: '房型', dataIndex: 'name', key: 'name', render: (v, r) => <span style={{ fontWeight: 600 }}>{v}</span> },
      { title: '默认价', dataIndex: 'base_price', key: 'base_price', render: (v) => `¥${Number(v)}` },
      { title: '库存', dataIndex: 'total_stock', key: 'total_stock' },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (v, r) => {
          if (!hotel.listed) return <Tag color="default">休息中</Tag>;
          if (v === 'offline') {
            return (
              <Tooltip title={r.offline_reason || '已下线'}>
                <Tag color="red">已下线</Tag>
              </Tooltip>
            );
          }
          if (v === 'sold_out') return <Tag color="orange">已售罄</Tag>;
          return <Tag color="green">可售</Tag>;
        }
      },
      {
        title: '审核',
        dataIndex: 'audit_status',
        key: 'audit_status',
        render: (v, r) => {
          if (!hotel.listed) return <span style={{ color: '#94a3b8' }}>-</span>;
          if (v === 'pending') return <Tag color="orange">待审核</Tag>;
          if (v === 'rejected') return <Tooltip title={r.audit_reason || '已驳回'}><Tag color="red">已驳回</Tag></Tooltip>;
          return <Tag color="blue">已通过</Tag>;
        }
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, room) => (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEditRoom(hotel.id, room)}>编辑</Button>
            <Button
              size="small"
              danger={room.status !== 'offline'}
              disabled={!hotel.listed}
              onClick={() => handleRoomToggle(room, room.status === 'offline')}
            >
              {room.status === 'offline' ? '上线' : '下线'}
            </Button>
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => confirmDeleteRoom(room)}>删除</Button>
          </Space>
        )
      }
    ];

    return (
      <div>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>房型管理</div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateRoom(hotel)} disabled={!hotel.listed}>
            新增房型
          </Button>
        </div>
        <Table
          rowKey="id"
          columns={roomColumns}
          dataSource={hotel.RoomTypes || []}
          pagination={false}
          size="small"
        />
      </div>
    );
  };

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="brand-heading-md" style={{ margin: 0 }}>酒店管理</h2>
        <Space>
          <Button type="primary" style={{ background: '#0f172a', borderColor: '#0f172a' }} onClick={() => { regForm.resetFields(); setRegCoverFileList([]); setRegOpen(true); }}>注册酒店</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchHotels}>刷新</Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input
            allowClear
            value={hotelQuery}
            onChange={(e) => setHotelQuery(e.target.value)}
            placeholder="按酒店名称检索"
            style={{ width: 260 }}
          />
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredHotels}
          expandable={{ expandedRowRender }}
          pagination={false}
        />
      </Spin>


      <Modal
        title="注册酒店"
        open={regOpen}
        onCancel={() => setRegOpen(false)}
        okText="提交审核"
        cancelText="取消"
        confirmLoading={regSaving}
        onOk={async () => {
          const values = await regForm.validateFields();
          setRegSaving(true);
          try {
            const existingUrls = regCoverFileList.filter((f) => Boolean(f.url)).map((f) => f.url);
            const newFiles = regCoverFileList.filter((f) => f.originFileObj).map((f) => f.originFileObj);
            const uploaded = [];
            for (const file of newFiles) {
              const res = await uploadHotelImage(file);
              if (res.data?.url) uploaded.push(res.data.url);
            }
            const image_urls = [...existingUrls, ...uploaded].slice(0, 5);
            await createHotelRegistrationRequest({ ...values, image_urls });
            message.success('已提交注册申请，等待平台审核');
            setRegOpen(false);
            fetchHotels();
          } finally {
            setRegSaving(false);
          }
        }}
      >
        <Form layout="vertical" form={regForm}>
          <Form.Item name="name" label="酒店名称" rules={[{ required: true, message: '请输入酒店名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="star_level" label="酒店星级">
            <Select
              allowClear
              placeholder="请选择（可选）"
              options={[
                { label: '无', value: 0 },
                { label: '一星', value: 1 },
                { label: '二星', value: 2 },
                { label: '三星', value: 3 },
                { label: '四星', value: 4 },
                { label: '五星', value: 5 },
              ]}
            />
          </Form.Item>
          <Form.Item label="地址">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="address" noStyle>
                <Input placeholder="输入地址或通过地图定位（可选）" />
              </Form.Item>
              <Button
                icon={<AimOutlined />}
                onClick={() => {
                  setMapTarget('register');
                  setMapQuery(regForm.getFieldValue('address') || '');
                  setMapModalOpen(true);
                }}
              >
                地图定位
              </Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="latitude" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="longitude" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="酒店简介">
            <Input.TextArea rows={4} placeholder="可填写酒店简介、特色服务、周边交通等（可选）" />
          </Form.Item>
          <Form.Item name="reason" label="申请说明（可选）">
            <Input.TextArea rows={3} placeholder="例如：已准备齐全营业执照/消防验收证明等" />
          </Form.Item>
          <Form.Item label="酒店封面（可选）">
            <Upload
              accept="image/png,image/jpeg,image/webp"
              listType="picture-card"
              fileList={regCoverFileList}
              maxCount={5}
              multiple
              beforeUpload={(file) => {
                const okTypes = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                if (!okTypes) {
                  message.error('仅支持 JPG/PNG/WebP');
                  return Upload.LIST_IGNORE;
                }
                if (file.size > 5 * 1024 * 1024) {
                  message.error('图片不能超过 5MB');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={({ fileList }) => setRegCoverFileList(fileList.slice(0, 5))}
              onPreview={(file) => {
                const url = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
                if (url) window.open(url, '_blank');
              }}
            >
              {regCoverFileList.length >= 5 ? null : <div>上传</div>}
            </Upload>
          </Form.Item>
          <Form.List name="room_types">
            {(fields, { add, remove }) => (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>房型信息（可选）</div>
                  <Button
                    type="link"
                    style={{ padding: 0 }}
                    onClick={() => add({ has_wifi: true, has_window: true, has_housekeeping: true, is_non_smoking: true, includes_breakfast: false })}
                  >
                    + 添加房型
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ border: '1px solid #f1f5f9', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontWeight: 600 }}>房型 {name + 1}</div>
                      <Button type="link" danger onClick={() => remove(name)} style={{ padding: 0 }}>
                        删除
                      </Button>
                    </div>
                    <Space size={12} style={{ width: '100%' }} align="start">
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="房型名称"
                        rules={[{ required: true, message: '请输入房型名称' }]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="例如：豪华大床房" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'base_price']}
                        label="默认价"
                        rules={[{ required: true, message: '请输入默认价' }]}
                        style={{ width: 160, marginBottom: 0 }}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'total_stock']}
                        label="库存"
                        rules={[{ required: true, message: '请输入库存' }]}
                        style={{ width: 140, marginBottom: 0 }}
                      >
                        <InputNumber min={1} precision={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Space>
                    <div style={{ marginTop: 10 }}>
                      <Form.Item {...restField} name={[name, 'description']} label="房型描述" style={{ marginBottom: 0 }}>
                        <Input.TextArea rows={2} placeholder="可选：面积、朝向、景观、备注等" />
                      </Form.Item>
                    </div>
                  </div>
                ))}
                {fields.length === 0 && (
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>不填写也可以提交，后续可在酒店通过审核后新增房型。</div>
                )}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="编辑酒店"
        open={hotelModalOpen}
        onOk={saveHotel}
        onCancel={() => setHotelModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={hotelForm} layout="vertical">
          <Form.Item name="name" label="酒店名称" rules={[{ required: true, message: '请输入酒店名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="star_level" label="酒店星级">
            <Select
              allowClear
              placeholder="请选择（可选）"
              options={[
                { label: '无', value: 0 },
                { label: '一星', value: 1 },
                { label: '二星', value: 2 },
                { label: '三星', value: 3 },
                { label: '四星', value: 4 },
                { label: '五星', value: 5 },
              ]}
            />
          </Form.Item>
          <Form.Item label="地址">
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item name="address" noStyle>
                <Input placeholder="输入地址或通过地图定位" />
              </Form.Item>
              <Button
                icon={<AimOutlined />}
                onClick={() => {
                  setMapTarget('hotel');
                  setMapQuery(hotelForm.getFieldValue('address') || '');
                  setMapModalOpen(true);
                }}
              >
                地图定位
              </Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="latitude" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="longitude" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="经营状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '营业中', value: 'operating' },
                { label: '休息中', value: 'closed' },
              ]}
            />
          </Form.Item>
          <Form.Item name="description" label="酒店简介">
            <Input.TextArea rows={4} placeholder="可填写酒店简介、特色服务、周边交通等" />
          </Form.Item>
          <Form.Item label="酒店封面">
            <Upload
              accept="image/png,image/jpeg,image/webp"
              listType="picture-card"
              fileList={hotelCoverFileList}
              maxCount={5}
              multiple
              beforeUpload={(file) => {
                const okTypes = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                if (!okTypes) {
                  message.error('仅支持 JPG/PNG/WebP');
                  return Upload.LIST_IGNORE;
                }
                if (file.size > 5 * 1024 * 1024) {
                  message.error('图片不能超过 5MB');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={({ fileList }) => setHotelCoverFileList(fileList.slice(0, 5))}
              onPreview={(file) => {
                const url = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
                if (url) window.open(url, '_blank');
              }}
            >
              {hotelCoverFileList.length >= 5 ? null : <div>上传</div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRoom ? '编辑房型' : '新增房型'}
        open={roomModalOpen}
        onOk={saveRoom}
        onCancel={() => setRoomModalOpen(false)}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={720}
      >
        <Form form={roomForm} layout="vertical">
          <Form.Item name="name" label="房型名称" rules={[{ required: true, message: '请输入房型名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="base_price" label="默认价" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="total_stock" label="库存" rules={[{ required: true }]}>
            <InputNumber min={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="bed_type" label="床型">
            <Input placeholder="例如：1.8m大床 / 2×1.2m双床" />
          </Form.Item>
          <Form.Item name="room_size_sqm" label="房间大小(㎡)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="floor_info" label="层数">
            <Input placeholder="例如：5-10层" />
          </Form.Item>
          <Space style={{ display: 'flex', justifyContent: 'space-between' }} wrap>
            <Form.Item name="has_wifi" label="WiFi" valuePropName="checked">
              <Switch checkedChildren="有" unCheckedChildren="无" />
            </Form.Item>
            <Form.Item name="has_window" label="窗户" valuePropName="checked">
              <Switch checkedChildren="有" unCheckedChildren="无" />
            </Form.Item>
            <Form.Item name="has_housekeeping" label="清洁服务" valuePropName="checked">
              <Switch checkedChildren="有" unCheckedChildren="无" />
            </Form.Item>
            <Form.Item name="is_non_smoking" label="禁烟" valuePropName="checked">
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
            <Form.Item name="includes_breakfast" label="早餐" valuePropName="checked">
              <Switch checkedChildren="含" unCheckedChildren="不含" />
            </Form.Item>
          </Space>
          <Form.Item name="guest_facilities" label="客房设施">
            <Select mode="tags" tokenSeparators={[',', '，']} placeholder="回车添加，例如：空调、书桌、投影" />
          </Form.Item>
          <Form.Item name="food_drink" label="饮品和食品">
            <Select mode="tags" tokenSeparators={[',', '，']} placeholder="回车添加，例如：免费水、咖啡、迷你吧" />
          </Form.Item>
          <Form.Item name="furniture" label="家具设施">
            <Select mode="tags" tokenSeparators={[',', '，']} placeholder="回车添加，例如：衣柜、沙发、行李架" />
          </Form.Item>
          <Form.Item name="bathroom_facilities" label="卫浴设施">
            <Select mode="tags" tokenSeparators={[',', '，']} placeholder="回车添加，例如：淋浴、浴缸、吹风机" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="房型图片">
            <Upload
              accept="image/png,image/jpeg,image/webp"
              listType="picture-card"
              fileList={roomImageFileList}
              maxCount={9}
              multiple
              beforeUpload={(file) => {
                const okTypes = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                if (!okTypes) {
                  message.error('仅支持 JPG/PNG/WebP');
                  return Upload.LIST_IGNORE;
                }
                if (file.size > 5 * 1024 * 1024) {
                  message.error('图片不能超过 5MB');
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              onChange={({ fileList }) => setRoomImageFileList(fileList.slice(0, 9))}
              onPreview={(file) => {
                const url = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
                if (url) window.open(url, '_blank');
              }}
            >
              {roomImageFileList.length >= 9 ? null : <div>上传</div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="申请酒店上线"
        open={applyOpen}
        confirmLoading={applying}
        okText="提交申请"
        cancelText="取消"
        onCancel={() => setApplyOpen(false)}
        onOk={async () => {
          if (!applyHotel) return;
          setApplying(true);
          try {
            await createHotelListingRequest(applyHotel.id, applyReason);
            message.success('已提交上线申请');
            setApplyOpen(false);
            fetchHotels();
          } finally {
            setApplying(false);
          }
        }}
      >
        <div style={{ color: 'var(--color-text-sub)', marginBottom: 8 }}>
          酒店：<span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>{applyHotel?.name}</span>
        </div>
        <Input.TextArea rows={4} value={applyReason} onChange={(e) => setApplyReason(e.target.value)} placeholder="可选：填写申请说明（例如已补齐资质材料/已整改完成…）" />
      </Modal>

      <Drawer
        title="酒店详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={860}
      >
        {detailHotel && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 260, flexShrink: 0 }}>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                  <Carousel autoplay dots={{ className: 'brand-carousel-dots' }}>
                    {(parseImageUrls(detailHotel).length > 0 ? parseImageUrls(detailHotel) : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80']).slice(0, 5).map((url) => (
                      <div key={url}>
                        <img
                          alt={detailHotel.name}
                          src={url}
                          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
                {detailHotel.latitude && detailHotel.longitude && (
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <iframe
                      title="map"
                      width="100%"
                      height="180"
                      style={{ border: 0, display: 'block' }}
                      src={`https://www.openstreetmap.org/export/embed.html?marker=${detailHotel.latitude},${detailHotel.longitude}&zoom=15`}
                    />
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <Descriptions
                  bordered
                  size="small"
                  column={2}
                  items={[
                    { key: 'name', label: '酒店名称', children: detailHotel.name },
                    { key: 'status', label: '经营状态', children: (detailHotel.listed ? detailHotel.status : 'closed') === 'operating' ? '营业中' : '休息中' },
                    { key: 'listed', label: '平台状态', children: detailHotel.listed ? <Tag color="green">已上架</Tag> : <Tooltip title={detailHotel.unlist_reason || '已下线'}><Tag color="red">已下线</Tag></Tooltip> },
                    { key: 'addr', label: '地址', children: detailHotel.address || '-' },
                  ]}
                />
              </div>
            </div>

            <div style={{ fontWeight: 600, marginBottom: 8 }}>房型详情</div>
            <List
              dataSource={detailHotel.RoomTypes || []}
              locale={{ emptyText: '暂无房型' }}
              renderItem={(room) => (
                <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 92, height: 68, borderRadius: 10, overflow: 'hidden', border: '1px solid #f1f5f9', flexShrink: 0 }}>
                        <img
                          alt={room.name}
                          src={(parseImageUrls(room)[0] || parseImageUrls(detailHotel)[0] || room.image_url || detailHotel.image_url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80')}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ fontWeight: 600, color: 'var(--brand-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</div>
                          <div style={{ fontWeight: 600 }}>¥{Number(room.base_price || 0)}</div>
                        </div>
                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {room.bed_type && <Tag style={{ margin: 0 }}>{room.bed_type}</Tag>}
                          {room.room_size_sqm && <Tag style={{ margin: 0 }}>{Number(room.room_size_sqm)}㎡</Tag>}
                          {room.floor_info && <Tag style={{ margin: 0 }}>{room.floor_info}</Tag>}
                          {room.has_wifi ? <Tag color="blue" style={{ margin: 0 }}>WiFi</Tag> : <Tag style={{ margin: 0 }}>无WiFi</Tag>}
                          {room.has_window ? <Tag color="blue" style={{ margin: 0 }}>有窗</Tag> : <Tag style={{ margin: 0 }}>无窗</Tag>}
                          {room.is_non_smoking ? <Tag color="green" style={{ margin: 0 }}>禁烟</Tag> : <Tag color="default" style={{ margin: 0 }}>可吸烟</Tag>}
                          {room.includes_breakfast ? <Tag color="gold" style={{ margin: 0 }}>含早餐</Tag> : <Tag style={{ margin: 0 }}>不含早餐</Tag>}
                          {!detailHotel.listed && <Tag color="default" style={{ margin: 0 }}>休息中</Tag>}
                          {detailHotel.listed && room.status === 'offline' && <Tooltip title={room.offline_reason || '已下线'}><Tag color="red" style={{ margin: 0 }}>已下线</Tag></Tooltip>}
                          {room.audit_status === 'pending' && <Tooltip title={room.audit_reason || '待审核'}><Tag color="orange" style={{ margin: 0 }}>待审核</Tag></Tooltip>}
                          {room.audit_status === 'rejected' && <Tooltip title={room.audit_reason || '已驳回'}><Tag color="red" style={{ margin: 0 }}>已驳回</Tag></Tooltip>}
                        </div>
                        {(room.description || '').trim() && (
                          <div style={{ marginTop: 6, color: 'var(--color-text-sub)', fontSize: 12, lineHeight: 1.5 }}>
                            {room.description}
                          </div>
                        )}
                        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                          {[
                            { label: '客房设施', value: parseTagValue(room.guest_facilities) },
                            { label: '饮品和食品', value: parseTagValue(room.food_drink) },
                            { label: '家具设施', value: parseTagValue(room.furniture) },
                            { label: '卫浴设施', value: parseTagValue(room.bathroom_facilities) },
                          ].map((g) => (
                            <div key={g.label} style={{ border: '1px solid #f1f5f9', borderRadius: 10, padding: 10 }}>
                              <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 6 }}>{g.label}</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {(g.value || []).slice(0, 8).map((t) => (
                                  <Tag key={`${g.label}-${t}`} style={{ margin: 0 }}>{t}</Tag>
                                ))}
                                {(g.value || []).length === 0 && <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>-</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Drawer>

      <Modal
        title="地图定位"
        open={mapModalOpen}
        onCancel={() => setMapModalOpen(false)}
        footer={null}
        width={860}
      >
        <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
          <Input
            value={mapQuery}
            onChange={(e) => setMapQuery(e.target.value)}
            placeholder="输入酒店地址/地标，例如：北京 朝阳 CBD"
            onPressEnter={runGeocode}
          />
          <Button type="primary" loading={mapLoading} icon={<AimOutlined />} onClick={runGeocode}>定位</Button>
        </Space.Compact>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
          <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
            <List
              size="small"
              dataSource={mapResults}
              locale={{ emptyText: mapLoading ? '定位中...' : '暂无结果' }}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectLocation(item)}
                >
                  <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.display_name}</div>
                    <div style={{ color: 'var(--color-text-sub)' }}>{Number(item.lat).toFixed(6)}, {Number(item.lon).toFixed(6)}</div>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
            {mapResults[0] ? (
              <iframe
                title="map-preview"
                width="100%"
                height="520"
                style={{ border: 0, display: 'block' }}
                src={`https://www.openstreetmap.org/export/embed.html?marker=${mapResults[0].lat},${mapResults[0].lon}&zoom=15`}
              />
            ) : (
              <div style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-sub)' }}>
                输入地址并点击“定位”
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HotelInfo;
