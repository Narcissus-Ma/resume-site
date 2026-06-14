// 技能类型
export interface Skill {
  name: string;
  value: number;
}

export type SkillHighlightIcon = 'code' | 'database' | 'design' | 'agent' | 'tool';

export interface SkillHighlight {
  id: string;
  icon: SkillHighlightIcon;
  title: string;
  description: string;
}

// 工作经历类型
export interface Experience {
  year: string;
  title: string;
  company: string;
  description: string;
}

// 项目类型
export interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
}

// 主题属性类型
export interface ThemeProps {
  darkMode: boolean;
  toggleTheme?: () => void;
}

// 主页数据类型
export interface HomeData {
  occupation: string;
  description: string;
  skillSectionDescription: string;
  skillHighlights: SkillHighlight[];
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
}

export type HomeLanguage = 'zh-CN' | 'en-US' | 'ja-JP';

export const HOME_LANGUAGES: HomeLanguage[] = ['zh-CN', 'en-US', 'ja-JP'];

export interface HomeProfile {
  id: string;
  name: string;
  contents: Record<HomeLanguage, HomeData>;
}

export interface HomeCatalog {
  schemaVersion: 1;
  activeHomeId: string;
  homes: HomeProfile[];
}

export interface HomeCatalogMutationResult {
  catalog: HomeCatalog;
  homeId: string;
}
