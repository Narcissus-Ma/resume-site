import React from 'react';
import { Anchor, Progress, Timeline, Carousel, Button, Avatar, Card, Typography, Row, Col, Space } from 'antd';
import { GithubOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, LinkedinOutlined, CodeOutlined, DatabaseOutlined, RocketOutlined, BackwardOutlined, BookOutlined, GlobalOutlined } from '@ant-design/icons';
import catImage from '@/assets/img/cat.png';
import aboutImage from '@/assets/img/about.png';
import portfolio1 from '@/assets/img/portfolio1.jpg';
import portfolio2 from '@/assets/img/portfolio2.jpg';
import portfolio3 from '@/assets/img/portfolio3.jpg';
import giteeImage from '@/assets/img/gitee.png';
import bilibiliImage from '@/assets/img/bilibili.png';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const Home: React.FC = () => {
  // 技能数据
  const skills = [
    { name: '前端开发', value: 90 },
    { name: 'React/Vue', value: 85 },
    { name: 'TypeScript', value: 80 },
    { name: 'Node.js', value: 75 },
    { name: 'UI/UX设计', value: 70 },
    { name: '后端开发', value: 65 },
  ];

  // 工作经历数据
  const experiences = [
    {
      year: '2022 - 至今',
      title: '高级前端工程师',
      company: '科技创新有限公司',
      description: '负责企业级应用的前端架构设计和开发，优化性能和用户体验。'
    },
    {
      year: '2020 - 2022',
      title: '前端开发工程师',
      company: '互联网科技有限公司',
      description: '参与多个大型项目的前端开发，使用React和TypeScript构建响应式界面。'
    },
    {
      year: '2018 - 2020',
      title: 'Web开发工程师',
      company: '软件开发有限公司',
      description: '负责网站和Web应用的开发和维护，熟悉前后端技术栈。'
    }
  ];

  // 项目数据
  const projects = [
    {
      title: '企业管理系统',
      description: '基于React和TypeScript开发的企业级管理系统，包含权限管理、数据统计等功能。',
      image: portfolio1,
      link: '#'
    },
    {
      title: '电商平台前端',
      description: '高性能电商网站前端实现，包含商品展示、购物车、支付等核心功能。',
      image: portfolio2,
      link: '#'
    },
    {
      title: '数据可视化平台',
      description: '数据可视化大屏展示系统，使用ECharts实现各类数据图表和实时监控。',
      image: portfolio3,
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
      {/* 导航栏 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <Anchor
          direction="horizontal"
          affix={false}
          className="container mx-auto px-4"
          items={[
            {
              key: 'part-1',
              href: '#part-1',
              title: '主页',
            },
            {
              key: 'part-2',
              href: '#part-2',
              title: '关于',
            },
            {
              key: 'part-3',
              href: '#part-3',
              title: '技能',
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
      </div>

      {/* 主页部分 */}
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
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4 animate-fade-in"
          >
            张小明
          </Title>
          
          <Typography className="mb-8">
            <Text className="text-xl md:text-2xl text-gray-600 block mb-4">
              高级前端工程师 | UI/UX 设计师
            </Text>
            <Paragraph className="text-lg text-gray-700 max-w-2xl mx-auto">
              致力于构建美观、高效且用户友好的Web应用，拥有5年前端开发经验，热衷于技术创新和用户体验优化。
            </Paragraph>
          </Typography>
          
          <Space size="middle" className="justify-center">
            <Button 
              type="primary" 
              size="large" 
              icon={<RocketOutlined />} 
              href="/resume-site/resume"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              查看简历
            </Button>
            <Button 
              type="default" 
              size="large" 
              icon={<BookOutlined />} 
              href="#part-2"
              className="border-gray-300 text-gray-700 px-8"
            >
              了解更多
            </Button>
          </Space>
        </div>
      </section>

      {/* 关于部分 */}
      <section id="part-2" className="min-h-screen py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
              关于我
            </Title>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
          </div>
          
          <Row gutter={[32, 32]} className="items-center">
            <Col xs={24} lg={10} className="order-2 lg:order-1">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="p-6">
                  <Title level={4} className="text-xl font-semibold text-gray-800 mb-4">
                    个人简介
                  </Title>
                  <Paragraph className="text-gray-700 mb-6">
                    我是一名充满激情的前端工程师，拥有5年专业经验，擅长使用现代前端技术构建高性能、响应式的Web应用。
                    我注重用户体验，追求代码质量，并乐于不断学习新技术。
                  </Paragraph>
                  
                  <Title level={4} className="text-xl font-semibold text-gray-800 mb-4">
                    工作经验
                  </Title>
                  <Timeline 
                    items={experiences.map(exp => ({
                      color: 'blue',
                      children: (
                        <div>
                          <Text strong className="text-gray-800">{exp.title} - {exp.company}</Text>
                          <Paragraph className="text-gray-600 mt-1 mb-2">{exp.description}</Paragraph>
                          <Text type="secondary">{exp.year}</Text>
                        </div>
                      )
                    }))}
                  />
                  
                  <Title level={4} className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                    教育经历
                  </Title>
                  <Timeline
                    items={[
                      {
                        color: 'green',
                        children: (
                          <div>
                            <Text strong className="text-gray-800">计算机科学与技术硕士</Text>
                            <Paragraph className="text-gray-600 mt-1 mb-2">北京大学 - 2016-2018</Paragraph>
                          </div>
                        )
                      },
                      {
                        color: 'green',
                        children: (
                          <div>
                            <Text strong className="text-gray-800">软件工程学士</Text>
                            <Paragraph className="text-gray-600 mt-1 mb-2">清华大学 - 2012-2016</Paragraph>
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={14} className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full -z-10" />
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full -z-10" />
                <img 
                  src={aboutImage} 
                  alt="About me" 
                  className="w-full h-auto rounded-xl shadow-xl object-cover transform transition-all duration-500 hover:scale-105"
                  style={{ maxHeight: '600px' }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 技能部分 */}
      <section id="part-3" className="min-h-screen py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
              专业技能
            </Title>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
            <Paragraph className="mt-4 text-gray-600 max-w-2xl mx-auto">
              我掌握了多种前端和后端技术，能够独立完成从设计到实现的全流程开发工作。
            </Paragraph>
          </div>
          
          <Row gutter={[24, 24]}>
            {skills.map((skill, index) => (
              <Col xs={24} md={12} key={index}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <Text strong className="text-lg text-gray-800">{skill.name}</Text>
                      <Text type="secondary">{skill.value}%</Text>
                    </div>
                    <Progress 
                      percent={skill.value} 
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }} 
                      strokeWidth={4}
                      trailColor="#e6f4ff"
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
                <Card.Meta
                  avatar={<CodeOutlined className="text-blue-500 text-3xl" />}
                  title="前端开发"
                  description="精通HTML、CSS、JavaScript、React、Vue等前端技术栈，能够构建响应式、高性能的Web应用。"
                />
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Card.Meta
                  avatar={<DatabaseOutlined className="text-green-500 text-3xl" />}
                  title="后端开发"
                  description="熟悉Node.js、Express、MongoDB等后端技术，能够开发RESTful API和全栈应用。"
                />
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Card.Meta
                  avatar={<BackwardOutlined className="text-purple-500 text-3xl" />}
                  title="UI/UX设计"
                  description="具备良好的设计感和用户体验意识，能够创建美观、易用的界面设计。"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 项目集部分 */}
      <section id="part-4" className="min-h-screen py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
              个人作品集
            </Title>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
            <Paragraph className="mt-4 text-gray-600 max-w-2xl mx-auto">
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
                      title={<Title level={4} className="text-2xl font-bold text-gray-800">{project.title}</Title>} 
                      description={
                        <div>
                          <Paragraph className="text-gray-600 mb-4">{project.description}</Paragraph>
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              查看更多项目
            </Button>
          </div>
        </div>
      </section>

      {/* 联系方式部分 */}
      <section id="part-5" className="min-h-screen py-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Title level={2} className="text-4xl font-bold text-gray-800 mb-4">
              联系方式
            </Title>
            <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
          </div>
          
          <Row justify="center">
            <Col xs={24} md={12}>
              <Card className="border-0 shadow-lg">
                <div className="p-8">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                      <div className="flex items-start space-x-4 mb-6">
                        <PhoneOutlined className="text-blue-500 text-2xl mt-1" />
                        <div>
                          <Title level={5} className="text-lg font-semibold text-gray-800">电话</Title>
                          <Text className="text-gray-600">138-1234-5678</Text>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 mb-6">
                        <MailOutlined className="text-blue-500 text-2xl mt-1" />
                        <div>
                          <Title level={5} className="text-lg font-semibold text-gray-800">邮箱</Title>
                          <Text className="text-gray-600">contact@example.com</Text>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <EnvironmentOutlined className="text-blue-500 text-2xl mt-1" />
                        <div>
                          <Title level={5} className="text-lg font-semibold text-gray-800">地址</Title>
                          <Text className="text-gray-600">北京市海淀区中关村科技园</Text>
                        </div>
                      </div>
                    </Col>
                    
                    <Col xs={24} md={12}>
                      <Title level={5} className="text-lg font-semibold text-gray-800 mb-4">社交媒体</Title>
                      <Space size="large" wrap>
                        <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">
                          <GithubOutlined className="text-3xl" />
                        </a>
                        <a href="#" className="text-gray-800 hover:text-gray-600 transition-colors">
                          <img src={giteeImage} alt="Gitee" className="w-10 h-10" />
                        </a>
                        <a href="#" className="text-blue-700 hover:text-blue-900 transition-colors">
                          <LinkedinOutlined className="text-3xl" />
                        </a>
                        <a href="#" className="text-red-600 hover:text-red-800 transition-colors">
                          <img src={bilibiliImage} alt="Bilibili" className="w-10 h-10" />
                        </a>
                      </Space>
                      
                      <div className="mt-8">
                        <Title level={5} className="text-lg font-semibold text-gray-800 mb-4">给我留言</Title>
                        <div className="space-y-4">
                          <Button 
                            type="primary" 
                            block 
                            size="large"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            发送邮件
                          </Button>
                          <Button 
                            type="default" 
                            block 
                            size="large"
                            className="border-gray-300"
                          >
                            预约面谈
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Title level={4} className="text-2xl font-bold mb-4">
              张小明的个人主页
            </Title>
            <Paragraph className="text-gray-400 max-w-2xl mx-auto mb-8">
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
    </div>
  );
};

export default Home;