// 좌석 그리드 — 설정/결과 공용. 짝꿍 모드 트레이, 고정/드래그 처리
import type { CSSProperties } from 'react'
import type { GridMode, SeatKey, Student } from '../types'
import type { GridLayout } from '../logic/layout'
import { COLORS } from '../constants'
import { seatKey } from '../logic/seats'

interface SeatGridProps {
  mode: GridMode
  cols: number
  rows: number
  pair: boolean
  layout: GridLayout
  inactive: ReadonlySet<SeatKey>
  arrangement: Record<SeatKey, number | null>
  fixed: ReadonlySet<SeatKey>
  students: readonly Student[]
  onToggleSeat?: (k: SeatKey) => void
  onToggleFixed?: (k: SeatKey) => void
  onDragStart?: (k: SeatKey) => void
  onDrop?: (k: SeatKey) => void
}

export function SeatGrid(props: SeatGridProps) {
  const { mode, cols, rows, pair, layout: L, inactive } = props
  const isResult = mode === 'result'

  const cellBase = (): CSSProperties => ({
    width: L.W,
    height: L.H,
    borderRadius: L.rad,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform .12s, box-shadow .12s',
  })

  function renderCell(r: number, c: number) {
    const k = seatKey(r, c)
    const isInactive = inactive.has(k)

    // ---- 설정 모드: 사용/미사용 토글 ----
    if (!isResult) {
      const style: CSSProperties = isInactive
        ? { ...cellBase(), background: '#2A2620', cursor: 'pointer' }
        : { ...cellBase(), background: '#fff', border: `1.5px solid ${COLORS.borderStrong}`, cursor: 'pointer' }
      return (
        <div key={k} style={style} onClick={() => props.onToggleSeat?.(k)}>
          {isInactive ? null : (
            <div style={{ width: L.fDot, height: L.fDot, borderRadius: '50%', background: '#EFE9DA' }} />
          )}
        </div>
      )
    }

    // ---- 결과 모드 ----
    if (isInactive) {
      return <div key={k} style={{ ...cellBase(), background: 'transparent' }} />
    }
    const sIdx = props.arrangement[k]
    const isFixed = props.fixed.has(k)
    let style: CSSProperties = { ...cellBase(), background: '#fff', border: `1.5px solid ${COLORS.borderStrong}`, cursor: 'pointer' }
    if (isFixed) {
      style = { ...cellBase(), background: '#FFFBEC', border: `2.5px solid ${COLORS.yellow}`, cursor: 'pointer' }
    }
    if (sIdx == null) {
      style = { ...cellBase(), background: COLORS.bgCream, border: `1.5px dashed ${COLORS.borderStrong}` }
    }
    return (
      <div
        key={k}
        style={style}
        draggable={sIdx != null}
        onClick={() => {
          if (sIdx != null) props.onToggleFixed?.(k)
        }}
        onDragStart={() => props.onDragStart?.(k)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => props.onDrop?.(k)}
      >
        {sIdx == null ? (
          <div style={{ fontSize: Math.max(9, Math.round(12 * L.s)), color: COLORS.muteSoft }}>빈자리</div>
        ) : (
          <>
            <div style={{ fontSize: L.fNum, color: isFixed ? '#B79100' : COLORS.mute, lineHeight: 1 }}>{sIdx + 1}</div>
            <div style={{ fontWeight: 700, fontSize: L.fName, marginTop: L.numGap }}>{props.students[sIdx].name}</div>
          </>
        )}
      </div>
    )
  }

  const rowEls = []
  for (let r = 0; r < rows; r++) {
    if (pair) {
      // 짝꿍석: 두 자리를 옅은 트레이로 묶음
      const wraps = []
      for (let c = 0; c < cols; c += 2) {
        const cells = [renderCell(r, c)]
        if (c + 1 < cols) cells.push(renderCell(r, c + 1))
        const solo = cells.length === 1
        wraps.push(
          <div
            key={`w${r}-${c}`}
            style={{
              display: 'flex',
              gap: L.within,
              background: solo ? 'transparent' : '#EBE3D1',
              borderRadius: L.rad + L.pad,
              padding: L.pad,
              boxSizing: 'border-box',
            }}
          >
            {cells}
          </div>,
        )
      }
      rowEls.push(
        <div key={`r${r}`} style={{ display: 'flex', gap: L.between, marginBottom: L.gap, alignItems: 'center' }}>
          {wraps}
        </div>,
      )
    } else {
      const cells = []
      for (let c = 0; c < cols; c++) cells.push(renderCell(r, c))
      rowEls.push(
        <div key={`r${r}`} style={{ display: 'flex', gap: L.gap, marginBottom: L.gap }}>
          {cells}
        </div>,
      )
    }
  }

  return <div style={{ display: 'inline-flex', flexDirection: 'column' }}>{rowEls}</div>
}
