import { useTranslation } from 'react-i18next';

import homeDataEnUS from '../data/homeData_en-US.json';
import homeDataJaJP from '../data/homeData_ja-JP.json';
import homeDataZhCN from '../data/homeData_zh-CN.json';
import resumeDataEnUS from '../data/resumeData_en-US.json';
import resumeDataJaJP from '../data/resumeData_ja-JP.json';
import resumeDataZhCN from '../data/resumeData_zh-CN.json';

// 简历数据映射
const resumeDataMap = {
  'zh-CN': resumeDataZhCN,
  'en-US': resumeDataEnUS,
  'ja-JP': resumeDataJaJP
};

// 首页数据映射
const homeDataMap = {
  'zh-CN': homeDataZhCN,
  'en-US': homeDataEnUS,
  'ja-JP': homeDataJaJP
};

// 使用简历数据的Hook
export const useResumeData = () => {
  const { i18n } = useTranslation();
  return resumeDataMap[i18n.language as keyof typeof resumeDataMap] || resumeDataMap['zh-CN'];
};

// 使用首页数据的Hook
export const useHomeData = () => {
  const { i18n } = useTranslation();
  return homeDataMap[i18n.language as keyof typeof homeDataMap] || homeDataMap['zh-CN'];
};