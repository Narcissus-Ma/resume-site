import { Select } from "antd";

import useLanguageSelector from "@/hooks/use-language-selector";

const LanguageSelector = () => {
  const { i18n, handleChange, optionsConfig } = useLanguageSelector();

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      options={optionsConfig}
      style={{ width: 100, height: 20, fontSize: 12 }}
    />
  );
};

export default LanguageSelector;
