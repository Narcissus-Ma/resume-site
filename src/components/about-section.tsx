import React from "react";

import { Card, Col, Row, Timeline, Typography } from "antd";

import { useTranslation } from "react-i18next";

import aboutImage from "@/assets/img/about.png";

import { ThemeProps, Experience } from "../types";

const { Title, Paragraph, Text } = Typography;

interface AboutSectionProps extends ThemeProps {
  experiences: Experience[];
}

const AboutSection: React.FC<AboutSectionProps> = ({
  darkMode,
  experiences,
}) => {
  const { t } = useTranslation();
  return (
    <section
      id="part-3"
      className={`min-h-screen py-20 ${darkMode ? "bg-gray-800" : "bg-white"}`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Title
            level={2}
            className={`text-4xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {t("about.title")}
          </Title>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>

        <Row gutter={[32, 32]} className="items-center">
          <Col xs={24} lg={14} className="order-1 lg:order-1">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full -z-10" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full -z-10" />
              <div
                className={`relative w-full rounded-xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105 ${darkMode ? 'border border-gray-700' : ''}`}
                style={{ maxHeight: "600px" }}
              >
                {/* 图片作为背景 */}
                <img
                  src={aboutImage}
                  alt="About me"
                  className={`w-full h-full object-cover ${darkMode ? 'brightness-90' : ''}`}
                  style={{ width: "100%", height: "100%" }}
                />
                {/* 半透明遮罩层，提高文字可读性 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* 文字内容绝对定位在图片底部 */}
                <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/50 to-transparent text-white">
                  <Title
                    level={4}
                    className="text-xl font-semibold mb-4 text-white"
                  >
                    {t("about.intro")}
                  </Title>
                  <Paragraph
                    className="mb-6 text-gray-200"
                  >
                    {t("about.description")}
                  </Paragraph>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={10} className="order-2 lg:order-2">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="p-6">
                <Title
                  level={4}
                  className={`text-xl font-semibold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("about.experience")}
                </Title>
                <Timeline
                  items={experiences.map((exp) => ({
                    color: "blue",
                    children: (
                      <div>
                        <Text
                          strong
                          className={darkMode ? "text-white" : "text-gray-800"}
                        >
                          {exp.title} - {exp.company}
                        </Text>
                        <Paragraph
                          className={`mt-1 mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {exp.description}
                        </Paragraph>
                        <Text type="secondary">{exp.year}</Text>
                      </div>
                    ),
                  }))}
                />

                <Title
                  level={4}
                  className={`text-xl font-semibold mt-8 mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {t("about.education")}
                </Title>
                <Timeline
                  items={[
                    {
                      color: "green",
                      children: (
                        <div>
                          <Text
                            strong
                            className={
                              darkMode ? "text-white" : "text-gray-800"
                            }
                          >
                            计算机科学与技术硕士
                          </Text>
                          <Paragraph
                            className={`mt-1 mb-2 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            北京大学 - 2016-2018
                          </Paragraph>
                        </div>
                      ),
                    },
                    {
                      color: "green",
                      children: (
                        <div>
                          <Text
                            strong
                            className={
                              darkMode ? "text-white" : "text-gray-800"
                            }
                          >
                            软件工程学士
                          </Text>
                          <Paragraph
                            className={`mt-1 mb-2 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            清华大学 - 2012-2016
                          </Paragraph>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default AboutSection;
