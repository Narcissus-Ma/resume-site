import { Select } from 'antd';

import useLanguageSelector from '@/hooks/use-language-selector';

const LanguageSelector = () => {
  const { i18n, handleChange, optionsConfig } = useLanguageSelector();

  return (
    <Select
      options={optionsConfig}
      style={{ width: 100, height: 20, fontSize: 12 }}
      value={i18n.language}
      onChange={handleChange}
    />
  );
};

export default LanguageSelector;
