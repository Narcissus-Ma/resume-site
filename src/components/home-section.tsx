import React from 'react';

import { Button, Typography } from 'antd';

import {
  ArrowRightOutlined,
  GithubOutlined,
  LinkedinOutlined,
  MailOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import catImage from '@/assets/img/cat.png';

import { ThemeProps } from '../types';

const { Title, Paragraph } = Typography;

interface HomeSectionProps extends ThemeProps {
  occupation: string;
  description: string;
}

const HomeSection: React.FC<HomeSectionProps> = ({ occupation, description }) => {
  const { t } = useTranslation();
  return (
    <section
      className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden"
      id="part-1"
    >
      <div className="hero-background absolute inset-0 -z-10" />
      <div className="hero-accent absolute inset-0 -z-10" />

      <div className="container mx-auto flex flex-col items-center px-4 py-12 md:py-16">
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-10 md:flex-row md:gap-16">
          <div className="w-full max-w-2xl text-left">
            <div className="mb-6 relative">
              {/* 左侧社交媒体图标 */}
              <div className="absolute -left-24 top-1/3 hidden lg:flex flex-col items-center space-y-6 z-10">
                <a
                  aria-label="GitHub"
                  className="theme-text-secondary theme-link transition-colors"
                  href="#"
                >
                  <GithubOutlined size={32} />
                </a>
                <a
                  aria-label="LinkedIn"
                  className="theme-text-secondary theme-link transition-colors"
                  href="#"
                >
                  <LinkedinOutlined size={32} />
                </a>
                <a
                  aria-label="邮箱"
                  className="theme-text-secondary theme-link transition-colors"
                  href="#"
                >
                  <MailOutlined size={32} />
                </a>
              </div>

              <Paragraph className="theme-text-secondary mb-3 text-4xl font-bold sm:text-5xl">
                {t('home.hi')}
              </Paragraph>
              <Title className="theme-text-primary mb-4 text-5xl font-bold md:text-6xl" level={1}>
                Narcissus
              </Title>
              <Paragraph className="theme-text-secondary mb-5 text-2xl">{occupation}</Paragraph>
              <Paragraph className="theme-text-secondary max-w-xl text-lg leading-8">
                {description}
              </Paragraph>
            </div>

            <Button className="px-8" size="large" type="primary">
              <Link className="text-white flex items-center" to="/resume">
                {t('home.viewResume')} <ArrowRightOutlined className="ml-2" />
              </Link>
            </Button>
          </div>

          <div className="hidden shrink-0 md:block">
            <div className="w-56 h-56 rounded-full bg-blue-500 flex items-center justify-center p-4">
              <img alt="Logo" className="w-full h-full object-contain" src={catImage} />
            </div>
          </div>
        </div>

        {/* 往下滑提示 */}
        <div className="mt-10 flex animate-bounce flex-col items-center">
          <Paragraph className="theme-text-muted mb-2">{t('home.scrollDown')}</Paragraph>
          <MenuFoldOutlined className="theme-text-muted" style={{ rotate: '-90deg' }} />
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
