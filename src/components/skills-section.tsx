import React from 'react';

import { Card, Col, Progress, Row, Typography } from 'antd';

import { DatabaseOutlined, CodeOutlined, BackwardOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { ThemeProps, Skill } from '../types';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

interface SkillsSectionProps extends ThemeProps {
  skills: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const { t } = useTranslation();
  return (
    <section className="theme-section min-h-screen py-20" id="part-2">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Title className="theme-text-primary mb-4 text-4xl font-bold" level={2}>
            {t('skills.title')}
          </Title>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full" />
          <Paragraph className="theme-text-secondary mx-auto mt-4 max-w-2xl">
            {t('skills.description')}
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {skills.map((skill, index) => (
            <Col key={index} md={12} xs={24}>
              <Card className="theme-surface transition-shadow duration-300 hover:shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong className="theme-text-primary text-lg">
                      {skill.name}
                    </Text>
                    <Text className="theme-text-secondary">{skill.value}%</Text>
                  </div>
                  <Progress
                    className="h-2 rounded-full"
                    percent={skill.value}
                    size={['100%', 4]}
                    trailColor="var(--color-surface-muted)"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="mt-12" gutter={[24, 24]}>
          <Col md={8} xs={24}>
            <Card className="theme-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <Meta
                avatar={<CodeOutlined className="text-blue-500 text-3xl" />}
                title={t('skills.frontend.title')}
                description={
                  <Text className="theme-text-secondary">{t('skills.frontend.description')}</Text>
                }
              />
            </Card>
          </Col>

          <Col md={8} xs={24}>
            <Card className="theme-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <Meta
                avatar={<DatabaseOutlined className="text-green-500 text-3xl" />}
                title={t('skills.backend.title')}
                description={
                  <Text className="theme-text-secondary">{t('skills.backend.description')}</Text>
                }
              />
            </Card>
          </Col>

          <Col md={8} xs={24}>
            <Card className="theme-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <Meta
                avatar={<BackwardOutlined className="text-purple-500 text-3xl" />}
                title={t('skills.uiux.title')}
                description={
                  <Text className="theme-text-secondary">{t('skills.uiux.description')}</Text>
                }
              />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default SkillsSection;
