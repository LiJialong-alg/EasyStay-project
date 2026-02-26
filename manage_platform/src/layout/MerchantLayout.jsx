import React, { useEffect, useMemo, useState } from 'react';
/**
 * @component MerchantLayout
 * @description 商家端整体布局组件
 * @features
 * 1. 侧边栏导航 (Sider) - 包含 Logo 和多级菜单
 * 2. 顶部导航栏 (Header) - 包含面包屑、搜索、通知、用户头像
 * 3. 内容区域 (Content) - 渲染子路由组件
 * 4. 底部版权 (Footer)
 */
import { Layout, Menu, Badge, Avatar, Breadcrumb, Modal, Drawer, List, Tabs, Dropdown, Button, Upload, message, Input, Tag, Space } from 'antd';
import {
  DashboardOutlined,
  OrderedListOutlined,
  HomeOutlined,
  ShopOutlined,
  StarOutlined,
  BarChartOutlined,
  PayCircleOutlined,
  InfoCircleOutlined,
  BellOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  UploadOutlined,
  LogoutOutlined,
  SettingOutlined,
  ScheduleOutlined,
  AppstoreAddOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';
import { getConversations, getMessages, sendMessage } from '../services/chatService';
import { getMerchantNotifications, readAllNotifications, readNotification } from '../services/notificationService';
import dayjs from 'dayjs';
import './MerchantLayout.css';

const { Header, Sider, Content, Footer } = Layout;
const { SubMenu } = Menu;

const MerchantLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [systemDetailOpen, setSystemDetailOpen] = useState(false);
  const [systemDetailMinimized, setSystemDetailMinimized] = useState(false);
  const [activeSystemItem, setActiveSystemItem] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [notificationData, setNotificationData] = useState({ counts: { system: 0, interaction: 0 }, system: [], interaction: [] });
  const [notificationLoading, setNotificationLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  const notificationCount = useMemo(() => {
    const c = notificationData?.counts || {};
    return Number(c.system || 0) + Number(c.interaction || 0);
  }, [notificationData]);

  const fetchNotifications = async () => {
    setNotificationLoading(true);
    try {
      const res = await getMerchantNotifications();
      setNotificationData(res.data || { counts: { system: 0, interaction: 0 }, system: [], interaction: [] });
    } finally {
      setNotificationLoading(false);
    }
  };

  const loadConversations = async () => {
    const res = await getConversations();
    const list = res.data || [];
    setConversations(list);
    if (list.length > 0) setActiveConversationId(list[0].id);
  };

  const loadMessages = async (conversationId) => {
    const res = await getMessages(conversationId);
    setChatMessages(res.data || []);
  };

  useEffect(() => {
    if (!messageVisible) return;
    loadConversations();
  }, [messageVisible]);

  useEffect(() => {
    if (!notificationVisible) return;
    fetchNotifications();
  }, [notificationVisible]);

  useEffect(() => {
    if (!activeConversationId) return;
    loadMessages(activeConversationId);
  }, [activeConversationId]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [
      {
        title: <Link to="/merchant/dashboard">商户中心</Link>,
        key: 'home',
      },
    ];
    
    const pathMap = {
      'dashboard': '首页看板',
      'hotel': '酒店管理',
      'info': '酒店信息',
      'order': '订单管理',
      'list': '订单列表',
      'settings': '接单设置',
      'room': '房态管理',
      'calendar': '房态日历',
      'setup': '房型调整',
      'marketing': '活动推广',
      'campaigns': '活动报名',
      'reviews': '评价管理',
      'finance': '财务管理',
      'merchant': '商户端'
    };

    pathSnippets.forEach((snippet, index) => {
        if (snippet === 'merchant') return;
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        breadcrumbItems.push({
            title: pathMap[snippet] || snippet,
            key: url,
        });
    });

    return breadcrumbItems;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => setProfileVisible(true)
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账号设置'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout
    }
  ];

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  return (
    <Layout style={{ minHeight: '100vh' }} className="theme-merchant">
      <Sider 
        width={240} 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="custom-scrollbar"
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0
        }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)', 
            borderRadius: 8, 
            marginRight: collapsed ? 0 : 12,
            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
          }}></div>
          {!collapsed && <span style={{ fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display' }}>易宿</span>}
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={['order', 'room', 'marketing']}
              style={{ marginTop: 16, borderRight: 0 }}
              onClick={({ key }) => navigate(key)}
              items={[
                { key: '/merchant/dashboard', icon: <DashboardOutlined />, label: '首页看板' },
                { key: '/merchant/hotel/info', icon: <InfoCircleOutlined />, label: '酒店管理' },
                {
                  key: 'order',
                  icon: <OrderedListOutlined />,
                  label: '订单管理',
                  children: [
                    { key: '/merchant/order/list', label: '订单列表' },
                    { key: '/merchant/order/settings', label: '接单设置' },
                  ]
                },
                {
                  key: 'room',
                  icon: <HomeOutlined />,
                  label: '房态管理',
                  children: [
                    { key: '/merchant/room/calendar', icon: <ScheduleOutlined />, label: '房态/房价' },
                  ]
                },
                {
                  key: 'marketing',
                  icon: <ShopOutlined />,
                  label: '营销中心',
                  children: [
                     { key: '/merchant/marketing/campaigns', label: '活动报名' },
                  ]
                },
                { key: '/merchant/reviews', icon: <StarOutlined />, label: '评价管理' },
                { key: '/merchant/finance', icon: <PayCircleOutlined />, label: '财务管理' },
              ]}
            />
        </div>
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header className="merchant-header" style={{ 
          padding: '0 32px', 
          background: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(12px)',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          borderBottom: '1px solid #f1f5f9',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 64
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
             <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Badge count={notificationCount} size="small" offset={[0, 0]} color="#d97706">
              <BellOutlined 
                  style={{ fontSize: 20, cursor: 'pointer', color: '#64748b' }} 
                  onClick={() => setNotificationVisible(true)}
              />
            </Badge>
            <Badge dot offset={[-2, 2]} color="#d97706">
              <MessageOutlined 
                  style={{ fontSize: 20, cursor: 'pointer', color: '#64748b' }} 
                  onClick={() => setMessageVisible(true)}
              />
            </Badge>
            <CustomerServiceOutlined style={{ fontSize: 20, cursor: 'pointer', color: '#64748b' }} onClick={() => setMessageVisible(true)} />
            
            <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 8px' }}></div>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }} trigger={['click']}>
              <div className="user-profile" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px 8px', borderRadius: 6, transition: 'all 0.2s' }}>
                  <Avatar 
                      icon={<UserOutlined />} 
                      src={userInfo?.avatar} 
                      style={{ marginRight: 12, backgroundColor: '#d97706', border: '2px solid #fef3c7' }} 
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 14 }}>{userInfo?.name || 'Alexander'}</span>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Merchant Owner</span>
                  </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px 32px',
            minHeight: 280,
            overflow: 'initial'
          }}
        >
          <Outlet />
        </Content>
        
        <Footer style={{ textAlign: 'center', color: '#94a3b8', background: 'transparent', padding: '24px 0 48px' }}>
          易宿 ©2024
        </Footer>
      </Layout>

      {/* Interactive Components */}
      
      {/* 1. Notification Drawer */}
      <Drawer
        title="通知中心"
        placement="right"
        onClose={() => setNotificationVisible(false)}
        open={notificationVisible}
        width={400}
        headerStyle={{ borderBottom: '1px solid #f1f5f9' }}
      >
        <Tabs
          defaultActiveKey="system"
          className="custom-tabs"
          tabBarExtraContent={
            <Space size={8}>
              <Button
                size="small"
                onClick={async () => {
                  await readAllNotifications('interaction');
                  fetchNotifications();
                }}
              >
                全部已读
              </Button>
              <Button size="small" onClick={fetchNotifications} loading={notificationLoading}>刷新</Button>
            </Space>
          }
          items={[
            {
              key: 'system',
              label: `系统通知${notificationData?.counts?.system ? ` (${notificationData.counts.system})` : ''}`,
              children: (
                <List
                  loading={notificationLoading}
                  itemLayout="horizontal"
                  dataSource={notificationData.system || []}
                  locale={{ emptyText: <span style={{ color: '#94a3b8' }}>暂无系统通知</span> }}
                  renderItem={(item) => (
                    <List.Item
                      className="notification-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setActiveSystemItem(item);
                        setSystemDetailOpen(true);
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>{item.title}</span>
                            <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                              {dayjs(item.published_at || item.createdAt).format('MM-DD HH:mm')}
                            </span>
                          </div>
                        }
                        description={
                          <span
                            style={{
                              color: '#64748b',
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              overflow: 'hidden',
                            }}
                          >
                            {String(item.content || item.description || '')}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'interaction',
              label: `互动提醒${notificationData?.counts?.interaction ? ` (${notificationData.counts.interaction})` : ''}`,
              children: (
                <List
                  loading={notificationLoading}
                  itemLayout="horizontal"
                  dataSource={notificationData.interaction || []}
                  locale={{ emptyText: <span style={{ color: '#94a3b8' }}>暂无互动提醒</span> }}
                  renderItem={(n) => (
                    <List.Item
                      className="notification-item"
                      style={{ cursor: 'pointer' }}
                      onClick={async () => {
                        if (!n.is_read) await readNotification(n.id);
                        fetchNotifications();
                        navigate('/merchant/reviews');
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                              {!n.is_read && <Tag color="#ef4444" style={{ margin: 0, fontSize: 10, lineHeight: '16px', height: 16, padding: '0 4px' }}>NEW</Tag>}
                              {n.title}
                            </span>
                            <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>
                              {dayjs(n.createdAt).format('MM-DD HH:mm')}
                            </span>
                          </div>
                        }
                        description={
                          <span
                            style={{
                              color: '#64748b',
                              display: '-webkit-box',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                              overflow: 'hidden',
                            }}
                          >
                            {String(n.description || '')}
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Drawer>

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>{activeSystemItem?.title || '系统通知'}</span>
            <Space size={8}>
              <Button
                size="small"
                type="link"
                style={{ padding: 0 }}
                onClick={() => {
                  setSystemDetailOpen(false);
                  setSystemDetailMinimized(true);
                }}
              >
                最小化
              </Button>
              <Button
                size="small"
                type="link"
                style={{ padding: 0 }}
                onClick={() => { setSystemDetailOpen(false); setSystemDetailMinimized(false); setActiveSystemItem(null); }}
              >
                关闭
              </Button>
            </Space>
          </div>
        }
        open={systemDetailOpen}
        onCancel={() => { setSystemDetailOpen(false); setSystemDetailMinimized(false); setActiveSystemItem(null); }}
        footer={null}
        zIndex={2000}
        width={760}
        centered
        bodyStyle={{ maxHeight: '65vh', overflowY: 'auto' }}
      >
        <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 12 }}>
          {activeSystemItem ? dayjs(activeSystemItem.published_at || activeSystemItem.createdAt).format('YYYY-MM-DD HH:mm') : ''}
        </div>
        <div style={{ color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {activeSystemItem?.content || activeSystemItem?.description || '-'}
        </div>
      </Modal>

      {systemDetailMinimized && activeSystemItem && (
        <div
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 2100,
            background: '#0f172a',
            color: '#fff',
            borderRadius: 12,
            padding: '10px 12px',
            boxShadow: '0 12px 30px rgba(2,6,23,0.35)',
            width: 320,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSystemItem.title || '系统通知'}
            </div>
            <Space size={8}>
              <Button
                size="small"
                type="link"
                style={{ padding: 0, color: '#fff' }}
                onClick={() => { setSystemDetailMinimized(false); setSystemDetailOpen(true); }}
              >
                恢复
              </Button>
              <Button
                size="small"
                type="link"
                style={{ padding: 0, color: '#fff' }}
                onClick={() => { setSystemDetailMinimized(false); setActiveSystemItem(null); }}
              >
                关闭
              </Button>
            </Space>
          </div>
        </div>
      )}

      {/* 2. Message/IM Modal */}
      <Modal
        title="消息中心"
        open={messageVisible}
        onCancel={() => setMessageVisible(false)}
        footer={null}
        width={900}
        bodyStyle={{ height: '600px', display: 'flex', padding: 0 }}
        centered
      >
         <div style={{ width: '280px', borderRight: '1px solid #f1f5f9', overflowY: 'auto', background: '#f8fafc' }}>
            <div style={{ padding: 16 }}>
                <Input placeholder="搜索联系人" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} style={{ borderRadius: 20, background: '#fff' }} bordered={false} />
            </div>
            <List
                itemLayout="horizontal"
                dataSource={conversations.map(c => ({ ...c, active: c.id === activeConversationId }))}
                renderItem={item => (
                    <List.Item
                      style={{ padding: '16px 20px', cursor: 'pointer', background: item.active ? '#fff' : 'transparent', borderLeft: item.active ? '3px solid #d97706' : '3px solid transparent' }}
                      className="message-list-item"
                      onClick={() => setActiveConversationId(item.id)}
                    >
                         <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: item.active ? '#d97706' : '#cbd5e1' }} />}
                            title={<span style={{ fontWeight: item.active ? 600 : 400 }}>{item.title || '会话'}</span>}
                            description={<span style={{ color: '#64748b' }}>点击查看会话</span>}
                        />
                    </List.Item>
                )}
            />
         </div>
         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{activeConversation?.title || '请选择会话'}</span>
                <Button type="text" icon={<SettingOutlined />} />
            </div>
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                {chatMessages.map((m) => (
                  <div key={m.id} style={{ marginBottom: 16, textAlign: m.sender_role === 'merchant' ? 'right' : 'left' }}>
                    <div
                      style={{
                        background: m.sender_role === 'merchant' ? '#0f172a' : '#f1f5f9',
                        color: m.sender_role === 'merchant' ? '#fff' : '#334155',
                        padding: '10px 14px',
                        borderRadius: m.sender_role === 'merchant' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                        display: 'inline-block',
                        maxWidth: '70%',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {m.content}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, marginLeft: m.sender_role === 'merchant' ? 0 : 4, marginRight: m.sender_role === 'merchant' ? 4 : 0 }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12 }}>
                <Input
                  placeholder="输入消息..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onPressEnter={async () => {
                    if (!activeConversationId || !chatText.trim()) return;
                    const text = chatText.trim();
                    setChatText('');
                    await sendMessage(activeConversationId, { sender_role: 'merchant', content: text });
                    loadMessages(activeConversationId);
                  }}
                  style={{ borderRadius: 20, background: '#f8fafc' }}
                  bordered={false}
                  disabled={!activeConversationId}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<UploadOutlined rotate={90} />}
                  style={{ background: '#d97706', borderColor: '#d97706' }}
                  disabled={!activeConversationId || !chatText.trim()}
                  onClick={async () => {
                    if (!activeConversationId || !chatText.trim()) return;
                    const text = chatText.trim();
                    setChatText('');
                    await sendMessage(activeConversationId, { sender_role: 'merchant', content: text });
                    loadMessages(activeConversationId);
                  }}
                />
            </div>
         </div>
      </Modal>

      {/* 3. User Profile Modal */}
      <Modal
        title={null}
        open={profileVisible}
        onCancel={() => setProfileVisible(false)}
        footer={null}
        width={400}
        centered
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ background: '#0f172a', height: 120, position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)' }}>
                <Avatar size={80} icon={<UserOutlined />} src={userInfo?.avatar} style={{ border: '4px solid #fff', backgroundColor: '#d97706' }} />
            </div>
        </div>
        <div style={{ padding: '50px 24px 24px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{userInfo?.name || 'Alexander'}</h3>
            <p style={{ color: '#64748b', margin: '4px 0 24px' }}>Merchant Owner</p>
            
            <Button icon={<UploadOutlined />} style={{ marginBottom: 32 }}>更换头像</Button>
            
            <List itemLayout="horizontal">
                <List.Item>
                    <List.Item.Meta title="注册时间" description="2024-01-01" />
                </List.Item>
                <List.Item>
                    <List.Item.Meta title="关联酒店" description="海景度假酒店, 山间民宿" />
                </List.Item>
            </List>
        </div>
      </Modal>

    </Layout>
  );
};

export default MerchantLayout;
