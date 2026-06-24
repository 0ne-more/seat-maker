// A4 가로 인쇄 레이아웃 — 화면에선 숨김(@media print에서만 노출)
import type { SeatingApi } from '../hooks/useSeating'
import { COLORS, SEAT_DIM } from '../constants'
import { computeGridLayout } from '../logic/layout'
import { SeatGrid } from './SeatGrid'
import { RosterList } from './RosterList'

interface PrintAreaProps {
  api: SeatingApi
  titleText: string
  msgText: string
}

export function PrintArea({ api, titleText, msgText }: PrintAreaProps) {
  // 전체 크기(s=1) 그리드를 만든 뒤 A4에 맞게 transform scale
  const layout = computeGridLayout({
    mode: 'result',
    cols: api.cols,
    rows: api.rows,
    pair: api.pair,
    viewport: { vpW: 100000, vpH: 100000 },
    showRoster: api.showRoster,
    setupAvailW: null,
  })

  const chartW = api.cols * SEAT_DIM.resultW + (api.cols - 1) * 12
  const contentW = chartW + (api.showRoster ? 260 : 0) + (api.showRoster ? 44 : 0) + 40
  const contentH = api.rows * SEAT_DIM.resultH + api.rows * 12 + 210
  const scale = Math.min(1, 1003 / contentW, 660 / contentH)

  const chart = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 30, marginBottom: 24, textAlign: 'center' }}>{titleText}</div>
      <SeatGrid
        mode="result"
        cols={api.cols}
        rows={api.rows}
        pair={api.pair}
        layout={layout}
        inactive={api.inactive}
        arrangement={api.arrangement}
        fixed={api.fixed}
        students={api.students}
      />
      <div
        style={{
          width: 240,
          height: 38,
          background: COLORS.ink,
          color: '#fff',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          letterSpacing: 4,
          marginTop: 18,
        }}
      >
        교 탁
      </div>
      <div style={{ marginTop: 30, fontSize: 16, fontWeight: 500, color: '#3a342b', textAlign: 'center', maxWidth: chartW + 40 }}>
        {msgText}
      </div>
    </div>
  )

  return (
    <div
      className="pg-print"
      style={{
        display: 'none',
        position: 'fixed',
        inset: 0,
        background: '#fff',
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '297mm', height: '210mm', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 44,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {chart}
          {api.showRoster && (
            <div style={{ border: `1.5px solid ${COLORS.borderStrong}`, borderRadius: 16, padding: '20px 22px', minWidth: 230, alignSelf: 'flex-start' }}>
              <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 20, marginBottom: 14 }}>명렬표</div>
              <RosterList students={api.students} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
