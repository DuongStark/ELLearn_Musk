import React from 'react';
import { Avatar, Button, List, Switch } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LogoutOutlined,
  LockOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const Profile = ({ userEmail, onLogout, wordsCount, wordSets }) => {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow">
        <h1 className="text-xl font-semibold mb-4">Cá nhân</h1>
      </div>

      {/* User Info */}
      <div className="bg-white mt-2 p-6 flex items-center">
        <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
        <div className="ml-4">
          <h2 className="text-lg font-medium">{userEmail}</h2>
          <p className="text-gray-500">Thành viên thường</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white mt-2 p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">{wordsCount}</p>
            <p className="text-sm text-gray-500">Từ vựng</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{wordSets?.length || 0}</p>
            <p className="text-sm text-gray-500">Bộ từ</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">0</p>
            <p className="text-sm text-gray-500">Streak</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white mt-2">
        <List>
          <List.Item
            extra={<Switch defaultChecked />}
            className="px-4"
          >
            <List.Item.Meta
              avatar={<BellOutlined className="text-xl text-gray-400" />}
              title="Thông báo"
              description="Nhắc nhở học tập hàng ngày"
            />
          </List.Item>
          <List.Item className="px-4">
            <List.Item.Meta
              avatar={<LockOutlined className="text-xl text-gray-400" />}
              title="Đổi mật khẩu"
            />
          </List.Item>
          <List.Item className="px-4">
            <List.Item.Meta
              avatar={<SettingOutlined className="text-xl text-gray-400" />}
              title="Cài đặt"
            />
          </List.Item>
          <List.Item className="px-4">
            <List.Item.Meta
              avatar={<InfoCircleOutlined className="text-xl text-gray-400" />}
              title="Giới thiệu"
              description="Phiên bản 1.0.0"
            />
          </List.Item>
        </List>
      </div>

      {/* Logout Button */}
      <div className="mt-auto p-4">
        <Button
          danger
          block
          size="large"
          icon={<LogoutOutlined />}
          onClick={onLogout}
          className="h-12"
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default Profile; 