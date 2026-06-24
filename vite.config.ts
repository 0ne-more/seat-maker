import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 단일 페이지 프론트엔드 도구 — 서버/백엔드 없음
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
})
