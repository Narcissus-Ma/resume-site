import { useMemo } from 'react';

import codeNotesCover from '@/assets/img/projects/code-notes.jpg';
import fullStackKnowledgeGraphCover from '@/assets/img/projects/full-stack-knowledge-graph.jpg';
import knowledgeAgentCover from '@/assets/img/projects/knowledge-agent.jpg';
import lotterySystemCover from '@/assets/img/projects/lottery-system.jpg';
import lowCodeFormBuilderCover from '@/assets/img/projects/low-code-form-builder.jpg';
import narcissusHooksCover from '@/assets/img/projects/narcissus-hooks.jpg';
import narcissusNavigationCover from '@/assets/img/projects/narcissus-navigation.jpg';
import personalBlogCover from '@/assets/img/projects/personal-blog.jpg';
import { Experience, Project, Skill } from '@/types';

import useTheme from './use-theme';
import { useHomeData } from './use-translated-data';

const projectImageByFileName: Record<string, string> = {
  'narcissus-navigation': narcissusNavigationCover,
  'code-notes': codeNotesCover,
  'personal-blog': personalBlogCover,
  'knowledge-agent': knowledgeAgentCover,
  'full-stack-knowledge-graph': fullStackKnowledgeGraphCover,
  'low-code-form-builder': lowCodeFormBuilderCover,
  'Lottery-System': lotterySystemCover,
  'narcissus-hooks': narcissusHooksCover,
};

const resolveProjectImage = (project: Project): string =>
  projectImageByFileName[project.image] ?? project.image;

const useHome = () => {
  const { darkMode, toggleTheme } = useTheme();

  const { homeData, loading } = useHomeData();

  const projectsWithImages = homeData.projects.map((project: Project) => ({
    ...project,
    image: resolveProjectImage(project),
  }));

  // 数据状态管理 - 使用多语言数据
  const skills: Skill[] = useMemo(() => homeData.skills, [homeData.skills]);
  const experiences: Experience[] = useMemo(() => homeData.experiences, [homeData.experiences]);
  const projects: Project[] = useMemo(() => projectsWithImages, [projectsWithImages]);

  return {
    darkMode,
    loading,
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
