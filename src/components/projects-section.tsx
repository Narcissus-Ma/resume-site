import React from 'react';

import { Typography } from 'antd';

import { useTranslation } from 'react-i18next';

import { ThemeProps, Project } from '../types';
import { getProjectCardHref } from './project-card-link';
import styles from './projects-section.module.css';

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

        <div className="mx-auto max-w-6xl">
          <div className={styles.grid}>
            {projects.map((project) => {
              const href = getProjectCardHref(project.link);
              const card = (
                <article className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.imageWrapper}>
                      <img alt={project.title} className={styles.image} src={project.image} />
                    </div>
                    <Title className={`${styles.title} theme-text-primary`} level={4}>
                      {project.title}
                    </Title>
                  </div>
                  <Paragraph className={`${styles.description} theme-text-secondary`}>
                    {project.description}
                  </Paragraph>
                </article>
              );

              if (!href) {
                return (
                  <div key={`${project.title}-${project.image}`} className={styles.staticCard}>
                    {card}
                  </div>
                );
              }

              return (
                <a
                  key={`${project.title}-${href}`}
                  className={styles.cardLink}
                  href={href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {card}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
