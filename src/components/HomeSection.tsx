import React from 'react';
import { Avatar, Button, Space, Typography } from 'antd';
import { BookOutlined, RocketOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import catImage from '@/assets/img/cat.png';
import { ThemeProps } from '../types';

const { Title, Paragraph, Text } = Typography;

const HomeSection: React.FC<ThemeProps> = ({ darkMode }) => {
  return (
    <section id="part-1" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 -z-10" />
      <div className="absolute right-20 top-20 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl" />
      <div className="absolute left-20 bottom-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <Avatar 
            size={{ xs: 80, sm: 100, md: 120, lg: 140, xl: 160, xxl: 200 }}
            icon={<img src={catImage} alt="Logo" />} 
            className="border-4 border-white shadow-lg mx-auto"
          />
        </div>
        
        <Title 
          level={1} 
          className={`text-5xl md:text-6xl font-bold mb-4 animate-fade-in ${darkMode ? 'text-white' : 'text-gray-800'}`}
        >
          张小明
        </Title>
        
        <Typography className="mb-8">
          <Text className={`text-xl md:text-2xl block mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            高级前端工程师 | UI/UX 设计师
          </Text>
          <Paragraph className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            致力于构建美观、高效且用户友好的Web应用，拥有5年前端开发经验，热衷于技术创新和用户体验优化。
          </Paragraph>
        </Typography>
        
        <Space size="middle" className="justify-center">
          <Button 
            type="primary" 
            size="large" 
            icon={<RocketOutlined />} 
            className={`px-8 ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <Link to="/resume" className="text-white">查看简历</Link>
          </Button>
          <Button 
            type="default" 
            size="large" 
            icon={<BookOutlined />} 
            href="#part-2"
            className={`px-8 ${darkMode ? 'border-gray-600 bg-gray-800 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-700'}`}
          >
            了解更多
          </Button>
        </Space>
      </div>
    </section>
  );
};

export default HomeSection;