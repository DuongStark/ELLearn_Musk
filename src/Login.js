import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Login({ onLogin, onSwitchToRegister }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        message.success('Đăng nhập thành công!');
        onLogin(values.email);
      } else {
        message.error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Title level={2} className="text-primary mb-2">
          Chào mừng trở lại!
        </Title>
        <Text className="text-gray-600">
          Đăng nhập để tiếp tục học tập
        </Text>
      </div>

      <Form
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        className="space-y-4"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Email"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Mật khẩu"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-12 text-lg font-medium rounded-lg"
            loading={loading}
          >
            Đăng nhập
          </Button>
        </Form.Item>

        <Divider className="my-6">Hoặc</Divider>

        <Button
          icon={<GoogleOutlined />}
          className="w-full h-12 text-lg font-medium rounded-lg border-2 border-gray-200 hover:border-primary hover:text-primary"
          onClick={() => message.info('Tính năng đang được phát triển')}
        >
          Đăng nhập với Google
        </Button>

        <div className="text-center mt-6">
          <Text className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Button
              type="link"
              onClick={onSwitchToRegister}
              className="p-0 font-medium hover:text-primary"
            >
              Đăng ký ngay
            </Button>
          </Text>
        </div>
      </Form>
    </div>
  );
}

export default Login; 