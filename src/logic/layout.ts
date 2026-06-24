// 그리드 스케일링 기하 — 가로/세로가 커져도 카드 비율 유지, 자리 크기만 축소
import type { GridMode } from '../types'
import { SEAT_DIM } from '../constants'

export interface Viewport {
  readonly vpW: number
  readonly vpH: number
}

export interface GridLayout {
  readonly W: number
  readonly H: number
  readonly gap: number
  readonly within: number
  readonly between: number
  readonly pad: number
  readonly rad: number
  readonly fName: number
  readonly fNum: number
  readonly fDot: number
  /** 빈자리/스케일 의존 보조 폰트 */
  readonly fEmpty: number
  readonly numGap: number
  /** 스케일 팩터(0~1) */
  readonly s: number
}

interface LayoutParams {
  readonly mode: GridMode
  readonly cols: number
  readonly rows: number
  readonly pair: boolean
  readonly viewport: Viewport
  readonly showRoster: boolean
  /** 설정 페이지 그리드 박스 가용 너비(측정값) */
  readonly setupAvailW: number | null
}

export function computeGridLayout(p: LayoutParams): GridLayout {
  const { mode, cols, rows, pair, viewport, showRoster, setupAvailW } = p
  const isResult = mode === 'result'
  const baseW = isResult ? SEAT_DIM.resultW : SEAT_DIM.setupW
  const baseH = isResult ? SEAT_DIM.resultH : SEAT_DIM.setupH

  const baseGap = 12
  const baseWithin = 7
  const baseBetween = 22
  const basePad = 6
  const pairsPerRow = Math.ceil(cols / 2)

  const contentW = pair
    ? cols * baseW + Math.floor(cols / 2) * baseWithin + (pairsPerRow - 1) * baseBetween + pairsPerRow * 2 * basePad
    : cols * baseW + (cols - 1) * baseGap
  const contentH = rows * baseH + (rows - 1) * baseGap + (pair ? 2 * basePad : 0)

  const vh = viewport.vpH || 720
  const vw = viewport.vpW || 1200
  const availW = isResult
    ? Math.max(320, vw - (showRoster ? 620 : 380))
    : setupAvailW ?? 620
  const availH = isResult ? Math.max(300, vh - 300) : Math.max(260, vh - 360)

  const s = Math.min(1, availW / contentW, availH / contentH)

  return {
    s,
    W: Math.round(baseW * s),
    H: Math.round(baseH * s),
    gap: Math.max(3, Math.round(baseGap * s)),
    within: Math.max(3, Math.round(baseWithin * s)),
    between: Math.max(8, Math.round(baseBetween * s)),
    pad: Math.max(3, Math.round(basePad * s)),
    rad: Math.max(8, Math.round(16 * s)),
    fName: Math.max(10, Math.round(15.5 * s)),
    fNum: Math.max(8, Math.round(11 * s)),
    fDot: Math.max(4, Math.round(8 * s)),
    fEmpty: Math.max(9, Math.round(12 * s)),
    numGap: Math.round(3 * s),
  }
}
