import { describe, expect, it } from 'vitest'
import type { Student } from '../types'
import { MAX_AVOID } from '../constants'
import { applyAvoid, parseAvoidInput, removeAvoidPair, validateAvoid } from './avoidRules'

function mk(name: string, avoid: number[] = []): Student {
  return { id: `id-${name}`, name, avoid }
}

describe('parseAvoidInput', () => {
  it('숫자 문자열을 정수로 변환한다', () => {
    expect(parseAvoidInput('3')).toBe(3)
    expect(parseAvoidInput('12번')).toBe(12)
  })

  it('숫자가 없으면 null', () => {
    expect(parseAvoidInput('')).toBeNull()
    expect(parseAvoidInput('abc')).toBeNull()
  })
})

describe('validateAvoid', () => {
  const students = [mk('A'), mk('B'), mk('C')]

  it('정상 번호는 ok', () => {
    expect(validateAvoid(students, 0, 2)).toEqual({ ok: true })
  })

  it('범위 밖 번호는 invalid', () => {
    expect(validateAvoid(students, 0, 0)).toEqual({ ok: false, reason: 'invalid' })
    expect(validateAvoid(students, 0, 99)).toEqual({ ok: false, reason: 'invalid' })
  })

  it('자기 자신은 self', () => {
    expect(validateAvoid(students, 0, 1)).toEqual({ ok: false, reason: 'self' })
  })

  it('이미 등록된 번호는 duplicate', () => {
    const s = [mk('A', [2]), mk('B', [1]), mk('C')]
    expect(validateAvoid(s, 0, 2)).toEqual({ ok: false, reason: 'duplicate' })
  })

  it('자신의 기피가 가득 차면 maxSelf', () => {
    const full = Array.from({ length: MAX_AVOID }, (_, k) => k + 3) // 3..(MAX+2)
    const s = [mk('A', full), ...Array.from({ length: MAX_AVOID + 2 }, (_, k) => mk(`S${k}`))]
    expect(validateAvoid(s, 0, 2)).toEqual({ ok: false, reason: 'maxSelf' })
  })

  it('상대의 기피가 가득 차면 maxTarget', () => {
    const full = Array.from({ length: MAX_AVOID }, (_, k) => k + 3)
    // 2번(idx1)의 기피가 가득 참
    const s = [mk('A'), mk('B', full), ...Array.from({ length: MAX_AVOID + 2 }, (_, k) => mk(`S${k}`))]
    expect(validateAvoid(s, 0, 2)).toEqual({ ok: false, reason: 'maxTarget' })
  })
})

describe('applyAvoid', () => {
  it('양방향으로 기피를 등록한다 (불변)', () => {
    const students = [mk('A'), mk('B')]
    const next = applyAvoid(students, 0, 2)
    expect(next[0].avoid).toEqual([2])
    expect(next[1].avoid).toEqual([1])
    // 원본 불변
    expect(students[0].avoid).toEqual([])
  })

  it('id를 보존한다', () => {
    const students = [mk('A'), mk('B')]
    const next = applyAvoid(students, 0, 2)
    expect(next[0].id).toBe('id-A')
    expect(next[1].id).toBe('id-B')
  })
})

describe('removeAvoidPair', () => {
  it('양방향으로 기피를 제거한다 (불변)', () => {
    const students = [mk('A', [2]), mk('B', [1])]
    const next = removeAvoidPair(students, 0, 2)
    expect(next[0].avoid).toEqual([])
    expect(next[1].avoid).toEqual([])
    expect(students[0].avoid).toEqual([2]) // 원본 불변
  })

  it('num이 범위를 벗어나도 i쪽만 정리하고 throw하지 않는다 (바운드 가드)', () => {
    const students = [mk('A', [99])]
    expect(() => removeAvoidPair(students, 0, 99)).not.toThrow()
    const next = removeAvoidPair(students, 0, 99)
    expect(next[0].avoid).toEqual([])
  })
})
