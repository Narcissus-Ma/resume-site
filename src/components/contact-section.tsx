import React from 'react';

import { Button, Card, Col, Row, Space, Typography } from 'antd';

import {
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import bilibiliImage from '@/assets/img/bilibili.png';
import giteeImage from '@/assets/img/gitee.png';

import { ThemeProps } from '../types';

const { Title, Text } = Typography;

const ContactSection: React.FC<ThemeProps> = () => {
  const { t } = useTranslation();
  return (
    <section className="theme-section min-h-screen py-20" id="part-5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Title className="theme-text-primary mb-4 text-4xl font-bold" level={2}>
            {t('contact.title')}
          </Title>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>

        <Row justify="center">
          <Col md={12} xs={24}>
            <Card className="theme-surface">
              <div className="p-8">
                <Row gutter={[24, 24]}>
                  <Col md={12} xs={24}>
                    <div className="flex items-start space-x-4 mb-6">
                      <PhoneOutlined className="text-blue-500 text-2xl mt-1" />
                      <div>
                        <Title className="theme-text-primary text-lg font-semibold" level={5}>
                          {t('contact.phone')}
                        </Title>
                        <Text className="theme-text-secondary">138-1234-5678</Text>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 mb-6">
                      <MailOutlined className="text-blue-500 text-2xl mt-1" />
                      <div>
                        <Title className="theme-text-primary text-lg font-semibold" level={5}>
                          {t('contact.email')}
                        </Title>
                        <Text className="theme-text-secondary">contact@example.com</Text>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <EnvironmentOutlined className="text-blue-500 text-2xl mt-1" />
                      <div>
                        <Title className="theme-text-primary text-lg font-semibold" level={5}>
                          {t('contact.address')}
                        </Title>
                        <Text className="theme-text-secondary">北京市海淀区中关村科技园</Text>
                      </div>
                    </div>
                  </Col>

                  <Col md={12} xs={24}>
                    <Title className="theme-text-primary mb-4 text-lg font-semibold" level={5}>
                      {t('contact.socialMedia')}
                    </Title>
                    <Space wrap size="large">
                      <a className="text-blue-600 hover:text-blue-800 transition-colors" href="#">
                        <GithubOutlined className="text-3xl" />
                      </a>
                      <a className="text-gray-800 hover:text-gray-600 transition-colors" href="#">
                        <img alt="Gitee" className="w-10 h-10" src={giteeImage} />
                      </a>
                      <a className="text-blue-700 hover:text-blue-900 transition-colors" href="#">
                        <LinkedinOutlined className="text-3xl" />
                      </a>
                      <a className="text-red-600 hover:text-red-800 transition-colors" href="#">
                        <img alt="Bilibili" className="w-10 h-10" src={bilibiliImage} />
                      </a>
                    </Space>

                    <div className="mt-8">
                      <Title className="theme-text-primary mb-4 text-lg font-semibold" level={5}>
                        {t('contact.sendMessage')}
                      </Title>
                      <div className="space-y-4">
                        <Button
                          block
                          className="bg-blue-600 hover:bg-blue-700"
                          size="large"
                          type="primary"
                        >
                          {t('contact.sendEmail')}
                        </Button>
                        <Button
                          block
                          className="border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]"
                          size="large"
                          type="default"
                        >
                          {t('contact.appointment')}
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
