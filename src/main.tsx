import React from 'react'

import { createRoot } from 'react-dom/client'

import App from './app'
import './index.css'
import './i18n/config'

// Only import and enable react-scan when SCAN_ENABLED environment variable is set to true
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_SCAN_ENABLED === 'true') {
  import('react-scan').then(({ scan }) => {
    scan();
  });
}

// Conditionally load react-grab when in development and GRAB_ENABLED environment variable is set to true
if (process.env.NODE_ENV === 'development' && import.meta.env.VITE_GRAB_ENABLED === 'true') {
  const script = document.createElement('script');
  script.src = '//unpkg.com/react-grab/dist/index.global.js';
  script.crossOrigin = 'anonymous';
  script.setAttribute('data-enabled', 'true');
  document.head.appendChild(script);
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)