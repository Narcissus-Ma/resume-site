import React from 'react';

import { Link } from 'react-router-dom';

interface HeaderProps {
  onExportClick?: () => void;
  showExportButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onExportClick, showExportButton = true }) => {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link to="/" className="hover:text-gray-200 transition-colors">
            我的简历
          </Link>
        </h1>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-gray-200 transition-colors">首页</Link>
            <Link to="/resume" className="hover:text-gray-200 transition-colors">简历</Link>
          </nav>
          {showExportButton && onExportClick && (
            <>
              <button
                onClick={onExportClick}
                className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100 mr-2"
              >
                输入信息
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-white text-primary rounded-md hover:bg-gray-100"
              >
                打印PDF
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;