import { describe, expect, it } from 'vitest'
import type { SeatKey, Student } from '../types'
import { activeSeats } from './seats'
import { describeViolations, generateArrangement } from './generate'

function mk(name: string, avoid: number[] = []): Student {
  return { name, avoid }
}

// 배치 결과에서 학생 인덱스 → 좌석 맵 (null 제외)
function seatOf(arrangement: Record<SeatKey, number | null>): Map<number, SeatKey> {
  const m = new Map<number, SeatKey>()
  for (const [seat, idx] of Object.entries(arrangement)) {
    if (idx != null) m.set(idx, seat)
  }
  return m
}

describe('generateArrangement', () => {
  it('모든 학생을 정확히 하나의 좌석에 배치하고 중복 인덱스가 없다', () => {
    const seats = activeSeats(2, 3, new Set()) // 6좌석
    const students = [mk('A'), mk('B'), mk('C'), mk('D')]
    const { arrangement } = generateArrangement(seats, students)

    const placed = Object.values(arrangement).filter((v): v is number => v != null)
    // 4명이 모두 배치됨 (중복 없음)
    expect(new Set(placed).size).toBe(4)
    expect([...placed].sort()).toEqual([0, 1, 2, 3])
  })

  it('남는 좌석은 null로 채운다', () => {
    const seats = activeSeats(2, 3, new Set()) // 6좌석
    const students = [mk('A'), mk('B')]
    const { arrangement } = generateArrangement(seats, students)

    const empties = Object.values(arrangement).filter((v) => v == null)
    expect(empties.length).toBe(4) // 6 - 2
  })

  it('fixedAssign은 결과에 그대로 유지된다', () => {
    const seats = activeSeats(2, 3, new Set())
    const students = [mk('A'), mk('B'), mk('C')]
    const fixed = { '0-0': 2 } // C(idx2)를 0-0에 고정
    const { arrangement } = generateArrangement(seats, students, fixed)

    expect(arrangement['0-0']).toBe(2)
    // 나머지 학생은 다른 좌석에 배치
    const map = seatOf(arrangement)
    expect(map.get(0)).not.toBe('0-0')
    expect(map.get(1)).not.toBe('0-0')
  })

  it('제약이 없으면 위반 수가 0이다', () => {
    const seats = activeSeats(3, 3, new Set())
    const students = [mk('A'), mk('B'), mk('C'), mk('D')]
    const { violationCount } = generateArrangement(seats, students)
    expect(violationCount).toBe(0)
  })

  it('만족 불가능한 제약(인접 2좌석에 상호 기피 2명)에서는 위반이 남지만 결과를 반환한다', () => {
    const seats = activeSeats(1, 2, new Set()) // "0-0","0-1" — 항상 인접
    const students = [mk('A', [2]), mk('B', [1])] // 상호 기피
    const { arrangement, violationCount } = generateArrangement(seats, students)

    expect(violationCount).toBeGreaterThan(0)
    // 그래도 두 학생 모두 배치되어 있다 (best 반환)
    const placed = Object.values(arrangement).filter((v) => v != null)
    expect(placed.length).toBe(2)
  })

  it('배치할 자유 학생/좌석이 없으면 fixedAssign을 그대로 반환한다 (방어 분기)', () => {
    const seats = activeSeats(1, 1, new Set()) // "0-0"
    const students = [mk('A')]
    const fixed = { '0-0': 0 }
    const { arrangement, violationCount } = generateArrangement(seats, students, fixed)

    expect(arrangement).toEqual({ '0-0': 0 })
    expect(violationCount).toBe(0)
  })
})

describe('describeViolations', () => {
  it('위반쌍을 "이름↔이름" 문자열로 변환한다', () => {
    const students = [mk('철수', [2]), mk('영희', [1])]
    const arrangement = { '0-0': 0, '0-1': 1 } // 인접 위반
    expect(describeViolations(arrangement, students)).toEqual(['철수↔영희'])
  })

  it('위반이 없으면 빈 배열을 반환한다', () => {
    const students = [mk('철수', [2]), mk('영희', [1])]
    const arrangement = { '0-0': 0, '0-2': 1 } // 떨어짐
    expect(describeViolations(arrangement, students)).toEqual([])
  })
})
