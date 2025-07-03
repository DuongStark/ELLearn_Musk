import React from 'react';
import { Badge } from 'antd';
import {
  BookOutlined,
  ReadOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';

const MobileLayout = ({ children, currentTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Status Bar Area - for iOS */}
      <div className="h-[env(safe-area-inset-top)] bg-white" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+4rem)]">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16 px-2 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={() => onTabChange('flashcard')}
            className={`flex flex-col items-center justify-center w-1/4 py-1 ${
              currentTab === 'flashcard' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <BookOutlined style={{ fontSize: '24px' }} />
            <span className="text-xs mt-1">Thẻ ghi nhớ</span>
          </button>

          <button
            onClick={() => onTabChange('quiz')}
            className={`flex flex-col items-center justify-center w-1/4 py-1 ${
              currentTab === 'quiz' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <ReadOutlined style={{ fontSize: '24px' }} />
            <span className="text-xs mt-1">Kiểm tra</span>
          </button>

          <button
            onClick={() => onTabChange('list')}
            className={`flex flex-col items-center justify-center w-1/4 py-1 ${
              currentTab === 'list' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <Badge count={0} size="small">
              <UnorderedListOutlined style={{ fontSize: '24px' }} />
            </Badge>
            <span className="text-xs mt-1">Từ vựng</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`flex flex-col items-center justify-center w-1/4 py-1 ${
              currentTab === 'profile' ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            <UserOutlined style={{ fontSize: '24px' }} />
            <span className="text-xs mt-1">Cá nhân</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout; 