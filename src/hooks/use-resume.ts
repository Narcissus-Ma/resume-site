import { useState } from 'react';

import { useResumeData } from './use-translated-data';

interface UserInfo {
  name: string;
  phone: string;
  email: string;
}

const useResume = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phone: '',
    email: '',
  });
  const { loading, resumeData } = useResumeData();

  return {
    loading,
    isModalOpen,
    setIsModalOpen,
    userInfo,
    setUserInfo,
    resumeData,
  };
};
export default useResume;
