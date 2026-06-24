// 좌석 좌표 / 인접 판정 유틸 — PRD 5장 "인접(8방향)" 정의 기준
import type { RowCol, SeatKey } from '../types'

/** "행-열" 문자열로 좌석 키 생성 */
export function seatKey(r: number, c: number): SeatKey {
  return `${r}-${c}`
}

/** 좌석 키를 행/열로 분해 */
export function parseSeat(k: SeatKey): RowCol {
  const [r, c] = k.split('-').map(Number)
  return { r, c }
}

/** 활성 좌석 키 목록 (비활성 좌석 제외) */
export function activeSeats(rows: number, cols: number, inactive: ReadonlySet<SeatKey>): SeatKey[] {
  const out: SeatKey[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = seatKey(r, c)
      if (!inactive.has(k)) out.push(k)
    }
  }
  return out
}

/** 물리적 8방향 인접 여부 (체비쇼프 거리 == 1) */
export function neighborsAdjacent(k1: SeatKey, k2: SeatKey): boolean {
  const a = parseSeat(k1)
  const b = parseSeat(k2)
  return Math.max(Math.abs(a.r - b.r), Math.abs(a.c - b.c)) === 1
}
