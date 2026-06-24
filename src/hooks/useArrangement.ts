// 배치 결과 상태 — 좌석별 학생 배정, 고정석, 드래그 스왑.
import { useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { SeatKey } from '../types'
import type { SeatingSnapshot } from '../persistence/schema'

export interface ArrangementApi {
  readonly arrangement: Record<SeatKey, number | null>
  readonly fixed: ReadonlySet<SeatKey>
  /** 배치 생성 결과를 반영할 때 사용 (useSeating의 runGenerate에서 호출) */
  readonly setArrangement: Dispatch<SetStateAction<Record<SeatKey, number | null>>>
  readonly toggleFixed: (k: SeatKey) => void
  readonly setDragFrom: (k: SeatKey | null) => void
  readonly dropSeat: (to: SeatKey) => void
}

export function useArrangement(restored: SeatingSnapshot | null): ArrangementApi {
  const [arrangement, setArrangement] = useState<Record<SeatKey, number | null>>(() =>
    restored ? { ...restored.arrangement } : {},
  )
  const [fixed, setFixed] = useState<ReadonlySet<SeatKey>>(restored?.fixed ?? new Set())
  const dragFrom = useRef<SeatKey | null>(null)

  function toggleFixed(k: SeatKey) {
    const s = new Set(fixed)
    s.has(k) ? s.delete(k) : s.add(k)
    setFixed(s)
  }

  function dropSeat(to: SeatKey) {
    const from = dragFrom.current
    if (!from || from === to) {
      dragFrom.current = null
      return
    }
    const a: Record<SeatKey, number | null> = { ...arrangement }
    const tmp = a[to]
    a[to] = a[from]
    a[from] = tmp
    // 고정 상태도 학생을 따라 이동(스왑)
    const nextFixed = new Set(fixed)
    const fromFixed = nextFixed.has(from)
    const toFixed = nextFixed.has(to)
    toFixed ? nextFixed.add(from) : nextFixed.delete(from)
    fromFixed ? nextFixed.add(to) : nextFixed.delete(to)
    if (a[from] == null) {
      delete a[from]
      nextFixed.delete(from)
    }
    if (a[to] == null) {
      delete a[to]
      nextFixed.delete(to)
    }
    setArrangement(a)
    setFixed(nextFixed)
    dragFrom.current = null
  }

  return {
    arrangement,
    fixed,
    setArrangement,
    toggleFixed,
    setDragFrom: (k) => {
      dragFrom.current = k
    },
    dropSeat,
  }
}
