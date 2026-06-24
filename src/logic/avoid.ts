// 기피(인접 금지) 조합 처리 — 양방향, 위반 검사
import type { Arrangement, SeatKey, Student } from '../types'
import { neighborsAdjacent } from './seats'

/** 학생 목록에서 고유한 기피쌍 [i, j] (i<j, 0-based) 추출 */
export function avoidPairs(students: readonly Student[]): Array<[number, number]> {
  const seen = new Set<string>()
  const out: Array<[number, number]> = []
  students.forEach((s, i) => {
    for (const num of s.avoid ?? []) {
      const j = num - 1
      if (j < 0 || j >= students.length || j === i) continue
      const lo = Math.min(i, j)
      const hi = Math.max(i, j)
      const key = `${lo}_${hi}`
      if (!seen.has(key)) {
        seen.add(key)
        out.push([lo, hi])
      }
    }
  })
  return out
}

/** 배치에서 인접 금지 위반(서로 붙어 있는 기피쌍) 좌석쌍 목록 반환 */
export function violations(
  assign: Arrangement,
  students: readonly Student[],
): Array<[SeatKey, SeatKey]> {
  const seatOf: Record<number, SeatKey> = {}
  for (const k of Object.keys(assign)) {
    const idx = assign[k]
    if (idx != null) seatOf[idx] = k
  }
  const out: Array<[SeatKey, SeatKey]> = []
  for (const [i, j] of avoidPairs(students)) {
    const sa = seatOf[i]
    const sb = seatOf[j]
    if (sa && sb && neighborsAdjacent(sa, sb)) out.push([sa, sb])
  }
  return out
}
