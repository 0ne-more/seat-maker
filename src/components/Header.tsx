// 앱 헤더 — 로고 + 단계 표시(1 자리 설정 → 2 배치 결과)
import type { Page } from '../types'
import { COLORS } from '../constants'

export function Header({ page }: { page: Page }) {
  const isSetup = page === 'setup'
  const isResult = page === 'result'
  return (
    <div
      data-noprint="1"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 40px',
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            background: COLORS.coral,
            borderRadius: '48% 52% 50% 50%/54% 50% 50% 46%',
            animation: 'floaty 5s ease-in-out infinite',
          }}
        >
          <div style={{ position: 'absolute', top: 14, left: 11, width: 5, height: 7, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 14, right: 11, width: 5, height: 7, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 22, left: 14, width: 12, height: 7, borderBottom: '2px solid #fff', borderRadius: '0 0 16px 16px' }} />
        </div>
        <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 22 }}>자리 배치</div>
        <div style={{ fontSize: 13, color: COLORS.mute, marginLeft: 2 }}>교사용 자동 자리 배치 도구</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: COLORS.mute }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: isSetup ? COLORS.coral : '#CFC8B8' }} />
        <span style={{ fontWeight: 700, color: isSetup ? COLORS.ink : COLORS.muteSoft }}>1 자리 설정</span>
        <span style={{ margin: '0 4px' }}>→</span>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: isResult ? COLORS.coral : '#CFC8B8' }} />
        <span style={{ fontWeight: 700, color: isResult ? COLORS.ink : COLORS.muteSoft }}>2 배치 결과</span>
      </div>
    </div>
  )
}
