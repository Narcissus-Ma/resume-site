import React from 'react';
import { Button, Typography } from 'antd';
import { ArrowRightOutlined, GithubOutlined, LinkedinOutlined, MailOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import catImage from '@/assets/img/cat.png';
import { ThemeProps } from '../types';

const { Title, Paragraph } = Typography;

const HomeSection: React.FC<ThemeProps> = ({ darkMode }) => {
  return (
    <section id="part-1" className="min-h-[60vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 -z-10" />
      <div className="absolute right-0 top-0 w-full h-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 -z-10" />
      
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="flex items-center justify-center gap-16">
          <div className="text-left">
            <div className="mb-6 relative">
              {/* 左侧社交媒体图标 */}
              <div className="absolute -left-24 top-1/3 hidden lg:flex flex-col items-center space-y-6 z-10">
                <a href="#" className={`hover:text-purple-500 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <GithubOutlined size={32} />
                </a>
                <a href="#" className={`hover:text-purple-500 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <LinkedinOutlined size={32} />
                </a>
                <a href="#" className={`hover:text-purple-500 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MailOutlined size={32} />
                </a>
              </div>
              
              <Paragraph className={`text-5xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>Hi, I'm</Paragraph>
              <Title 
                level={1} 
                className={`text-5xl md:text-6xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}
              >
                Narcissus
              </Title>
              <Paragraph className={`text-2xl mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                前端工程师
              </Paragraph>
              <Paragraph className={`text-lg max-w-xl ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                热爱学习，热爱生活，创造更高质量工作成果。
              </Paragraph>
            </div>
            
            <Button 
              type="primary" 
              size="large" 
              className={`px-8 ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              <Link to="/resume" className="text-white flex items-center">查看简历 <ArrowRightOutlined className="ml-2" /></Link>
            </Button>
          </div>
          
          <div className="hidden md:block">
            <div className="w-56 h-56 rounded-full bg-blue-500 flex items-center justify-center p-4">
              <img 
                src={catImage} 
                alt="Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
        </div>
        
        {/* 往下滑提示 */}
        <div className="mt-8 flex flex-col items-center animate-bounce">
          <Paragraph className={`mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>往下滑</Paragraph>
          <MenuFoldOutlined className={`rotate-90 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </div>
      </div>
    </section>
  );
};

export default HomeSection;