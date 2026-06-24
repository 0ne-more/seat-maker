// 앱 루트 — 헤더 + 단계별 페이지(설정/결과) + 토스트
import { COLORS } from './constants'
import { useSeating } from './hooks/useSeating'
import { useViewport } from './hooks/useViewport'
import { Header } from './components/Header'
import { SetupPage } from './components/SetupPage'
import { ResultPage } from './components/ResultPage'
import { Toast } from './components/Toast'

export function App() {
  const api = useSeating()
  const viewport = useViewport()

  return (
    <div style={{ minHeight: '100%', background: COLORS.bgCream, fontFamily: "'Noto Sans KR', sans-serif", color: COLORS.ink }}>
      <Header page={api.page} />
      {api.page === 'setup' ? <SetupPage api={api} viewport={viewport} /> : <ResultPage api={api} viewport={viewport} />}
      <Toast message={api.toastMsg} />
    </div>
  )
}
