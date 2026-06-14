import React from 'react';

import { Card, Col, Row, Timeline, Typography } from 'antd';

import { useTranslation } from 'react-i18next';

import aboutImage from '@/assets/img/about.png';

import { ThemeProps, Experience } from '../types';

const { Title, Paragraph, Text } = Typography;

interface AboutSectionProps extends ThemeProps {
  experiences: Experience[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ experiences }) => {
  const { t } = useTranslation();
  return (
    <section className="theme-page min-h-screen overflow-hidden py-20" id="part-3">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Title className="theme-text-primary mb-4 text-4xl font-bold" level={2}>
            {t('about.title')}
          </Title>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
        </div>

        <Row className="items-center" gutter={[32, 32]}>
          <Col className="order-1 lg:order-1" lg={14} xs={24}>
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full -z-10" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-100 rounded-full -z-10" />
              <div
                className="relative w-full transform overflow-hidden rounded-xl border border-[var(--color-border)] shadow-xl transition-all duration-500 hover:scale-[1.02]"
                style={{ maxHeight: '600px' }}
              >
                {/* 图片作为背景 */}
                <img
                  alt="About me"
                  className="h-full w-full object-cover"
                  src={aboutImage}
                  style={{ width: '100%', height: '100%' }}
                />
                {/* 半透明遮罩层，提高文字可读性 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {/* 文字内容绝对定位在图片底部 */}
                <div className="absolute top-0 left-0 right-0 p-8 bg-gradient-to-b from-black/50 to-transparent text-white">
                  <Title className="text-xl font-semibold mb-4 text-white" level={4}>
                    {t('about.intro')}
                  </Title>
                  <Paragraph className="mb-6 text-gray-200">{t('about.description')}</Paragraph>
                </div>
              </div>
            </div>
          </Col>

          <Col className="order-2 lg:order-2" lg={10} xs={24}>
            <Card className="theme-surface overflow-hidden">
              <div className="p-6">
                <Title className="theme-text-primary mb-4 text-xl font-semibold" level={4}>
                  {t('about.experience')}
                </Title>
                <Timeline
                  items={experiences.map((exp) => ({
                    color: 'blue',
                    children: (
                      <div>
                        <Text strong className="theme-text-primary">
                          {exp.title} - {exp.company}
                        </Text>
                        <Paragraph className="theme-text-secondary mb-2 mt-1">
                          {exp.description}
                        </Paragraph>
                        <Text className="theme-text-muted">{exp.year}</Text>
                      </div>
                    ),
                  }))}
                />

                <Title className="theme-text-primary mb-4 mt-8 text-xl font-semibold" level={4}>
                  {t('about.education')}
                </Title>
                <Timeline
                  items={[
                    {
                      color: 'green',
                      children: (
                        <div>
                          <Text strong className="theme-text-primary">
                            计算机科学与技术硕士
                          </Text>
                          <Paragraph className="theme-text-secondary mb-2 mt-1">
                            北京大学 - 2016-2018
                          </Paragraph>
                        </div>
                      ),
                    },
                    {
                      color: 'green',
                      children: (
                        <div>
                          <Text strong className="theme-text-primary">
                            软件工程学士
                          </Text>
                          <Paragraph className="theme-text-secondary mb-2 mt-1">
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
