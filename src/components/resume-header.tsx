import React from "react";

import { Tooltip } from "antd";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface HeaderProps {
  onExportClick?: () => void;
  showExportButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onExportClick,
  showExportButton = true,
}) => {
  const { t } = useTranslation();
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="hover:text-gray-200 transition-colors">
            {t("header.title")}
          </Link>
        </h1>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-gray-200 transition-colors">
              {t("common.home")}
            </Link>
          </nav>
          {showExportButton && onExportClick && (
            <>
              <Tooltip title="将站长的联系方式输入以获取完整的简历，可用于打印完整的简历信息。">
                <button
                  onClick={onExportClick}
                  className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100 mr-2"
                >
                  {t("pdfModal.title")}
                </button>
              </Tooltip>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100"
              >
                {t("resume.printPdf")}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
