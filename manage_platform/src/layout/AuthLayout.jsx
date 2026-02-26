import React from 'react';
import { Layout, Typography } from 'antd';
import './AuthLayout.css';

const { Title, Text } = Typography;

const AuthLayout = ({ children, title, subtitle, image }) => {
  return (
    <div className="auth-layout">
      {/* Unified Background Layer */}
      <div className="auth-bg-container">
        <img src={image || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"} alt="Background" className="auth-bg-image" />
        <div className="auth-bg-overlay"></div>
      </div>

      {/* Content Layer */}
      <div className="auth-content-wrapper">
          <div className="auth-left">
            <div className="auth-branding">
              <div className="auth-logo">
                <div className="logo-icon"></div>
                <h1>易宿后台管理系统</h1>
              </div>
              <div className="auth-welcome">
                <Title level={1} style={{ color: 'white', marginBottom: 16 }}>{title}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>{subtitle}</Text>
              </div>
              <div className="auth-footer-text">
                © 2024 易宿后台管理系统. All Rights Reserved.
              </div>
            </div>
          </div>
          <div className="auth-right">
            <div className="auth-form-container">
              {children}
            </div>
          </div>
      </div>
    </div>
  );
};

export default AuthLayout;
