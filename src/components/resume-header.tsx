import React from 'react';

import { Tooltip } from 'antd';

import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import useTheme from '@/hooks/use-theme';

interface HeaderProps {
  onExportClick?: () => void;
  showExportButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onExportClick, showExportButton = true }) => {
  const { t } = useTranslation();
  const { darkMode, toggleTheme } = useTheme();
  return (
    <header className="theme-header shadow-sm print:hidden">
      <div className="container mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <h1 className="text-2xl font-bold">
          <Link
            className="theme-text-primary transition-colors hover:text-[var(--color-primary)]"
            to="/"
          >
            {t('header.title')}
          </Link>
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <nav className="hidden md:flex">
            <Link
              className="theme-text-secondary transition-colors hover:text-[var(--color-primary)]"
              to="/"
            >
              {t('common.home')}
            </Link>
          </nav>
          <button
            aria-label={darkMode ? '切换到亮色主题' : '切换到暗色主题'}
            className="theme-text-primary rounded-md px-3 py-2 hover:bg-[var(--color-surface-muted)]"
            type="button"
            onClick={toggleTheme}
          >
            {darkMode ? <SunOutlined /> : <MoonOutlined />}
          </button>
          {showExportButton && onExportClick && (
            <>
              <Tooltip title="将站长的联系方式输入以获取完整的简历，可用于打印完整的简历信息。">
                <button
                  className="rounded-md bg-[var(--color-surface-muted)] px-4 py-2 text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
                  onClick={onExportClick}
                >
                  {t('pdfModal.title')}
                </button>
              </Tooltip>
              <button
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                onClick={() => window.print()}
              >
                {t('resume.printPdf')}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
