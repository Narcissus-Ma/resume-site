import React from 'react';

import { useTranslation } from 'react-i18next';

import { ResumeData } from '../types/resume';

interface UserInfo {
  name?: string;
  phone?: string;
  email?: string;
}

interface AboutProps {
  userInfo: UserInfo;
  resumeData: ResumeData;
}

const About: React.FC<AboutProps> = ({ userInfo, resumeData }) => {
  const { t } = useTranslation();
  return (
    <section className="theme-surface mb-6 rounded-lg p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{userInfo.name || '马先生'}</h1>
        <p className="theme-text-secondary">{resumeData.basicInfo.title}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <span className="break-all">
            {t('contact.phone')}: {userInfo.phone || 'XXX-XXXX-XXXX'}
          </span>
          <span className="break-all">
            {t('contact.email')}: {userInfo.email || 'xxx@example.com'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default About;
