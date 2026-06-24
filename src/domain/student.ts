// 학생 도메인 팩토리 — 안정 id 부여의 단일 진입점.
// 향후 CSV/엑셀 import도 여기를 거쳐 일관되게 학생을 생성한다.
import type { Student } from '../types'

/** 고유 id를 부여한 새 학생 생성 (avoid는 빈 목록) */
export function createStudent(name: string): Student {
  return { id: crypto.randomUUID(), name, avoid: [] }
}

/** 초기 학생 명단 — 빈 행 N개(기본 25)로 시작 */
export function createInitialStudents(count = 25): Student[] {
  return Array.from({ length: count }, () => createStudent(''))
}
