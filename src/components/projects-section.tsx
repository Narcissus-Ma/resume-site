import React from 'react';

import { Button, Typography, Carousel } from 'antd';

import { RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { ThemeProps, Project } from '../types';

const { Title, Paragraph } = Typography;

interface ProjectsSectionProps extends ThemeProps {
  projects?: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects: propProjects }) => {
  const { t } = useTranslation();
  // 使用传入的projects参数，如果没有则使用默认模拟数据
  const projects = propProjects || [
    {
      title: '网站1',
      description: '网站采用响应式布局，适配于多种设备，具有UI组件和动画交互。',
      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80',
      link: '#',
    },
    {
      title: '网站2',
      description: '基于React开发的现代化Web应用，包含完整的用户系统和数据管理功能。',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80',
      link: '#',
    },
    {
      title: '网站3',
      description: '企业级数据可视化平台，支持实时数据分析和报表生成。',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
      link: '#',
    },
  ];

  return (
    <section className="theme-page py-20" id="part-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title className="theme-text-primary mb-2 text-3xl font-bold" level={2}>
            {t('projects.title')}
          </Title>
          <Paragraph className="theme-text-secondary">{t('projects.recent')}</Paragraph>
        </div>

        <div className="max-w-4xl mx-auto">
          <Carousel arrows autoplay dots autoplaySpeed={5000} className="relative">
            {projects.map((project) => (
              <div
                key={project.title}
                className="flex items-center justify-center px-4 py-8 sm:px-12"
              >
                <div className="flex min-w-0 flex-col items-center gap-6 md:flex-row md:gap-8">
                  {/* 项目图片 */}
                  <div className="h-56 w-full max-w-64 shrink-0 sm:h-64 sm:w-64">
                    <img
                      alt={project.title}
                      className="h-full w-full rounded-lg border border-[var(--color-border)] object-cover shadow-lg"
                      src={project.image}
                    />
                  </div>

                  {/* 项目信息 */}
                  <div className="min-w-0 text-center md:text-left">
                    <Title className="theme-text-primary mb-4 text-2xl font-bold" level={4}>
                      {project.title}
                    </Title>
                    <Paragraph className="theme-text-secondary mb-6">
                      {project.description}
                    </Paragraph>
                    <Button
                      className="bg-purple-600 hover:bg-purple-700"
                      icon={<RightOutlined />}
                      type="primary"
                    >
                      {t('projects.demo')}
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
