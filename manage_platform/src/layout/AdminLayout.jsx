import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Breadcrumb } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  BankOutlined, 
  PayCircleOutlined, 
  SoundOutlined, 
  LogoutOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/userSlice';
import './MerchantLayout.css'; // Reuse styles

const { Header, Content, Sider, Footer } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = [
      {
        title: <Link to="/admin/dashboard">平台管理</Link>,
        key: 'home',
      },
    ];
    
    const pathMap = {
      'dashboard': '控制台',
      'merchant': '商家管理',
      'list': '商家列表',
      'hotel': '酒店监管',
      'listing-audit': '上线审核',
      'registration-audit': '注册审核',
      'finance': '财务结算',
      'withdrawals': '提现审批',
      'report': '资金报表',
      'system': '系统运营',
      'announcement': '公告发布',
      'banner': 'Banner配置',
      'admin': '管理端'
    };

    pathSnippets.forEach((snippet, index) => {
        if (snippet === 'admin') return;
        const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
        breadcrumbItems.push({
            title: pathMap[snippet] || snippet,
            key: url,
        });
    });

    return breadcrumbItems;
  };

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '控制台' },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统运营',
      children: [
        { key: '/admin/system/announcement', icon: <SoundOutlined />, label: '公告发布' },
        { key: '/admin/system/banner', label: 'Banner配置' },
      ]
    },
    {
      key: 'merchant',
      icon: <UserOutlined />,
      label: '商家管理',
      children: [
        { key: '/admin/merchant/list', label: '商家列表' },
      ]
    },
    {
      key: 'hotel',
      icon: <BankOutlined />,
      label: '酒店监管',
      children: [
        { key: '/admin/hotel/list', label: '酒店列表' },
        { key: '/admin/hotel/registration-audit', label: '注册审核' },
        { key: '/admin/hotel/listing-audit', label: '上线审核' },
        { key: '/admin/hotel/orders', label: '订单查看' }, // Added
      ]
    },
    {
      key: 'finance',
      icon: <PayCircleOutlined />,
      label: '财务结算',
      children: [
        { key: '/admin/finance/withdrawals', label: '提现审批' },
        { key: '/admin/finance/report', label: '资金报表' },
      ]
    },
  ];

  const userMenu = {
    items: [
        { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: handleLogout }
    ]
  };

  return (
    <Layout style={{ minHeight: '100vh' }} className="theme-admin">
      <Sider 
        width={240}
        trigger={null}
        collapsible 
        collapsed={collapsed}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
        }}
        className="custom-scrollbar"
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)', 
            borderRadius: 8, 
            marginRight: collapsed ? 0 : 12,
            boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)'
          }}></div>
          {!collapsed && <span style={{ fontSize: 18, fontWeight: '700', color: '#fff', fontFamily: 'Playfair Display' }}>易宿</span>}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['merchant', 'hotel', 'finance', 'system']}
          style={{ marginTop: 16, borderRight: 0 }}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s' }}>
        <Header className="merchant-header" style={{ 
          padding: '0 24px', 
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
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 18, marginRight: 24, cursor: 'pointer' }
            })}
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <Dropdown menu={userMenu} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Avatar style={{ backgroundColor: '#722ed1', marginRight: 8 }} icon={<UserOutlined />} />
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{userInfo?.name || 'Administrator'}</span>
                </div>
             </Dropdown>
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 24px',
            minHeight: 280,
            overflow: 'initial'
          }}
        >
          <Outlet />
        </Content>

        <Footer style={{ textAlign: 'center', color: '#94a3b8', background: 'transparent' }}>
          易宿 ©2024
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
