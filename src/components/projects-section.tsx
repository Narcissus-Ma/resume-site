import React from "react";

import { Button, Typography, Carousel } from "antd";

import { RightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";


import { ThemeProps, Project } from "../types";

const { Title, Paragraph } = Typography;

interface ProjectsSectionProps extends ThemeProps {
  projects?: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  darkMode,
  projects: propProjects,
}) => {
  const { t } = useTranslation();
  // 使用传入的projects参数，如果没有则使用默认模拟数据
  const projects = propProjects || [
    {
      title: "网站1",
      description: "网站采用响应式布局，适配于多种设备，具有UI组件和动画交互。",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80",
      link: "#",
    },
    {
      title: "网站2",
      description:
        "基于React开发的现代化Web应用，包含完整的用户系统和数据管理功能。",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80",
      link: "#",
    },
    {
      title: "网站3",
      description: "企业级数据可视化平台，支持实时数据分析和报表生成。",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
      link: "#",
    },
  ];

  return (
    <section
      id="part-4"
      className={`py-20 ${darkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title
            level={2}
            className={`text-3xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {t("projects.title")}
          </Title>
          <Paragraph
            className={`text-gray-500 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {t("projects.recent")}
          </Paragraph>
        </div>

        <div className="max-w-4xl mx-auto">
          <Carousel
            autoplay
            autoplaySpeed={5000}
            dots
            arrows
            className="relative"
          >
            {projects.map((project, index) => (
              <div
                key={index}
                className="flex items-center justify-center py-8 px-[50px]"
              >
                <div className="flex items-center">
                  {/* 项目图片 */}
                  <div className="w-64 h-64">
                    <img
                      alt={project.title}
                      src={project.image}
                      className={`w-full h-full object-cover rounded-lg shadow-lg ${darkMode ? 'border border-gray-700 brightness-90' : ''}`}
                    />
                  </div>

                  {/* 项目信息 */}
                  <div className="ml-8">
                    <Title
                      level={4}
                      className={`text-2xl font-bold mb-4 ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {project.title}
                    </Title>
                    <Paragraph
                      className={`mb-6 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {project.description}
                    </Paragraph>
                    <Button
                      type="primary"
                      icon={<RightOutlined />}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {t("projects.demo")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
