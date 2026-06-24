import { describe, expect, it } from 'vitest'
import type { Arrangement, Student } from '../types'
import { avoidPairs, violations } from './avoid'

// 테스트용 학생 생성 헬퍼 — 도메인 모델 변경 시 이 한 곳만 수정하면 된다.
function mk(name: string, avoid: number[] = []): Student {
  return { name, avoid }
}

describe('avoidPairs', () => {
  it('양방향으로 등록된 기피쌍을 하나로 정규화한다 (i<j)', () => {
    // 1번(idx 0)이 2번을, 2번(idx 1)이 1번을 기피 → [0,1] 하나
    const students = [mk('A', [2]), mk('B', [1])]
    expect(avoidPairs(students)).toEqual([[0, 1]])
  })

  it('자기 자신을 기피하는 번호는 제외한다', () => {
    // 1번(idx 0)이 자기 번호 1을 가리킴 → j===i → 제외
    const students = [mk('A', [1]), mk('B')]
    expect(avoidPairs(students)).toEqual([])
  })

  it('범위를 벗어난 번호는 제외한다', () => {
    // 길이 2인데 5번 기피(idx 4 >= 2) → 제외
    const students = [mk('A', [5]), mk('B')]
    expect(avoidPairs(students)).toEqual([])
  })

  it('avoid가 undefined여도 방어한다 (?? [])', () => {
    const students = [{ name: 'A' } as unknown as Student, mk('B')]
    expect(avoidPairs(students)).toEqual([])
  })

  it('여러 기피를 모두 추출한다', () => {
    const students = [mk('A', [2, 3]), mk('B'), mk('C')]
    expect(avoidPairs(students)).toEqual([
      [0, 1],
      [0, 2],
    ])
  })
})

describe('violations', () => {
  const students = [mk('A', [2]), mk('B', [1]), mk('C')]

  it('인접한 기피쌍만 위반으로 검출한다', () => {
    // A(idx0) "0-0", B(idx1) "0-1" → 인접 → 위반
    const assign = { '0-0': 0, '0-1': 1 }
    expect(violations(assign, students)).toEqual([['0-0', '0-1']])
  })

  it('떨어져 있는 기피쌍은 위반이 아니다', () => {
    // A "0-0", B "0-2" → 거리 2 → 위반 아님
    const assign = { '0-0': 0, '0-2': 1 }
    expect(violations(assign, students)).toEqual([])
  })

  it('한쪽만 배치된 기피쌍은 위반이 아니다', () => {
    const assign = { '0-0': 0 }
    expect(violations(assign, students)).toEqual([])
  })

  it('빈 좌석(null)은 위반 판정에서 무시한다', () => {
    // 실제 호출부(useSeating)와 동일하게 number|null 배치를 Arrangement로 캐스팅해 넘긴다
    const assign = { '0-0': 0, '0-1': null } as unknown as Arrangement
    expect(violations(assign, students)).toEqual([])
  })
})
