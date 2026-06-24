import { describe, expect, it } from 'vitest'
import { parseRoster, type TextItem } from './parseRoster'

// 테스트용 텍스트 조각 헬퍼 — (문자열, x, y, page) 순. page 기본 1.
function item(str: string, x: number, y: number, page = 1): TextItem {
  return { str, x, y, page }
}

// 추출 결과를 {번호:이름} 비교용으로 단순화
function asPairs(items: TextItem[]) {
  return parseRoster(items).students.map((s) => [s.number, s.name] as const)
}

describe('parseRoster - 표형 명단 (행마다 번호|이름)', () => {
  it('헤더 행을 무시하고 번호·이름을 추출한다', () => {
    const items = [
      // 헤더 (y=100)
      item('번호', 10, 100),
      item('이름', 50, 100),
      // 데이터 행들 (y 내림차순 = 위에서 아래)
      item('1', 10, 80),
      item('홍길동', 50, 80),
      item('2', 10, 60),
      item('김철수', 50, 60),
    ]
    expect(asPairs(items)).toEqual([
      [1, '홍길동'],
      [2, '김철수'],
    ])
  })

  it('No./Name 영문 헤더와 영문 이름도 처리한다', () => {
    const items = [
      item('No.', 10, 100),
      item('Name', 50, 100),
      item('1', 10, 80),
      item('John', 50, 80),
    ]
    expect(asPairs(items)).toEqual([[1, 'John']])
  })
})

describe('parseRoster - 자리표형 (한 행에 여러 셀)', () => {
  it('한 행에 흩어진 여러 번호·이름 쌍을 모두 매칭한다', () => {
    const items = [
      item('1', 10, 100),
      item('홍길동', 40, 100),
      item('2', 100, 100),
      item('김철수', 140, 100),
      item('3', 10, 50),
      item('이영희', 40, 50),
    ]
    expect(asPairs(items)).toEqual([
      [1, '홍길동'],
      [2, '김철수'],
      [3, '이영희'],
    ])
  })

  it('번호 위·이름 아래로 세로 배치된 셀(자리표)을 매칭한다', () => {
    // "1번"이 위, "홍길동"이 같은 x의 아래 — 4칸 그리드
    const items = [
      item('1번', 70, 700),
      item('홍길동', 70, 678),
      item('2번', 200, 700),
      item('김철수', 200, 678),
      item('3번', 70, 610),
      item('이영희', 70, 588),
    ]
    expect(asPairs(items)).toEqual([
      [1, '홍길동'],
      [2, '김철수'],
      [3, '이영희'],
    ])
  })

  it('y 좌표가 미세하게 다른 같은 행 조각을 한 행으로 묶는다', () => {
    const items = [
      item('1', 10, 100),
      item('홍길동', 40, 98.5), // 허용오차(3pt) 내
      item('2', 100, 101),
      item('김철수', 140, 99),
    ]
    expect(asPairs(items)).toEqual([
      [1, '홍길동'],
      [2, '김철수'],
    ])
  })
})

describe('parseRoster - 토큰 정규화', () => {
  it('"1 홍길동"처럼 한 조각에 붙은 번호+이름을 분리한다', () => {
    const items = [item('1 홍길동', 10, 100), item('2 김철수', 10, 80)]
    expect(asPairs(items)).toEqual([
      [1, '홍길동'],
      [2, '김철수'],
    ])
  })

  it('"12번"처럼 번호에 붙은 "번" 접미사를 처리한다', () => {
    const items = [item('12번', 10, 100), item('홍길동', 50, 100)]
    expect(asPairs(items)).toEqual([[12, '홍길동']])
  })
})

describe('parseRoster - 엣지 케이스', () => {
  it('번호만 있고 이름이 없는 행은 제외한다', () => {
    const items = [item('5', 10, 100), item('1', 10, 80), item('홍길동', 50, 80)]
    expect(asPairs(items)).toEqual([[1, '홍길동']])
  })

  it('이름만 있고 번호가 없는 행은 제외한다', () => {
    const items = [item('홍길동', 10, 100), item('1', 10, 80), item('김철수', 50, 80)]
    expect(asPairs(items)).toEqual([[1, '김철수']])
  })

  it('중복 번호는 문서 순서상 먼저 나온 항목을 유지한다', () => {
    const items = [
      item('1', 10, 100),
      item('홍길동', 50, 100),
      item('1', 10, 80),
      item('김철수', 50, 80),
    ]
    expect(asPairs(items)).toEqual([[1, '홍길동']])
  })

  it('빈 입력은 빈 결과와 low 신뢰도를 반환한다', () => {
    const result = parseRoster([])
    expect(result.students).toEqual([])
    expect(result.confidence).toBe('low')
  })

  it('번호 범위(1~99)를 벗어난 값은 번호로 보지 않는다', () => {
    // 0, 100은 번호 아님 → 그 뒤 이름과 페어링되지 않음
    const items = [
      item('0', 10, 100),
      item('영점', 50, 100),
      item('100', 10, 80),
      item('백점', 50, 80),
      item('99', 10, 60),
      item('구구', 50, 60),
    ]
    expect(asPairs(items)).toEqual([[99, '구구']])
  })

  it('페이지가 다르면 같은 행으로 묶지 않는다', () => {
    const items = [
      item('1', 10, 100, 1),
      item('홍길동', 40, 100, 1),
      item('2', 10, 100, 2), // 같은 y지만 다른 페이지
      item('김철수', 40, 100, 2),
    ]
    expect(asPairs(items)).toEqual([
      [1, '홍길동'],
      [2, '김철수'],
    ])
  })
})

describe('parseRoster - 신뢰도', () => {
  it('번호가 연속적이고 이름이 정상이면 high', () => {
    const items = [
      item('1 홍길동', 10, 100),
      item('2 김철수', 10, 80),
      item('3 이영희', 10, 60),
      item('4 박민수', 10, 40),
    ]
    expect(parseRoster(items).confidence).toBe('high')
  })

  it('추출 수가 적으면(3 미만) low', () => {
    const items = [item('1 홍길동', 10, 100), item('2 김철수', 10, 80)]
    expect(parseRoster(items).confidence).toBe('low')
  })

  it('번호가 띄엄띄엄하면 low', () => {
    const items = [
      item('1 홍길동', 10, 100),
      item('50 김철수', 10, 80),
      item('99 이영희', 10, 60),
    ]
    expect(parseRoster(items).confidence).toBe('low')
  })
})
