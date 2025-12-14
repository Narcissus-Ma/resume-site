import React, { useState, useEffect } from "react";

import portfolio1 from "@/assets/img/portfolio1.jpg";
import portfolio2 from "@/assets/img/portfolio2.jpg";
import portfolio3 from "@/assets/img/portfolio3.jpg";
import useTheme from "@/hooks/use-theme";

import AboutSection from "../../components/AboutSection";
import ContactSection from "../../components/ContactSection";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import HomeSection from "../../components/HomeSection";
import ProjectsSection from "../../components/ProjectsSection";
import SkillsSection from "../../components/SkillsSection";
import { Skill, Experience, Project } from "../../types";

// 导入项目图片

const Home: React.FC = () => {
  // 主题状态管理
  const { darkMode, setDarkMode } = useTheme();

  // 切换主题
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // 数据状态管理
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // 直接读取本地JSON文件
  useEffect(() => {
    import("../../data/homeData.json")
      .then((importedData) => {
        setSkills(importedData.default.skills);
        setExperiences(importedData.default.experiences);

        // 为项目分配实际的图片资源
        const projectsWithImages = importedData.default.projects.map(
          (project: Project) => {
            let imageSrc;
            switch (project.image) {
              case "portfolio1.jpg":
                imageSrc = portfolio1;
                break;
              case "portfolio2.jpg":
                imageSrc = portfolio2;
                break;
              case "portfolio3.jpg":
                imageSrc = portfolio3;
                break;
              default:
                imageSrc = project.image;
            }
            return { ...project, image: imageSrc };
          }
        );

        setProjects(projectsWithImages);
      })
      .catch((error) => {
        console.error("获取数据失败:", error);
      });
  }, []);

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
