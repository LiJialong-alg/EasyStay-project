import React, { useRef, useState } from 'react';
import { Form, Input, Button, message, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/userSlice';
import Captcha from '../../components/Captcha';
import AuthLayout from '../../layout/AuthLayout';
import { loginApi } from '../../services/authService';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const captchaRef = useRef();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const isCaptchaValid = captchaRef.current.validate(values.captcha);
    if (!isCaptchaValid) {
      message.error('验证码错误或已过期！');
      return;
    }

    setLoading(true);
    try {
      const res = await loginApi({ username: values.username, password: values.password });
      const token = res.data?.token;
      const user = res.data?.user;
      const role = user?.role || 'merchant';
      dispatch(login({ userInfo: user, token, role }));
      message.success('登录成功！');
      navigate(role === 'admin' ? '/admin/dashboard' : '/merchant/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="欢迎回来"
      subtitle="登录您的账户以管理酒店业务"
      image="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    >
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>账号登录</Title>
        <Text type="secondary">新用户？ <Link to="/register">免费注册</Link></Text>
      </div>

      <Form
        name="login_form"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        layout="vertical"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入账号！' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="账号/手机号/邮箱" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码！' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: 24 }}>
           <Form.Item
              name="captcha"
              style={{ flex: 1, marginBottom: 0 }}
              rules={[{ required: true, message: '请输入验证码！' }]}
            >
              <Input prefix={<SafetyCertificateOutlined />} placeholder="验证码" />
            </Form.Item>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: '0 4px', display: 'flex', alignItems: 'center' }}>
               <Captcha ref={captchaRef} />
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
            </Form.Item>
            <Link to="/forgot-password">忘记密码？</Link>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            立即登录
          </Button>
        </Form.Item>
      </Form>
    </AuthLayout>
  );
};

export default Login;
