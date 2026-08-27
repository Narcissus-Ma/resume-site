import React from 'react';

import { Spin } from 'antd';

import { useTranslation } from 'react-i18next';

import useHome from '@/hooks/use-home';

import AboutSection from '../../components/about-section';
import Footer from '../../components/footer';
import Header from '../../components/header';
import HomeSection from '../../components/home-section';
import ProjectsSection from '../../components/projects-section';
import SkillsSection from '../../components/skills-section';

// 导入项目图片

const Home: React.FC = () => {
  const { t } = useTranslation();
  const {
    darkMode,
    loading,
    toggleTheme,
    occupation,
    description,
    skillSectionDescription,
    skillHighlights,
    skills,
    experiences,
    projects,
  } = useHome();

  return (
    <div className="theme-page min-h-screen font-sans">
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      {loading ? (
        <main
          aria-live="polite"
          className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4"
          role="status"
        >
          <Spin size="large" />
          <p className="theme-text-secondary m-0">{t('home.loading')}</p>
        </main>
      ) : (
        <>
          <HomeSection darkMode={darkMode} description={description} occupation={occupation} />
          <SkillsSection
            darkMode={darkMode}
            highlights={skillHighlights}
            sectionDescription={skillSectionDescription}
            skills={skills}
          />
          <AboutSection darkMode={darkMode} experiences={experiences} />
          <ProjectsSection darkMode={darkMode} projects={projects} />
          <Footer darkMode={darkMode} />
        </>
      )}
    </div>
  );
};

export default Home;
