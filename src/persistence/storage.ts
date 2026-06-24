// localStorage 경계 계층 — 손상/구버전 데이터로 앱이 깨지지 않도록 항상 안전하게 실패한다.
import { fromPersisted, parsePersisted, toPersisted, type SeatingSnapshot } from './schema'

const STORAGE_KEY = 'seat-maker:v1'

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage ?? null
  } catch {
    // 일부 환경(프라이빗 모드 등)에서 접근 자체가 throw할 수 있다.
    return null
  }
}

/** 저장된 상태를 복원. 없거나 손상/버전 불일치면 null (앱은 초기 상태로 시작). */
export function loadState(): SeatingSnapshot | null {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = parsePersisted(JSON.parse(raw))
    return parsed ? fromPersisted(parsed) : null
  } catch {
    return null
  }
}

/** 현재 상태를 저장. quota 초과 등 오류는 보조 기능이므로 조용히 무시한다. */
export function saveState(snapshot: SeatingSnapshot): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(toPersisted(snapshot)))
  } catch {
    // 저장 실패는 무시 — 영속성은 편의 기능이며 실패해도 앱 동작에 지장 없다.
  }
}

/** 저장된 상태 삭제 (테스트/초기화용) */
export function clearState(): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // 무시
  }
}
