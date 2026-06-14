import { useMemo } from 'react';

import portfolio1 from '@/assets/img/portfolio1.jpg';
import portfolio2 from '@/assets/img/portfolio2.jpg';
import portfolio3 from '@/assets/img/portfolio3.jpg';
import { Experience, Project, Skill } from '@/types';

import useTheme from './use-theme';
import { useHomeData } from './use-translated-data';

const useHome = () => {
  const { darkMode, toggleTheme } = useTheme();

  const homeData = useHomeData();

  const projectsWithImages = homeData.projects.map((project: Project) => {
    let imageSrc;
    switch (project.image) {
      case 'portfolio1.jpg':
        imageSrc = portfolio1;
        break;
      case 'portfolio2.jpg':
        imageSrc = portfolio2;
        break;
      case 'portfolio3.jpg':
        imageSrc = portfolio3;
        break;
      default:
        imageSrc = project.image;
    }
    return { ...project, image: imageSrc };
  });

  // 数据状态管理 - 使用多语言数据
  const skills: Skill[] = useMemo(() => homeData.skills, [homeData.skills]);
  const experiences: Experience[] = useMemo(() => homeData.experiences, [homeData.experiences]);
  const projects: Project[] = useMemo(() => projectsWithImages, [projectsWithImages]);

  return {
    darkMode,
    toggleTheme,
    occupation: homeData.occupation,
    description: homeData.description,
    skillSectionDescription: homeData.skillSectionDescription,
    skillHighlights: homeData.skillHighlights,
    skills,
    experiences,
    projects,
  };
};

export default useHome;
