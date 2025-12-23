import { useEffect, useState } from 'react';

const useBackendStatus = () => {
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 只在开发环境下检测
    if (process.env.NODE_ENV !== 'development') {
      setLoading(false);
      setIsBackendAvailable(false);
      return;
    }

    const checkBackendStatus = async () => {
      try {
        setLoading(true);
        // 发送请求到后台服务的API端点
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000); // 设置超时时间，避免等待太长
        
        const response = await fetch('http://localhost:3001/api/resume', {
          method: 'HEAD',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId); // 清除超时定时器
        setIsBackendAvailable(response.ok);
      } catch (error) {
        // 请求失败或超时，说明后台服务未启动
        setIsBackendAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    // 初始检测
    checkBackendStatus();

    // 定期检测（每5秒）
    const intervalId = setInterval(checkBackendStatus, 5000);

    // 清理函数
    return () => clearInterval(intervalId);
  }, []);

  return { isBackendAvailable, loading };
};

export default useBackendStatus;
