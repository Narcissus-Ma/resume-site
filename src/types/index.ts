// 技能类型
export interface Skill {
  name: string;
  value: number;
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