import { useCallback } from "react";

import { useTranslation } from "react-i18next";

const useLanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleChange = useCallback((value: string) => {
    i18n.changeLanguage(value);
  }, [i18n]);

  const optionsConfig = [
    { value: "zh-CN", label: <span className="text-xs">中文</span> },
    { value: "en-US", label: <span className="text-xs">English</span> },
    { value: "ja-JP", label: <span className="text-xs">日本語</span> },
  ];

  return {
    i18n,
    handleChange,
    optionsConfig,
  };
};

export default useLanguageSelector;
