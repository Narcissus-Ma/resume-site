import React from 'react';
import { Anchor, Button } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { ThemeProps } from '../types';

const Header: React.FC<ThemeProps> = ({ darkMode, toggleTheme }) => {
  return (
    <div className={`sticky top-0 z-50 ${darkMode ? 'bg-gray-800/80 text-white' : 'bg-white/80 text-gray-800'} backdrop-blur-md shadow-sm`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Anchor
          direction="horizontal"
          affix={false}
          items={[
            {
              key: 'part-1',
              href: '#part-1',
              title: '主页',
            },
            {
              key: 'part-2',
              href: '#part-2',
              title: '技能',
            },
            {
              key: 'part-3',
              href: '#part-3',
              title: '关于',
            },
            {
              key: 'part-4',
              href: '#part-4',
              title: '项目集',
            },
            {
              key: 'part-5',
              href: '#part-5',
              title: '联系方式',
            },
          ]}
        />
        <Button
          type="text"
          icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className={`rounded-full ${darkMode ? 'text-yellow-300' : 'text-gray-700'}`}
        />
      </div>
    </div>
  );
};

export default Header;