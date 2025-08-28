import { useState } from "react";

import About from "@/components/About";
import Experience from "@/components/Experience";
import Header from "@/components/Header";
import PDFModal from "@/components/PDFModal";
import SkillDescription from "@/components/SkillDescription";
import Skills from "@/components/Skills";
import { resumeData } from "@/data/resumeData";




interface UserInfo {
    name: string;
    phone: string;
    email: string;
}

const Resume = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [userInfo, setUserInfo] = useState<UserInfo>({
        name: '',
        phone: '',
        email: ''
    });
    return (
        <div className="min-h-screen bg-gray-100">
            <Header onExportClick={() => setIsModalOpen(true)} />
            <main className="container mx-auto px-4 py-8" id="resume-content">
                <About userInfo={userInfo} />
                <SkillDescription skillDescriptions={resumeData.basicInfo.skillDescriptions} />
                <Skills skills={resumeData.basicInfo.skills} />
                <Experience
                    experience={resumeData.experience}
                    projects={resumeData.projects}
                    education={resumeData.education}
                    website={resumeData.website}
                />
            </main>
            <PDFModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => setUserInfo(data)}
            />
        </div>
    );
}

export default Resume;