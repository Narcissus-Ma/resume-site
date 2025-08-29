import React from 'react';
import { Space, Typography } from 'antd';
import { GithubOutlined, LinkedinOutlined, MailOutlined } from '@ant-design/icons';
import giteeImage from '@/assets/img/gitee.png';
import { ThemeProps } from '../types';

const { Title, Paragraph } = Typography;

const Footer: React.FC<ThemeProps> = ({ darkMode }) => {
  return (
    <footer className={`py-12 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-900 text-white'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center">
          <Title level={4} className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-white'}`}>
            张小明的个人主页
          </Title>
          <Paragraph className={`max-w-2xl mx-auto mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-400'}`}>
            感谢您访问我的个人主页，我期待与您合作，共同创造出色的Web应用！
          </Paragraph>
          <Space size="large" className="justify-center">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <GithubOutlined className="text-xl" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <img src={giteeImage} alt="Gitee" className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <LinkedinOutlined className="text-xl" />
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <MailOutlined className="text-xl" />
            </a>
          </Space>
          <div className="mt-8 text-gray-500 text-sm">
            © {new Date().getFullYear()} 张小明. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;