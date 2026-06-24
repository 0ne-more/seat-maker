// 영속화 스키마 + 직렬화 변환 — localStorage는 신뢰할 수 없는 입력이므로 경계에서 zod로 검증한다.
import { z } from 'zod'
import type { Page, SeatKey, Student } from '../types'

/** 직렬화 포맷 버전. 스키마가 바뀌면 올리고 loadState에서 마이그레이션/폐기 처리한다. */
export const PERSIST_VERSION = 1

// id는 구버전(필드 없던 시절) 데이터 대비 optional — 복원 시 보강한다.
const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  avoid: z.array(z.number().int()),
})

const persistedStateSchema = z.object({
  version: z.number(),
  page: z.enum(['setup', 'result']),
  pair: z.boolean(),
  cols: z.number().int(),
  rows: z.number().int(),
  // Set은 JSON 직렬화가 안 되므로 배열로 저장한다.
  inactive: z.array(z.string()),
  fixed: z.array(z.string()),
  students: z.array(studentSchema),
  arrangement: z.record(z.string(), z.number().nullable()),
  showRoster: z.boolean(),
  titleText: z.string(),
  msgText: z.string(),
})

export type PersistedState = z.infer<typeof persistedStateSchema>

/** 앱 내부 상태 스냅샷 (Set 등 런타임 타입 포함) */
export interface SeatingSnapshot {
  readonly page: Page
  readonly pair: boolean
  readonly cols: number
  readonly rows: number
  readonly inactive: ReadonlySet<SeatKey>
  readonly fixed: ReadonlySet<SeatKey>
  readonly students: readonly Student[]
  readonly arrangement: Record<SeatKey, number | null>
  readonly showRoster: boolean
  readonly titleText: string
  readonly msgText: string
}

/** 검증되지 않은 입력을 스키마로 파싱. 실패하면 null. */
export function parsePersisted(raw: unknown): PersistedState | null {
  const result = persistedStateSchema.safeParse(raw)
  if (!result.success) return null
  // 버전 불일치는 향후 마이그레이션 지점 — 지금은 폐기하고 초기 상태로.
  if (result.data.version !== PERSIST_VERSION) return null
  return result.data
}

/** 내부 스냅샷 → 직렬화 가능한 객체 (Set → 배열) */
export function toPersisted(s: SeatingSnapshot): PersistedState {
  return {
    version: PERSIST_VERSION,
    page: s.page,
    pair: s.pair,
    cols: s.cols,
    rows: s.rows,
    inactive: [...s.inactive],
    fixed: [...s.fixed],
    students: s.students.map((st) => ({ id: st.id, name: st.name, avoid: [...st.avoid] })),
    arrangement: { ...s.arrangement },
    showRoster: s.showRoster,
    titleText: s.titleText,
    msgText: s.msgText,
  }
}

/** 검증된 데이터 → 내부 스냅샷 (배열 → Set, id 보강, page 안전 전환) */
export function fromPersisted(p: PersistedState): SeatingSnapshot {
  const students: Student[] = p.students.map((st) => ({
    id: st.id ?? crypto.randomUUID(),
    name: st.name,
    avoid: st.avoid,
  }))
  // 결과 화면을 복원하더라도 유효한 배치가 없으면 빈 화면이 되므로 설정 화면으로 안전 전환한다.
  const hasArrangement = Object.values(p.arrangement).some((v) => v != null)
  const page: Page = p.page === 'result' && !hasArrangement ? 'setup' : p.page

  return {
    page,
    pair: p.pair,
    cols: p.cols,
    rows: p.rows,
    inactive: new Set(p.inactive),
    fixed: new Set(p.fixed),
    students,
    arrangement: { ...p.arrangement },
    showRoster: p.showRoster,
    titleText: p.titleText,
    msgText: p.msgText,
  }
}
