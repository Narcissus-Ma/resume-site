import { useMemo, useState } from "react";

import resumeDataJson from "@/data/resumeData.json";
import { ResumeData } from "@/types/resume";

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
  const resumeData: ResumeData = useMemo(() => resumeDataJson, []);

  return {
    isModalOpen,
    setIsModalOpen,
    userInfo,
    setUserInfo,
    resumeData,
  };
};
export default useResume;
