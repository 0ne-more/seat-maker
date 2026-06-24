import { describe, expect, it } from 'vitest'
import {
  PERSIST_VERSION,
  fromPersisted,
  parsePersisted,
  toPersisted,
  type SeatingSnapshot,
} from './schema'

function snapshot(over: Partial<SeatingSnapshot> = {}): SeatingSnapshot {
  return {
    page: 'setup',
    pair: false,
    cols: 6,
    rows: 5,
    inactive: new Set(['0-0']),
    fixed: new Set(['1-1']),
    students: [{ id: 'a', name: '철수', avoid: [2] }],
    arrangement: { '0-0': 0 },
    showRoster: false,
    titleText: '제목',
    msgText: '멘트',
    ...over,
  }
}

describe('parsePersisted', () => {
  it('정상 객체를 파싱한다', () => {
    const valid = toPersisted(snapshot())
    expect(parsePersisted(valid)).not.toBeNull()
  })

  it('필수 필드가 빠지면 null', () => {
    expect(parsePersisted({ version: 1, page: 'setup' })).toBeNull()
  })

  it('타입이 틀리면 null', () => {
    const bad = { ...toPersisted(snapshot()), cols: 'six' }
    expect(parsePersisted(bad)).toBeNull()
  })

  it('버전이 다르면 null (마이그레이션 지점)', () => {
    const future = { ...toPersisted(snapshot()), version: PERSIST_VERSION + 1 }
    expect(parsePersisted(future)).toBeNull()
  })
})

describe('toPersisted / fromPersisted 라운드트립', () => {
  it('Set ↔ 배열 변환을 왕복해도 값이 보존된다', () => {
    const snap = snapshot()
    const restored = fromPersisted(parsePersisted(toPersisted(snap))!)

    expect(restored.inactive).toEqual(snap.inactive)
    expect(restored.fixed).toEqual(snap.fixed)
    expect(restored.students).toEqual(snap.students)
    expect(restored.arrangement).toEqual(snap.arrangement)
    expect(restored.titleText).toBe('제목')
  })
})

describe('fromPersisted 보강 규칙', () => {
  it('id가 없는 구버전 학생에 id를 부여한다', () => {
    const persisted = toPersisted(snapshot())
    // 구버전 데이터 흉내: id 제거
    const legacy = { ...persisted, students: [{ name: '영희', avoid: [] }] }
    const parsed = parsePersisted(legacy)!
    const restored = fromPersisted(parsed)
    expect(restored.students[0].id).toBeTruthy()
    expect(restored.students[0].name).toBe('영희')
  })

  it('result 페이지인데 유효한 배치가 없으면 setup으로 전환한다', () => {
    const persisted = toPersisted(snapshot({ page: 'result', arrangement: { '0-0': null } }))
    const restored = fromPersisted(parsePersisted(persisted)!)
    expect(restored.page).toBe('setup')
  })

  it('result 페이지이고 유효한 배치가 있으면 result를 유지한다', () => {
    const persisted = toPersisted(snapshot({ page: 'result', arrangement: { '0-0': 0 } }))
    const restored = fromPersisted(parsePersisted(persisted)!)
    expect(restored.page).toBe('result')
  })
})
