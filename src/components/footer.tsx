import React from 'react';

import { Space, Typography } from 'antd';

import { GithubOutlined, LinkedinOutlined, MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import giteeImage from '@/assets/img/gitee.png';

import { ThemeProps } from '../types';

const { Title, Paragraph } = Typography;

const Footer: React.FC<ThemeProps> = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-[var(--color-border)] bg-slate-950 py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <Title className="mb-4 text-2xl font-bold text-white" level={4}>
            {t('footer.title')}
          </Title>
          <Paragraph className="mx-auto mb-8 max-w-2xl text-slate-300">
            {t('footer.description')}
          </Paragraph>
          <Space className="justify-center" size="large">
            <a className="text-gray-300 hover:text-white transition-colors" href="#">
              <GithubOutlined className="text-xl" />
            </a>
            <a className="text-gray-300 hover:text-white transition-colors" href="#">
              <img alt="Gitee" className="w-6 h-6" src={giteeImage} />
            </a>
            <a className="text-gray-300 hover:text-white transition-colors" href="#">
              <LinkedinOutlined className="text-xl" />
            </a>
            <a className="text-gray-300 hover:text-white transition-colors" href="#">
              <MailOutlined className="text-xl" />
            </a>
          </Space>
          <div className="mt-8 text-sm text-slate-400">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
