// 배치 결과 페이지 — 자리표 확인/고정/드래그 수정/다시 배치/편집/다운로드
import { useRef } from 'react'
import type { SeatingApi } from '../hooks/useSeating'
import type { Viewport } from '../logic/layout'
import { COLORS } from '../constants'
import { computeGridLayout } from '../logic/layout'
import { SeatGrid } from './SeatGrid'
import { RosterList } from './RosterList'
import { EditableText, type EditableHandle } from './EditableText'
import { PrintArea } from './PrintArea'

export function ResultPage({ api, viewport }: { api: SeatingApi; viewport: Viewport }) {
  const titleRef = useRef<EditableHandle>(null)
  const msgRef = useRef<EditableHandle>(null)

  const layout = computeGridLayout({
    mode: 'result',
    cols: api.cols,
    rows: api.rows,
    pair: api.pair,
    viewport,
    showRoster: api.showRoster,
    setupAvailW: null,
  })

  // 편집한 제목/멘트를 상태에 반영한 뒤 인쇄
  const download = () => {
    const title = titleRef.current?.getText() ?? api.titleText
    const msg = msgRef.current?.getText() ?? api.msgText
    api.setTitle(title)
    api.setMsg(msg)
    setTimeout(() => window.print(), 60)
  }

  return (
    <>
      <div className="pg-app">
        <div style={{ maxWidth: 1340, margin: '0 auto', padding: '22px 40px 60px' }}>
          {/* 상단 바 */}
          <div data-noprint="1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div onClick={api.goBack} style={{ fontWeight: 500, fontSize: 14, color: COLORS.subText, cursor: 'pointer', padding: '8px 4px' }}>
              ← 이전 페이지로
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div onClick={api.toggleRoster} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>명렬표</span>
                <div style={{ width: 50, height: 28, background: api.showRoster ? COLORS.green : '#E1DBCC', borderRadius: 999, position: 'relative', transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: api.showRoster ? 25 : 3, width: 22, height: 22, background: '#fff', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
                </div>
              </div>
              <div
                onClick={api.regenerate}
                style={{ background: '#fff', color: COLORS.ink, fontWeight: 700, fontSize: 14.5, padding: '12px 22px', borderRadius: 999, border: `1.5px solid ${COLORS.borderStrong}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
              >
                ↻ 다시 배치
              </div>
              <div
                onClick={download}
                style={{ background: COLORS.ink, color: '#fff', fontWeight: 700, fontSize: 14.5, padding: '12px 24px', borderRadius: 999, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
              >
                ↓ 다운로드
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 26, alignItems: 'flex-start', justifyContent: 'center' }}>
            {/* 자리표 카드 */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: '30px 34px', flex: '0 1 auto' }}>
              <EditableText
                ref={titleRef}
                initial={api.titleText}
                title="클릭해서 제목 수정"
                style={{ fontFamily: "'Jua', sans-serif", fontSize: 26, textAlign: 'center', marginBottom: 4, padding: '2px 12px', minWidth: 260 }}
              />
              <div data-noprint="1" style={{ fontSize: 11, color: '#C2B9A6', textAlign: 'center', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <span style={{ fontSize: 11 }}>✎</span> 제목을 클릭하면 수정할 수 있어요
              </div>
              <div data-noprint="1" style={{ fontSize: 11.5, color: COLORS.muteSoft, textAlign: 'center', marginBottom: 22 }}>
                자리를 클릭하면 고정(노란 테두리) · 드래그해서 두 학생 자리를 맞바꿔요
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
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
                  onToggleFixed={api.toggleFixed}
                  onDragStart={api.setDragFrom}
                  onDrop={api.dropSeat}
                />
                <div style={{ width: 230, height: 36, background: COLORS.ink, color: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, letterSpacing: 4, marginTop: 6 }}>
                  교 탁
                </div>
              </div>
              <EditableText
                ref={msgRef}
                initial={api.msgText}
                title="클릭해서 안내 문구 수정"
                style={{ textAlign: 'center', fontSize: 15, color: '#3a342b', marginTop: 26, padding: '6px 14px', fontWeight: 500 }}
              />
              <div data-noprint="1" style={{ fontSize: 11, color: '#C2B9A6', textAlign: 'center', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <span style={{ fontSize: 11 }}>✎</span> 하단 문구를 클릭하면 수정할 수 있어요
              </div>
            </div>

            {/* 명렬표 */}
            {api.showRoster && (
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: '24px 26px', width: 230, flex: '0 0 auto' }}>
                <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 18, marginBottom: 14 }}>명렬표</div>
                <RosterList students={api.students} />
              </div>
            )}
          </div>

          <div data-noprint="1" style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#D6452A', fontWeight: 500 }}>{api.resultWarn}</div>
        </div>
      </div>

      <PrintArea api={api} titleText={api.titleText} msgText={api.msgText} />
    </>
  )
}
