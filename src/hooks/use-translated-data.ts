import { useTranslation } from 'react-i18next';

import { getActiveHomeContent } from '@/domain/home/rules/home-catalog';
import { getActiveResumeContent } from '@/domain/resume/rules/resume-catalog';
import type { HomeCatalog, HomeLanguage } from '@/types';
import type { ResumeCatalog, ResumeLanguage } from '@/types/resume';

import homeCatalogData from '../data/home-catalog.json';
import resumeCatalogData from '../data/resume-catalog.json';

const homeCatalog = homeCatalogData as HomeCatalog;
const resumeCatalog = resumeCatalogData as ResumeCatalog;

// 使用简历数据的Hook
export const useResumeData = () => {
  const { i18n } = useTranslation();

  return getActiveResumeContent(resumeCatalog, i18n.language as ResumeLanguage);
};

// 使用首页数据的Hook
export const useHomeData = () => {
  const { i18n } = useTranslation();

  return getActiveHomeContent(homeCatalog, i18n.language as HomeLanguage);
};
