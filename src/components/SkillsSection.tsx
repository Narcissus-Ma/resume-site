import React from 'react';
import { Card, Col, Progress, Row, Typography } from 'antd';
import { BackwardOutlined, CodeOutlined, DatabaseOutlined } from '@ant-design/icons';
import { ThemeProps, Skill } from '../types';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

interface SkillsSectionProps extends ThemeProps {
  skills: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ darkMode, skills }) => {
  return (
    <section id="part-2" className={`min-h-screen py-20 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Title level={2} className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            专业技能
          </Title>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
          <Paragraph className={`mt-4 max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            我掌握了多种前端和后端技术，能够独立完成从设计到实现的全流程开发工作。
          </Paragraph>
        </div>
        
        <Row gutter={[24, 24]}>
          {skills.map((skill, index) => (
            <Col xs={24} md={12} key={index}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>{skill.name}</Text>
                    <Text type="secondary">{skill.value}%</Text>
                  </div>
                  <Progress 
                  percent={skill.value} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }} 
                  strokeWidth={4}
                  trailColor={darkMode ? '#1f2937' : '#e6f4ff'}
                  className="h-2 rounded-full"
                />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        
        <Row gutter={[24, 24]} className="mt-12">
          <Col xs={24} md={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Meta
                avatar={<CodeOutlined className="text-blue-500 text-3xl" />}
                title="前端开发"
                description={
                  <Text className={darkMode ? 'text-gray-300' : ''}>
                    精通HTML、CSS、JavaScript、React、Vue等前端技术栈，能够构建响应式、高性能的Web应用。
                  </Text>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Meta
                avatar={<DatabaseOutlined className="text-green-500 text-3xl" />}
                title="后端开发"
                description={
                  <Text className={darkMode ? 'text-gray-300' : ''}>
                    熟悉Node.js、Express、MongoDB等后端技术，能够开发RESTful API和全栈应用。
                  </Text>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} md={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Meta
                avatar={<BackwardOutlined className="text-purple-500 text-3xl" />}
                title="UI/UX设计"
                description={
                  <Text className={darkMode ? 'text-gray-300' : ''}>
                    具备良好的设计感和用户体验意识，能够创建美观、易用的界面设计。
                  </Text>
                }
              />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default SkillsSection;