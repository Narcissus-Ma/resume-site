import React from 'react';

import useHome from '@/hooks/use-home';

import AboutSection from '../../components/about-section';
import ContactSection from '../../components/contact-section';
import Footer from '../../components/footer';
import Header from '../../components/header';
import HomeSection from '../../components/home-section';
import ProjectsSection from '../../components/projects-section';
import SkillsSection from '../../components/skills-section';

// 导入项目图片

const Home: React.FC = () => {
  const {
    darkMode,
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
      <HomeSection darkMode={darkMode} description={description} occupation={occupation} />
      <SkillsSection
        darkMode={darkMode}
        highlights={skillHighlights}
        sectionDescription={skillSectionDescription}
        skills={skills}
      />
      <AboutSection darkMode={darkMode} experiences={experiences} />
      <ProjectsSection darkMode={darkMode} projects={projects} />
      <ContactSection darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Home;
