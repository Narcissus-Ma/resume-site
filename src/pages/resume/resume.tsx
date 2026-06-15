import { Button } from 'antd';

import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import About from '@/components/about';
import AdminEntryLink from '@/components/admin-entry-link';
import Experience from '@/components/experience';
import PDFModal from '@/components/pdf-modal';
import Header from '@/components/resume-header';
import SkillDescription from '@/components/skill-description';
import Skills from '@/components/skills';
import useResume from '@/hooks/use-resume';

const Resume = () => {
  const { isModalOpen, setIsModalOpen, userInfo, setUserInfo, resumeData } = useResume();
  const { t } = useTranslation();
  return (
    <div className="theme-page min-h-screen">
      <Header onExportClick={() => setIsModalOpen(true)} />
      <main className="container mx-auto max-w-5xl px-4 py-8" id="resume-content">
        <div className="mb-6 flex justify-end">
          <AdminEntryLink to="/resume-editor">
            <Button icon={<EditOutlined />} type="primary">
              {t('resume.edit')}
            </Button>
          </AdminEntryLink>
        </div>
        {resumeData && (
          <>
            <About resumeData={resumeData} userInfo={userInfo} />
            <SkillDescription skillDescriptions={resumeData.basicInfo.skillDescriptions} />
            <Skills skills={resumeData.basicInfo.skills} />
            <Experience
              education={resumeData.education || []}
              experience={resumeData.experience}
              projects={resumeData.projects}
              website={resumeData.website || []}
            />
          </>
        )}
      </main>
      <PDFModal
        correctToken={resumeData?.correctToken}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => setUserInfo(data)}
      />
    </div>
  );
};

export default Resume;
