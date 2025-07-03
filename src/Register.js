import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "https://ellearnmuskbackend-production.up.railway.app/api";

function Register({ onRegister, onSwitchToLogin }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        onRegister(values.email, values.password);
      } else {
        message.error(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
          Tạo tài khoản mới
        </Title>
        <Text className="text-gray-600">
          Bắt đầu hành trình học tập của bạn
        </Text>
      </div>

      <Form
        name="register"
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
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="Email"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Mật khẩu"
            size="large"
            className="rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Xác nhận mật khẩu"
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
            Đăng ký
          </Button>
        </Form.Item>

        <Divider className="my-6">Hoặc</Divider>

        <Button
          icon={<GoogleOutlined />}
          className="w-full h-12 text-lg font-medium rounded-lg border-2 border-gray-200 hover:border-primary hover:text-primary"
          onClick={() => message.info('Tính năng đang được phát triển')}
        >
          Đăng ký với Google
        </Button>

        <div className="text-center mt-6">
          <Text className="text-gray-600">
            Đã có tài khoản?{' '}
            <Button
              type="link"
              onClick={onSwitchToLogin}
              className="p-0 font-medium hover:text-primary"
            >
              Đăng nhập
            </Button>
          </Text>
        </div>
      </Form>
    </div>
  );
}

export default Register; 