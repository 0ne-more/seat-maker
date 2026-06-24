// 인접 금지(기피) 번호 검증·적용 규칙 — 순수 함수. 토스트/상태는 호출부(useSeating)가 담당한다.
import type { Student } from '../types'
import { MAX_AVOID } from '../constants'

export type AvoidReason = 'invalid' | 'self' | 'duplicate' | 'maxSelf' | 'maxTarget'
export type ValidateResult = { ok: true } | { ok: false; reason: AvoidReason }

/** 입력 문자열에서 번호 추출 (숫자 외 제거). 유효하지 않으면 null. */
export function parseAvoidInput(raw: string): number | null {
  const num = parseInt(String(raw).replace(/[^0-9]/g, ''), 10)
  return Number.isNaN(num) ? null : num
}

/** i번째 학생(0-based)에 기피 번호 num(1-based)을 추가할 수 있는지 검증 */
export function validateAvoid(students: readonly Student[], i: number, num: number): ValidateResult {
  const n = students.length
  if (!num || num < 1 || num > n) return { ok: false, reason: 'invalid' }
  if (num === i + 1) return { ok: false, reason: 'self' }
  if (students[i].avoid.includes(num)) return { ok: false, reason: 'duplicate' }
  if (students[i].avoid.length >= MAX_AVOID) return { ok: false, reason: 'maxSelf' }
  if (students[num - 1].avoid.length >= MAX_AVOID) return { ok: false, reason: 'maxTarget' }
  return { ok: true }
}

/** 기피쌍을 양방향으로 추가한 새 명단 반환 (불변). 검증 통과를 전제로 한다. */
export function applyAvoid(students: readonly Student[], i: number, num: number): Student[] {
  const next = students.map((s) => ({ ...s, avoid: [...s.avoid] }))
  next[i].avoid.push(num)
  if (!next[num - 1].avoid.includes(i + 1)) next[num - 1].avoid.push(i + 1)
  return next
}

/** 기피쌍을 양방향으로 제거한 새 명단 반환 (불변). num이 범위를 벗어나면 한쪽만 정리. */
export function removeAvoidPair(students: readonly Student[], i: number, num: number): Student[] {
  const next = students.map((s) => ({ ...s, avoid: [...s.avoid] }))
  next[i].avoid = next[i].avoid.filter((x) => x !== num)
  const j = num - 1
  if (j >= 0 && j < next.length) {
    next[j].avoid = next[j].avoid.filter((x) => x !== i + 1)
  }
  return next
}
