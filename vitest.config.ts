import { defineConfig } from 'vitest/config'

// 테스트 전용 설정 — vite.config.ts의 base(/seat-maker/) 간섭을 피하기 위해 분리한다.
// logic/domain/persistence 계층은 DOM에 의존하지 않으므로 node 환경에서 실행한다.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/logic/**', 'src/domain/**', 'src/persistence/**'],
      reporter: ['text', 'html'],
    },
  },
})
