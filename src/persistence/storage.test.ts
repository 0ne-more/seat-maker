import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearState, loadState, saveState } from './storage'
import { toPersisted, type SeatingSnapshot } from './schema'

const STORAGE_KEY = 'seat-maker:v1'

// node 환경에는 localStorage가 없으므로 in-memory 구현을 주입한다 (jsdom 의존성 회피).
function createMemoryStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => [...m.keys()][i] ?? null,
    get length() {
      return m.size
    },
  } as Storage
}

let storage: Storage

beforeEach(() => {
  storage = createMemoryStorage()
  vi.stubGlobal('window', { localStorage: storage })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function snapshot(over: Partial<SeatingSnapshot> = {}): SeatingSnapshot {
  return {
    page: 'result',
    pair: false,
    cols: 6,
    rows: 5,
    inactive: new Set<string>(),
    fixed: new Set(['1-1']),
    students: [{ id: 'a', name: '철수', avoid: [] }],
    arrangement: { '0-0': 0 },
    showRoster: true,
    titleText: '제목',
    msgText: '멘트',
    ...over,
  }
}

describe('saveState / loadState', () => {
  it('저장 후 복원하면 동일한 스냅샷을 얻는다 (라운드트립)', () => {
    const snap = snapshot()
    saveState(snap)
    const restored = loadState()
    expect(restored).not.toBeNull()
    expect(restored!.cols).toBe(6)
    expect(restored!.fixed).toEqual(new Set(['1-1']))
    expect(restored!.students).toEqual(snap.students)
    expect(restored!.page).toBe('result')
  })

  it('저장된 값이 없으면 null', () => {
    expect(loadState()).toBeNull()
  })

  it('손상된 JSON이면 null (앱을 깨뜨리지 않음)', () => {
    storage.setItem(STORAGE_KEY, '{not valid json')
    expect(loadState()).toBeNull()
  })

  it('스키마에 맞지 않는 데이터면 null', () => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, foo: 'bar' }))
    expect(loadState()).toBeNull()
  })

  it('버전 불일치면 null', () => {
    const persisted = { ...toPersisted(snapshot()), version: 999 }
    storage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    expect(loadState()).toBeNull()
  })
})

describe('clearState', () => {
  it('저장된 상태를 삭제한다', () => {
    saveState(snapshot())
    clearState()
    expect(loadState()).toBeNull()
  })
})

describe('localStorage 부재 환경', () => {
  it('window가 없으면 안전하게 동작한다 (throw 없음)', () => {
    vi.stubGlobal('window', undefined)
    expect(() => saveState(snapshot())).not.toThrow()
    expect(loadState()).toBeNull()
  })
})
