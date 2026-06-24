import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 단일 페이지 프론트엔드 도구 — 서버/백엔드 없음
// GitHub Pages 프로젝트 페이지(하위경로 /seat-maker/) 배포를 위해
// 빌드 시에만 base를 설정하고, 로컬 dev(serve)는 루트로 유지한다.
export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/seat-maker/',
  plugins: [react()],
  server: { port: 5173 },
}))
