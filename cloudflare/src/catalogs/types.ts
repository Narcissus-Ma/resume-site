export const CATALOG_LANGUAGES = ['zh-CN', 'en-US', 'ja-JP'] as const;

export type CatalogLanguage = (typeof CATALOG_LANGUAGES)[number];

export interface HomeSkill {
  name: string;
  value: number;
}

export type HomeSkillHighlightIcon = 'code' | 'database' | 'design' | 'agent' | 'tool';

export interface HomeSkillHighlight {
  id: string;
  icon: HomeSkillHighlightIcon;
  title: string;
  description: string;
}

export interface HomeExperience {
  year: string;
  title: string;
  company: string;
  description: string;
}

export interface HomeProject {
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface HomeData {
  occupation: string;
  description: string;
  skillSectionDescription: string;
  skillHighlights: HomeSkillHighlight[];
  skills: HomeSkill[];
  experiences: HomeExperience[];
  projects: HomeProject[];
}

export interface HomeProfile {
  id: string;
  name: string;
  contents: Record<CatalogLanguage, HomeData>;
}

export interface HomeCatalog {
  schemaVersion: 1;
  activeHomeId: string;
  homes: HomeProfile[];
}

export interface ResumeSkill {
  category: string;
  items: string[];
}

export interface ResumeBasicInfo {
  title: string;
  skills: ResumeSkill[];
  skillDescriptions: string[];
}

export interface ResumeExperience {
  company: string;
  position: string;
  period: string;
  achievements?: string[];
}

export interface ResumeProject {
  name: string;
  period: string;
  description: string;
  responsibilities?: string[];
}

export interface ResumeEducation {
  school: string;
  degree: string;
  period: string;
  achievements?: string[];
}

export interface ResumeWebsite {
  name: string;
  url: string;
}

export interface ResumeData {
  basicInfo: ResumeBasicInfo;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  website: ResumeWebsite[];
  correctToken?: string;
}

export interface ResumeProfile {
  id: string;
  name: string;
  contents: Record<CatalogLanguage, ResumeData>;
}

export interface ResumeCatalog {
  schemaVersion: 1;
  activeResumeId: string;
  resumes: ResumeProfile[];
}

export interface CatalogEnvelope<TCatalog> {
  revision: number;
  updatedAt: string;
  catalog: TCatalog;
}

export interface CatalogResponse<TCatalog> {
  revision: number;
  catalog: TCatalog;
}

export interface HomeCatalogMutationResult {
  catalog: HomeCatalog;
  homeId: string;
}

export interface ResumeCatalogMutationResult {
  catalog: ResumeCatalog;
  resumeId: string;
}
