import { useTranslation } from 'react-i18next';

import { getActiveResumeContent } from '@/domain/resume/rules/resume-catalog';
import type { ResumeCatalog, ResumeLanguage } from '@/types/resume';

import homeDataEnUS from '../data/homeData_en-US.json';
import homeDataJaJP from '../data/homeData_ja-JP.json';
import homeDataZhCN from '../data/homeData_zh-CN.json';
import resumeCatalogData from '../data/resume-catalog.json';

const resumeCatalog = resumeCatalogData as ResumeCatalog;

// 首页数据映射
const homeDataMap = {
  'zh-CN': homeDataZhCN,
  'en-US': homeDataEnUS,
  'ja-JP': homeDataJaJP,
};

// 使用简历数据的Hook
export const useResumeData = () => {
  const { i18n } = useTranslation();

  return getActiveResumeContent(resumeCatalog, i18n.language as ResumeLanguage);
};

// 使用首页数据的Hook
export const useHomeData = () => {
  const { i18n } = useTranslation();
  return homeDataMap[i18n.language as keyof typeof homeDataMap] || homeDataMap['zh-CN'];
};
