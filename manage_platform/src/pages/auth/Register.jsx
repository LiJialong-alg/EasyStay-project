import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Radio, message, Divider, Typography } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/AuthLayout';
import { registerApi } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { login, logout } from '../../store/userSlice';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [role, setRole] = useState('merchant');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (role === 'admin') {
        message.warning('管理员账号由平台创建，请使用管理员账号登录。');
        navigate('/login');
        return;
      }
      const res = await registerApi({ username: values.username, password: values.password, name: values.username });
      const token = res?.data?.token;
      const user = res?.data?.user;
      if (token && user) {
        dispatch(login({ token, userInfo: user, role: user.role }));
        message.success('注册成功，已为你自动登录');
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/merchant/dashboard');
        return;
      }
      message.success('注册成功！请登录。');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="加入我们，开启智能酒店管理" 
      subtitle="为商户提供全方位的酒店运营解决方案，提升效率，增加收益。"
      image="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    >
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>创建账户</Title>
        <Text type="secondary">已经有账号了？ <Link to="/login">立即登录</Link></Text>
      </div>

      <div style={{ marginBottom: 24 }}>
          <Radio.Group value={role} onChange={e => setRole(e.target.value)} buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
              <Radio.Button value="merchant" style={{ flex: 1, textAlign: 'center' }}>商户入驻</Radio.Button>
              <Radio.Button value="admin" style={{ flex: 1, textAlign: 'center' }}>管理员申请</Radio.Button>
          </Radio.Group>
      </div>

      <Form
        name="register"
        onFinish={onFinish}
        scrollToFirstError
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名！' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码！' }]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="密码" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请确认密码！' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致！'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            注册账户
          </Button>
        </Form.Item>
      </Form>
      
      <Divider plain>第三方注册</Divider>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Button shape="circle" icon={<GoogleOutlined />} />
          <Button shape="circle" icon={<GithubOutlined />} />
      </div>
    </AuthLayout>
  );
};

export default Register;
