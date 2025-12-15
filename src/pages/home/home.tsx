import React from "react";

import useHome from "@/hooks/use-home";

import AboutSection from "../../components/about-section";
import ContactSection from "../../components/contact-section";
import Footer from "../../components/footer";
import Header from "../../components/header";
import HomeSection from "../../components/home-section";
import ProjectsSection from "../../components/projects-section";
import SkillsSection from "../../components/skills-section";

// 导入项目图片

const Home: React.FC = () => {
  const { darkMode, toggleTheme, skills, experiences, projects } = useHome();

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "dark bg-gray-900 text-white"
          : "bg-gradient-to-b from-gray-50 to-gray-100"
      } font-sans`}
    >
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      <HomeSection darkMode={darkMode} />
      <SkillsSection darkMode={darkMode} skills={skills} />
      <AboutSection darkMode={darkMode} experiences={experiences} />
      <ProjectsSection darkMode={darkMode} projects={projects} />
      <ContactSection darkMode={darkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Home;
