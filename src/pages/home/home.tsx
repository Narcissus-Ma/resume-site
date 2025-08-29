import React, { useState, useEffect } from 'react';
import { Skill, Experience, Project } from '../../types';
import Header from '../../components/Header';
import HomeSection from '../../components/HomeSection';
import AboutSection from '../../components/AboutSection';
import SkillsSection from '../../components/SkillsSection';
import ProjectsSection from '../../components/ProjectsSection';
import ContactSection from '../../components/ContactSection';
import Footer from '../../components/Footer';
import portfolio1 from '@/assets/img/portfolio1.jpg';
import portfolio2 from '@/assets/img/portfolio2.jpg';
import portfolio3 from '@/assets/img/portfolio3.jpg';

const Home: React.FC = () => {
  // 主题状态管理
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // 检查用户偏好的主题
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // 切换主题
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // 技能数据
  const skills: Skill[] = [
    { name: '前端开发', value: 90 },
    { name: 'React/Vue', value: 85 },
    { name: 'TypeScript', value: 80 },
    { name: 'Node.js', value: 75 },
    { name: 'UI/UX设计', value: 70 },
    { name: '后端开发', value: 65 },
  ];

  // 工作经历数据
  const experiences: Experience[] = [
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
  const projects: Project[] = [
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
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gradient-to-b from-gray-50 to-gray-100'} font-sans`}>
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      <HomeSection darkMode={darkMode} />
      <AboutSection darkMode={darkMode} experiences={experiences} />
      <SkillsSection darkMode={darkMode} skills={skills} />
      <ProjectsSection darkMode={darkMode} projects={projects} />
      <ContactSection darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Home;