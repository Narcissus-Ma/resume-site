import React from 'react';
import { Button, Card, Carousel, Typography } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { ThemeProps, Project } from '../types';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

interface ProjectsSectionProps extends ThemeProps {
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ darkMode, projects }) => {
  return (
    <section id="part-4" className={`min-h-screen py-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Title level={2} className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            个人作品集
          </Title>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
          <Paragraph className={`mt-4 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            这里展示了我近期完成的一些代表性项目，涵盖了企业应用、电商平台和数据可视化等多个领域。
          </Paragraph>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Carousel
            autoplay
            dots={true}
            dotPosition="bottom"
            className="h-[600px]"
          >
            {projects.map((project, index) => (
              <div key={index} className="h-full">
                <Card 
                  hoverable 
                  className="h-full border-0 shadow-xl overflow-hidden"
                  cover={
                    <div className="h-[400px] overflow-hidden">
                      <img 
                        alt={project.title} 
                        src={project.image} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    </div>
                  }
                >
                  <Meta 
                      title={<Title level={4} className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{project.title}</Title>} 
                      description={
                        <div>
                          <Paragraph className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{project.description}</Paragraph>
                          <Button 
                             type="primary" 
                             icon={<GlobalOutlined />}
                             href={project.link}
                             className="bg-blue-600 hover:bg-blue-700"
                           >
                             查看详情
                           </Button>
                        </div>
                      }
                    />
                </Card>
              </div>
            ))}
          </Carousel>
        </div>
        
        <div className="text-center mt-12">
          <Button 
            type="primary" 
            size="large" 
            className={`px-8 ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            查看更多项目
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;