import { describe, expect, it } from 'vitest'
import { activeSeats, neighborsAdjacent, parseSeat, seatKey } from './seats'

describe('seatKey / parseSeat', () => {
  it('"행-열" 포맷으로 키를 만든다', () => {
    expect(seatKey(2, 3)).toBe('2-3')
    expect(seatKey(0, 0)).toBe('0-0')
  })

  it('parseSeat는 seatKey의 역변환이다 (라운드트립)', () => {
    expect(parseSeat('2-3')).toEqual({ r: 2, c: 3 })
    expect(parseSeat(seatKey(5, 7))).toEqual({ r: 5, c: 7 })
  })
})

describe('activeSeats', () => {
  it('비활성 좌석이 없으면 rows*cols개를 행 우선 순서로 반환한다', () => {
    const seats = activeSeats(2, 3, new Set())
    expect(seats).toEqual(['0-0', '0-1', '0-2', '1-0', '1-1', '1-2'])
  })

  it('비활성 좌석을 제외한다', () => {
    const seats = activeSeats(2, 2, new Set(['0-1', '1-0']))
    expect(seats).toEqual(['0-0', '1-1'])
  })

  it('모든 좌석이 비활성이면 빈 배열을 반환한다', () => {
    const seats = activeSeats(1, 2, new Set(['0-0', '0-1']))
    expect(seats).toEqual([])
  })
})

describe('neighborsAdjacent (8방향, 체비쇼프 거리 == 1)', () => {
  it('상하좌우는 인접이다', () => {
    expect(neighborsAdjacent('1-1', '0-1')).toBe(true)
    expect(neighborsAdjacent('1-1', '2-1')).toBe(true)
    expect(neighborsAdjacent('1-1', '1-0')).toBe(true)
    expect(neighborsAdjacent('1-1', '1-2')).toBe(true)
  })

  it('대각선도 인접이다', () => {
    expect(neighborsAdjacent('1-1', '0-0')).toBe(true)
    expect(neighborsAdjacent('1-1', '2-2')).toBe(true)
    expect(neighborsAdjacent('1-1', '0-2')).toBe(true)
  })

  it('거리 2 이상은 인접이 아니다', () => {
    expect(neighborsAdjacent('1-1', '1-3')).toBe(false)
    expect(neighborsAdjacent('0-0', '2-2')).toBe(false)
  })

  it('동일 좌석은 인접이 아니다 (체비쇼프 거리 0)', () => {
    expect(neighborsAdjacent('1-1', '1-1')).toBe(false)
  })
})
