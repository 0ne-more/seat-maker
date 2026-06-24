// 도메인 타입 정의 — PRD 5장 핵심 개념 기준

/** 학생: 이름과 인접 금지(기피) 번호 목록(1-based) */
export interface Student {
  readonly name: string
  readonly avoid: readonly number[]
}

/** 좌석 키 "행-열" (예: "2-3") */
export type SeatKey = string

/** 학생 ↔ 좌석 매핑 (seatKey -> 학생 인덱스, 0-based) */
export type Arrangement = Readonly<Record<SeatKey, number>>

/** 페이지 단계 */
export type Page = 'setup' | 'result'

/** 그리드 렌더 모드 */
export type GridMode = 'setup' | 'result'

/** 좌석 행/열 좌표 */
export interface RowCol {
  readonly r: number
  readonly c: number
}
