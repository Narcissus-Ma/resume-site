import React from "react";

import { Anchor, Button } from "antd";

import { MoonOutlined, SunOutlined, SettingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import useBackendStatus from "@/hooks/use-backend-status";

import { ThemeProps } from "../types";
import LanguageSelector from "./language-selector";

const Header: React.FC<ThemeProps> = ({ darkMode, toggleTheme }) => {
  const { isBackendAvailable } = useBackendStatus();
  const { t } = useTranslation();
  return (
    <div
      className={`sticky top-0 z-50 ${darkMode ? "bg-gray-800/80 text-white" : "bg-white/80 text-gray-800"
        } backdrop-blur-md shadow-sm`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Anchor
          direction="horizontal"
          affix={false}
          items={[
            {
              key: "part-1",
              href: "#part-1",
              title: t("common.home"),
            },
            {
              key: "part-2",
              href: "#part-2",
              title: t("resume.skills"),
            },
            {
              key: "part-3",
              href: "#part-3",
              title: t("common.about"),
            },
            {
              key: "part-4",
              href: "#part-4",
              title: t("resume.projects"),
            },
            {
              key: "part-5",
              href: "#part-5",
              title: t("common.contact"),
            },
          ]}
        />
        <div className="flex items-center">
          <LanguageSelector />
          <Button
            type="text"
            icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            className={`rounded-full ml-2 ${darkMode ? "text-yellow-300" : "text-gray-700"
              }`}
          />
          {process.env.NODE_ENV === "development" && isBackendAvailable && (
            <Link to="/home-manage">
              <Button
                type="text"
                icon={<SettingOutlined />}
                className={`rounded-full mr-2 ${darkMode ? "text-blue-300" : "text-gray-700"
                  }`}
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
