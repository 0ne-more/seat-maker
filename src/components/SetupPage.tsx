// 자리 설정 페이지 — 교실 그리드 + 학생 명단 + 하단 액션바
import { useEffect, useRef, useState } from 'react'
import type { SeatingApi } from '../hooks/useSeating'
import type { Viewport } from '../logic/layout'
import { COLORS } from '../constants'
import { computeGridLayout } from '../logic/layout'
import { SeatGrid } from './SeatGrid'
import { StudentTable } from './StudentTable'
import { Stepper } from './Stepper'
import { Toggle } from './Toggle'

export function SetupPage({ api, viewport }: { api: SeatingApi; viewport: Viewport }) {
  const gridBoxRef = useRef<HTMLDivElement>(null)
  const [setupAvailW, setSetupAvailW] = useState<number | null>(null)

  // 그리드 박스 너비 측정 (좌우 카드 비율 유지하며 자리만 축소)
  useEffect(() => {
    const measure = () => {
      const box = gridBoxRef.current
      if (box) setSetupAvailW(Math.max(220, box.clientWidth - 36))
    }
    measure()
    const id = requestAnimationFrame(measure)
    const t = setTimeout(measure, 120)
    const ro = new ResizeObserver(measure)
    if (gridBoxRef.current) ro.observe(gridBoxRef.current)
    return () => {
      cancelAnimationFrame(id)
      clearTimeout(t)
      ro.disconnect()
    }
  }, [])

  const layout = computeGridLayout({
    mode: 'setup',
    cols: api.cols,
    rows: api.rows,
    pair: api.pair,
    viewport,
    showRoster: api.showRoster,
    setupAvailW,
  })

  return (
    <div className="pg-app">
      <div style={{ maxWidth: 1340, margin: '0 auto', padding: '30px 40px 130px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 28, alignItems: 'start' }}>
          {/* 왼쪽: 교실 자리 */}
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: '26px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 21 }}>교실 자리</div>
                <div style={{ fontSize: 12.5, color: COLORS.mute, marginTop: 3 }}>자리를 클릭해 사용/미사용을 정하세요</div>
              </div>
              <Toggle label="짝꿍 만들기" on={api.pair} onToggle={api.togglePair} />
            </div>

            {/* 크기 조절 */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              <Stepper label="가로" value={api.cols} onDec={api.decCols} onInc={api.incCols} />
              <Stepper label="세로" value={api.rows} onDec={api.decRows} onInc={api.incRows} />
            </div>

            {/* 그리드 */}
            <div
              ref={gridBoxRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                background: COLORS.bgCream,
                borderRadius: 18,
                padding: '26px 18px',
                overflow: 'hidden',
              }}
            >
              <SeatGrid
                mode="setup"
                cols={api.cols}
                rows={api.rows}
                pair={api.pair}
                layout={layout}
                inactive={api.inactive}
                arrangement={api.arrangement}
                fixed={api.fixed}
                students={api.students}
                onToggleSeat={api.toggleSeat}
              />
              <div
                style={{
                  width: 210,
                  height: 34,
                  background: COLORS.ink,
                  color: '#fff',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  letterSpacing: 4,
                  marginTop: 4,
                }}
              >
                교 탁
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, fontSize: 12.5, color: COLORS.mute }}>
              <span>
                활성 자리 <b style={{ color: COLORS.ink }}>{api.activeCount}</b>
              </span>
              <span>
                학생 <b style={{ color: COLORS.ink }}>{api.count}</b>
              </span>
              <span style={{ color: api.fits ? '#3F9E33' : COLORS.avoidTagText }}>{api.fits ? '배치 가능 ✓' : '자리 부족'}</span>
            </div>
          </div>

          {/* 오른쪽: 학생 명단 */}
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 24,
              padding: '26px 28px',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 680,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 21 }}>학생 명단</div>
                <div style={{ fontSize: 12.5, color: COLORS.mute, marginTop: 3, lineHeight: 1.55 }}>
                  인접 금지 번호는 번호 입력 후 Enter로 추가
                  <br />
                  (최대 8명, 양방향 자동 등록)
                </div>
              </div>
              <div
                style={{
                  background: COLORS.ink,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '8px 16px',
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                인원 {api.count}
              </div>
            </div>
            <StudentTable api={api} />
          </div>
        </div>
      </div>

      {/* 하단 액션바 */}
      <div
        data-noprint="1"
        style={{
          position: 'sticky',
          bottom: 0,
          width: '100%',
          background: 'linear-gradient(to top,#F4F1E8 60%,rgba(244,241,232,0))',
          padding: '22px 40px 26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          zIndex: 15,
        }}
      >
        <div style={{ fontSize: 13, color: '#D6452A', fontWeight: 500, minHeight: 0 }}>{api.setupWarn}</div>
        <div
          onClick={api.generate}
          style={{
            background: COLORS.coral,
            color: '#fff',
            fontFamily: "'Jua', sans-serif",
            fontSize: 20,
            padding: '16px 56px',
            borderRadius: 999,
            boxShadow: `0 5px 0 ${COLORS.coralShadow}`,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          자리 생성하기
        </div>
      </div>
    </div>
  )
}
