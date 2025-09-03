import { useEffect, useMemo, useState } from "react";

const useTheme = () => {
    // 主题状态管理
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // 检查用户偏好的主题
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  const result = useMemo(() => ({
    darkMode,
    setDarkMode,
  }), [darkMode]);
  return result;
}
export default useTheme;