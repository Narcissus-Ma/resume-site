import React, { useCallback } from 'react';

import { Anchor, Button, Dropdown } from 'antd';

import { MenuOutlined, MoonOutlined, SettingOutlined, SunOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useBackendStatus from '@/hooks/use-backend-status';

import { ThemeProps } from '../types';
import LanguageSelector from './language-selector';

const Header: React.FC<ThemeProps> = ({ darkMode, toggleTheme }) => {
  const { isBackendAvailable } = useBackendStatus();
  const { t } = useTranslation();
  const navigationItems = [
    {
      key: 'part-1',
      href: '#part-1',
      title: t('common.home'),
    },
    {
      key: 'part-2',
      href: '#part-2',
      title: t('resume.skills'),
    },
    {
      key: 'part-3',
      href: '#part-3',
      title: t('common.about'),
    },
    {
      key: 'part-4',
      href: '#part-4',
      title: t('resume.projects'),
    },
    {
      key: 'part-5',
      href: '#part-5',
      title: t('common.contact'),
    },
  ];
  const mobileMenuItems = navigationItems.map((item) => ({
    key: item.key,
    label: <a href={item.href}>{item.title}</a>,
  }));
  const handleGetCurrentAnchor = useCallback((activeLink: string) => activeLink || '#part-1', []);

  return (
    <header className="theme-header sticky top-0 z-50 shadow-sm backdrop-blur-md">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-3 px-4">
        <Anchor
          affix={false}
          className="hidden md:block"
          direction="horizontal"
          getCurrentAnchor={handleGetCurrentAnchor}
          items={navigationItems}
        />
        <Dropdown menu={{ items: mobileMenuItems }} placement="bottomLeft" trigger={['click']}>
          <Button
            aria-label="打开页面导航"
            className="theme-text-primary md:hidden"
            icon={<MenuOutlined />}
            type="text"
          />
        </Dropdown>
        <div className="flex min-w-0 items-center gap-1">
          <LanguageSelector />
          <Button
            aria-label={darkMode ? '切换到亮色主题' : '切换到暗色主题'}
            className="theme-text-primary rounded-full"
            icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
            type="text"
            onClick={toggleTheme}
          />
          {process.env.NODE_ENV === 'development' && isBackendAvailable && (
            <Link to="/home-manage">
              <Button
                aria-label="打开首页管理"
                className="theme-text-primary rounded-full"
                icon={<SettingOutlined />}
                type="text"
              />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
