import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译资源
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';
import zhCN from './locales/zh-CN.json';

const resources = {
  'zh-CN': {
    translation: zhCN
  },
  'en-US': {
    translation: enUS
  },
  'ja-JP': {
    translation: jaJP
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN', // 回退语言
    interpolation: {
      escapeValue: false // React已经处理了XSS
    }
  });

export default i18n;