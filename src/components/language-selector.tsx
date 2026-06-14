import { Select } from 'antd';

import useLanguageSelector from '@/hooks/use-language-selector';

const LanguageSelector = () => {
  const { i18n, handleChange, optionsConfig } = useLanguageSelector();

  return (
    <Select
      aria-label="选择语言"
      className="language-selector"
      options={optionsConfig}
      style={{ width: 100 }}
      value={i18n.language}
      onChange={handleChange}
    />
  );
};

export default LanguageSelector;
