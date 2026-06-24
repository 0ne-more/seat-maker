import { describe, expect, it } from 'vitest'
import { computeGridLayout, type Viewport } from './layout'

const bigVp: Viewport = { vpW: 2000, vpH: 1400 }
const tinyVp: Viewport = { vpW: 400, vpH: 300 }

function layout(over: Partial<Parameters<typeof computeGridLayout>[0]> = {}) {
  return computeGridLayout({
    mode: 'setup',
    cols: 6,
    rows: 5,
    pair: false,
    viewport: bigVp,
    showRoster: false,
    setupAvailW: null,
    ...over,
  })
}

describe('computeGridLayout', () => {
  it('스케일 s는 항상 1 이하다', () => {
    expect(layout().s).toBeLessThanOrEqual(1)
    expect(layout({ cols: 10, rows: 10, viewport: tinyVp }).s).toBeLessThanOrEqual(1)
  })

  it('작은 그리드 + 충분한 화면이면 s는 1이다 (확대하지 않음)', () => {
    expect(layout({ cols: 2, rows: 2, viewport: bigVp, setupAvailW: 1000 }).s).toBe(1)
  })

  it('큰 그리드 + 작은 화면이면 s는 1 미만으로 축소된다', () => {
    expect(layout({ cols: 10, rows: 10, viewport: tinyVp }).s).toBeLessThan(1)
  })

  it('스케일이 아주 작아도 폰트/gap은 최소값 하한을 지킨다', () => {
    const L = layout({ cols: 10, rows: 10, viewport: { vpW: 100, vpH: 100 } })
    expect(L.gap).toBeGreaterThanOrEqual(3)
    expect(L.between).toBeGreaterThanOrEqual(8)
    expect(L.rad).toBeGreaterThanOrEqual(8)
    expect(L.fName).toBeGreaterThanOrEqual(10)
    expect(L.fNum).toBeGreaterThanOrEqual(8)
    expect(L.fDot).toBeGreaterThanOrEqual(4)
    expect(L.fEmpty).toBeGreaterThanOrEqual(9)
  })

  it('result 모드는 setup 모드보다 기본 좌석이 크다', () => {
    const setup = layout({ mode: 'setup', cols: 2, rows: 2, setupAvailW: 1000 })
    const result = layout({ mode: 'result', cols: 2, rows: 2 })
    // s=1일 때 base 크기 차이(resultW 92 > setupW 86)가 그대로 드러난다
    expect(result.W).toBeGreaterThan(setup.W)
    expect(result.H).toBeGreaterThan(setup.H)
  })

  it('pair 모드는 짝꿍 간격/패딩 때문에 동일 화면에서 더 빡빡하다(s 비증가)', () => {
    const plain = layout({ cols: 6, rows: 5, pair: false, viewport: tinyVp })
    const paired = layout({ cols: 6, rows: 5, pair: true, viewport: tinyVp })
    expect(paired.s).toBeLessThanOrEqual(plain.s)
  })

  it('viewport가 0이면 fallback(1200x720)을 사용해 NaN을 내지 않는다', () => {
    const L = layout({ viewport: { vpW: 0, vpH: 0 } })
    expect(Number.isFinite(L.s)).toBe(true)
    expect(L.s).toBeGreaterThan(0)
  })
})
