import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './app';
import './i18n/config';
import './index.css';

// Only import and enable react-scan when SCAN_ENABLED environment variable is set to true
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_SCAN_ENABLED === 'true') {
  import('react-scan').then(({ scan }) => {
    scan();
  });
}

// 开发环境下动态加载 React Grab，用于 AI 编程助手关联 UI 元素与源码位置
if (
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  import.meta.env.VITE_GRAB_ENABLED === 'true'
) {
  const scriptId = 'react-grab-runtime';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = '//unpkg.com/react-grab/dist/index.global.js';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
