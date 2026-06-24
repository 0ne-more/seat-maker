// 교실 그리드 구성 상태 — 짝꿍 모드, 가로/세로 크기, 비활성 좌석.
import { useState } from 'react'
import type { SeatKey } from '../types'
import { GRID_MAX, GRID_MIN } from '../constants'
import type { SeatingSnapshot } from '../persistence/schema'

export interface GridConfigApi {
  readonly pair: boolean
  readonly cols: number
  readonly rows: number
  readonly inactive: ReadonlySet<SeatKey>
  readonly togglePair: () => void
  readonly incCols: () => void
  readonly decCols: () => void
  readonly incRows: () => void
  readonly decRows: () => void
  readonly toggleSeat: (k: SeatKey) => void
}

export function useGridConfig(restored: SeatingSnapshot | null): GridConfigApi {
  const [pair, setPair] = useState(restored?.pair ?? false)
  const [cols, setCols] = useState(restored?.cols ?? 6)
  const [rows, setRows] = useState(restored?.rows ?? 5)
  const [inactive, setInactive] = useState<ReadonlySet<SeatKey>>(restored?.inactive ?? new Set())

  function toggleSeat(k: SeatKey) {
    const s = new Set(inactive)
    s.has(k) ? s.delete(k) : s.add(k)
    setInactive(s)
  }

  return {
    pair,
    cols,
    rows,
    inactive,
    togglePair: () => setPair((p) => !p),
    incCols: () => setCols((c) => Math.min(GRID_MAX, c + 1)),
    decCols: () => setCols((c) => Math.max(GRID_MIN, c - 1)),
    incRows: () => setRows((r) => Math.min(GRID_MAX, r + 1)),
    decRows: () => setRows((r) => Math.max(GRID_MIN, r - 1)),
    toggleSeat,
  }
}
