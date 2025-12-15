import React from "react";

import { Button, Card, Col, Row, Space, Typography } from "antd";

import {
  GithubOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

import bilibiliImage from "@/assets/img/bilibili.png";
import giteeImage from "@/assets/img/gitee.png";

import { ThemeProps } from "../types";

const { Title, Text } = Typography;

const ContactSection: React.FC<ThemeProps> = ({ darkMode }) => {
  return (
    <section
      id="part-5"
      className={`min-h-screen py-20 ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-b from-gray-50 to-gray-100"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Title
            level={2}
            className={`text-4xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            联系方式
          </Title>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>

        <Row justify="center">
          <Col xs={24} md={12}>
            <Card className="border-0 shadow-lg">
              <div className="p-8">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <div className="flex items-start space-x-4 mb-6">
                      <PhoneOutlined className="text-blue-500 text-2xl mt-1" />
                      <div>
                        <Title
                          level={5}
                          className={`text-lg font-semibold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          电话
                        </Title>
                        <Text
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          138-1234-5678
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 mb-6">
                      <MailOutlined className="text-blue-500 text-2xl mt-1" />
                      <div>
                        <Title
                          level={5}
                          className={`text-lg font-semibold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          邮箱
                        </Title>
                        <Text
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          contact@example.com
                        </Text>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <EnvironmentOutlined className="text-blue-500 text-2xl mt-1" />
                      <div>
                        <Title
                          level={5}
                          className={`text-lg font-semibold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          地址
                        </Title>
                        <Text
                          className={
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }
                        >
                          北京市海淀区中关村科技园
                        </Text>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Title
                      level={5}
                      className={`text-lg font-semibold mb-4 ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      社交媒体
                    </Title>
                    <Space size="large" wrap>
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <GithubOutlined className="text-3xl" />
                      </a>
                      <a
                        href="#"
                        className="text-gray-800 hover:text-gray-600 transition-colors"
                      >
                        <img
                          src={giteeImage}
                          alt="Gitee"
                          className="w-10 h-10"
                        />
                      </a>
                      <a
                        href="#"
                        className="text-blue-700 hover:text-blue-900 transition-colors"
                      >
                        <LinkedinOutlined className="text-3xl" />
                      </a>
                      <a
                        href="#"
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <img
                          src={bilibiliImage}
                          alt="Bilibili"
                          className="w-10 h-10"
                        />
                      </a>
                    </Space>

                    <div className="mt-8">
                      <Title
                        level={5}
                        className={`text-lg font-semibold mb-4 ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        给我留言
                      </Title>
                      <div className="space-y-4">
                        <Button
                          type="primary"
                          block
                          size="large"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          发送邮件
                        </Button>
                        <Button
                          type="default"
                          block
                          size="large"
                          className={
                            darkMode
                              ? "border-gray-600 bg-gray-700 text-white"
                              : "border-gray-300"
                          }
                        >
                          预约面谈
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default ContactSection;
