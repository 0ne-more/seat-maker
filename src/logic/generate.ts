// 제약 기반 자리 배치 휴리스틱 — PRD 8장 (랜덤 + 위반 스왑 + 재시작)
import type { Arrangement, SeatKey, Student } from '../types'
import { GENERATE_ATTEMPTS, LOCAL_SEARCH_ITER } from '../constants'
import { violations } from './avoid'

export interface GenerateResult {
  /** seatKey -> 학생 인덱스 (null 가능: 빈자리) */
  readonly arrangement: Record<SeatKey, number | null>
  /** 남은 위반 수 (0이면 모든 제약 만족) */
  readonly violationCount: number
}

/** Fisher-Yates 셔플 (원본 불변) */
function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function countViolations(assign: Record<SeatKey, number | null>, students: readonly Student[]): number {
  return violations(assign as Arrangement, students).length
}

/**
 * 활성 좌석에 학생을 배치한다.
 * @param seats     활성 좌석 키 목록
 * @param students  학생 목록
 * @param fixedAssign 고정석(seatKey -> 학생 인덱스). 절대 이동하지 않음
 */
export function generateArrangement(
  seats: readonly SeatKey[],
  students: readonly Student[],
  fixedAssign: Readonly<Record<SeatKey, number>> = {},
): GenerateResult {
  const n = students.length
  const usedSeats = new Set(Object.keys(fixedAssign))
  const usedStudents = new Set(Object.values(fixedAssign))
  const freeSeats = seats.filter((s) => !usedSeats.has(s))
  const freeStudents: number[] = []
  for (let i = 0; i < n; i++) if (!usedStudents.has(i)) freeStudents.push(i)

  let best: { assign: Record<SeatKey, number | null>; cnt: number } | null = null

  for (let attempt = 0; attempt < GENERATE_ATTEMPTS; attempt++) {
    const ss = shuffle(freeStudents)
    const assign: Record<SeatKey, number | null> = { ...fixedAssign }
    freeSeats.forEach((seat, idx) => {
      assign[seat] = idx < ss.length ? ss[idx] : null
    })

    // 지역 탐색: 위반 당사자를 다른 학생과 스왑해 위반 해소 시도
    for (let it = 0; it < LOCAL_SEARCH_ITER; it++) {
      const v = violations(assign as Arrangement, students)
      if (v.length === 0) break
      const [sa] = v[(Math.random() * v.length) | 0]
      // 고정석은 옮길 수 없으므로 free 좌석만 후보
      const cands = shuffle(freeSeats.filter((s) => s !== sa))
      const before = countViolations(assign, students)
      let improved = false
      for (const st of cands) {
        const tmp = assign[sa]
        assign[sa] = assign[st]
        assign[st] = tmp
        if (countViolations(assign, students) < before) {
          improved = true
          break
        }
        // 되돌리기
        const t2 = assign[sa]
        assign[sa] = assign[st]
        assign[st] = t2
      }
      // 개선 못 했으면 무작위 흔들기(데드락 탈출)
      if (!improved && cands.length) {
        const st = cands[0]
        const tmp = assign[sa]
        assign[sa] = assign[st]
        assign[st] = tmp
      }
    }

    const cnt = countViolations(assign, students)
    if (best === null || cnt < best.cnt) {
      best = { assign: { ...assign }, cnt }
    }
    if (cnt === 0) break
  }

  // freeStudents/freeSeats가 비어 best가 만들어지지 않은 경우 방어
  const resolved = best ?? { assign: { ...fixedAssign }, cnt: 0 }
  return { arrangement: resolved.assign, violationCount: resolved.cnt }
}

/** 위반 쌍을 "이름↔이름" 문자열로 변환 (경고 메시지용) */
export function describeViolations(
  arrangement: Record<SeatKey, number | null>,
  students: readonly Student[],
): string[] {
  return violations(arrangement as Arrangement, students).map(([a, b]) => {
    const sa = arrangement[a]
    const sb = arrangement[b]
    const na = sa != null ? students[sa].name : '?'
    const nb = sb != null ? students[sb].name : '?'
    return `${na}↔${nb}`
  })
}
