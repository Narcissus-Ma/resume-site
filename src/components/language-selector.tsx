import { useTranslation } from 'react-i18next';
import { Select } from 'antd';

const { Option } = Select;

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select 
      value={i18n.language} 
      onChange={handleChange} 
      style={{ width: 120 }}
    >
      <Option value="zh-CN">中文</Option>
      <Option value="en-US">English</Option>
      <Option value="ja-JP">日本語</Option>
    </Select>
  );
};

export default LanguageSelector;