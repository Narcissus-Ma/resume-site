import { useState } from "react";

import { ResumeData } from "@/types/resume";

import { useResumeData } from "./use-translated-data";

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

const useResume = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    phone: "",
    email: "",
  });
  const resumeData: ResumeData = useResumeData();

  return {
    isModalOpen,
    setIsModalOpen,
    userInfo,
    setUserInfo,
    resumeData,
  };
};
export default useResume;
