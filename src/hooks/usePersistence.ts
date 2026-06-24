// 상태 변경을 디바운스하여 localStorage에 저장하는 훅.
import { useEffect } from 'react'
import { saveState } from '../persistence/storage'
import type { SeatingSnapshot } from '../persistence/schema'

const SAVE_DEBOUNCE_MS = 300

/**
 * 스냅샷이 바뀔 때마다 디바운스 저장한다.
 * 매 렌더 새 객체인 snapshot 자체가 아니라 내부 필드를 의존성으로 삼아 불필요한 저장을 막는다.
 */
export function usePersistence(snapshot: SeatingSnapshot): void {
  useEffect(() => {
    const timer = setTimeout(() => saveState(snapshot), SAVE_DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    snapshot.page,
    snapshot.pair,
    snapshot.cols,
    snapshot.rows,
    snapshot.inactive,
    snapshot.fixed,
    snapshot.students,
    snapshot.arrangement,
    snapshot.showRoster,
    snapshot.titleText,
    snapshot.msgText,
  ])
}
