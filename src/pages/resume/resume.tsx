import { Button } from "antd";

import { EditOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import About from "@/components/about";
import Experience from "@/components/experience";
import PDFModal from "@/components/pdf-modal";
import Header from "@/components/resume-header";
import SkillDescription from "@/components/skill-description";
import Skills from "@/components/skills";
import useResume from "@/hooks/use-resume";

const Resume = () => {
  const {isModalOpen, setIsModalOpen,userInfo,setUserInfo,resumeData} = useResume();  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header onExportClick={() => setIsModalOpen(true)} />
      <main className="container mx-auto px-4 py-8" id="resume-content">
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 flex justify-end">
            <Link to="/resume-editor">
              <Button type="primary" icon={<EditOutlined />}>
                编辑简历
              </Button>
            </Link>
          </div>
        )}
        {resumeData && (
          <>
            <About userInfo={userInfo} resumeData={resumeData} />
            <SkillDescription
              skillDescriptions={resumeData.basicInfo.skillDescriptions}
            />
            <Skills skills={resumeData.basicInfo.skills} />
            <Experience
              experience={resumeData.experience}
              projects={resumeData.projects}
              education={resumeData.education || []}
              website={resumeData.website || []}
            />
          </>
        )}
      </main>
      <PDFModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => setUserInfo(data)}
        correctToken={resumeData?.correctToken}
      />
    </div>
  );
};

export default Resume;
