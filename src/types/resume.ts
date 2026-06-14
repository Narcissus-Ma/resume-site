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

export const RESUME_LANGUAGES = ['zh-CN', 'en-US', 'ja-JP'] as const;

export type ResumeLanguage = (typeof RESUME_LANGUAGES)[number];

export interface ResumeProfile {
  id: string;
  name: string;
  contents: Record<ResumeLanguage, ResumeData>;
}

export interface ResumeCatalog {
  schemaVersion: 1;
  activeResumeId: string;
  resumes: ResumeProfile[];
}

export interface ResumeCatalogMutationResult {
  catalog: ResumeCatalog;
  resumeId: string;
}

export interface ResumeApiErrorPayload {
  error: {
    code: string;
    message: string;
  };
}
