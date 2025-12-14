// 定义类型
export interface Skill {
  category: string;
  items: string[];
}

export interface BasicInfo {
  title: string;
  skills: Skill[];
  skillDescriptions: string[];
}

export interface Experience {
  company: string;
  position: string;
  period: string;
  achievements?: string[];
}

export interface Project {
  name: string;
  period: string;
  description: string;
  responsibilities?: string[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
  achievements?: string[];
}

export interface Website {
  name: string;
  url: string;
}

export interface ResumeData {
  basicInfo: BasicInfo;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  website: Website[];
  correctToken?: string;
}
