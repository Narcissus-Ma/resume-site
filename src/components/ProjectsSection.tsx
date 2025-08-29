import React from 'react';
import { Button, Typography, Carousel } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { ThemeProps } from '../types';

const { Title, Paragraph } = Typography;

interface ProjectsSectionProps extends ThemeProps {
  projects?: any[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ darkMode }) => {
  // 使用模拟数据来展示
  const projects = [
    {
      id: 1,
      title: '网站1',
      description: '网站采用响应式布局，适配于多种设备，具有UI组件和动画交互。',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: '网站2',
      description: '基于React开发的现代化Web应用，包含完整的用户系统和数据管理功能。',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: '网站3',
      description: '企业级数据可视化平台，支持实时数据分析和报表生成。',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80'
    }
  ];

  return (
    <section id="part-4" className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title level={2} className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            项目集
          </Title>
          <Paragraph className={`text-gray-500 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            近期项目
          </Paragraph>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Carousel 
            autoplay 
            autoplaySpeed={5000}
            dots 
            arrows 
            className="relative"
          >
            {projects.map(project => (
              <div key={project.id} className="flex items-center justify-center py-8 px-[50px]">
                <div className="flex items-center">
                  {/* 项目图片 */}
                  <div className="w-64 h-64">
                    <img 
                      alt={project.title} 
                      src={project.image} 
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                  </div>
                  
                  {/* 项目信息 */}
                  <div className="ml-8">
                    <Title level={4} className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {project.title}
                    </Title>
                    <Paragraph className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {project.description}
                    </Paragraph>
                    <Button 
                      type="primary" 
                      icon={<RightOutlined />}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Demo →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;