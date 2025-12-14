import { useState } from "react";

import { Button } from "antd";

import { EditOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import About from "@/components/About";
import Experience from "@/components/Experience";
import PDFModal from "@/components/PDFModal";
import Header from "@/components/resume-header";
import SkillDescription from "@/components/SkillDescription";
import Skills from "@/components/Skills";
import resumeDataJson from "@/data/resumeData.json";
import { ResumeData } from "@/types/resume";

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

const Resume = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    phone: "",
    email: "",
  });
  // 直接使用JSON数据，education和website属性已在JSON文件中补充
  const resumeData: ResumeData = resumeDataJson;
  return (
    <div className="min-h-screen bg-gray-100">
      <Header onExportClick={() => setIsModalOpen(true)} />
      <main className="container mx-auto px-4 py-8" id="resume-content">
        <div className="mb-6 flex justify-end">
          <Link to="/resume-editor">
            <Button type="primary" icon={<EditOutlined />}>
              编辑简历
            </Button>
          </Link>
        </div>
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
