import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 在开发环境使用'/resume-site/'，在生产环境使用相对路径
  base: process.env.NODE_ENV === 'production' ? './' : '/resume-site/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})