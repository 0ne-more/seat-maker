// 학생 명단 상태 — 이름, 인접 금지 번호, 기피 입력 임시값.
import { useState } from 'react'
import type { Student } from '../types'
import { MAX_AVOID } from '../constants'
import { createInitialStudents, createStudent } from '../domain/student'
import { applyAvoid, parseAvoidInput, removeAvoidPair, validateAvoid } from '../domain/avoidRules'
import type { ParsedStudent } from '../logic/parseRoster'
import type { SeatingSnapshot } from '../persistence/schema'

export interface RosterApi {
  readonly students: Student[]
  readonly inputVals: Record<number, string>
  readonly setName: (i: number, val: string) => void
  readonly addStudent: () => void
  readonly removeLastStudent: () => void
  readonly addAvoid: (i: number, raw: string) => void
  readonly removeAvoid: (i: number, num: number) => void
  readonly setInputVal: (i: number, val: string) => void
  /** PDF 등에서 추출한 명단으로 전체 교체 (번호순으로 정렬되어 들어옴) */
  readonly replaceStudents: (parsed: readonly ParsedStudent[]) => void
}

/** @param toast 기피 등록 한도 초과 등 안내 메시지 표시 (useToast에서 주입) */
export function useRoster(restored: SeatingSnapshot | null, toast: (msg: string) => void): RosterApi {
  const [students, setStudents] = useState<Student[]>(() =>
    restored ? [...restored.students] : createInitialStudents(),
  )
  const [inputVals, setInputVals] = useState<Record<number, string>>({})

  function addAvoid(i: number, raw: string) {
    const num = parseAvoidInput(raw)
    if (num === null) return
    const result = validateAvoid(students, i, num)
    if (!result.ok) {
      if (result.reason === 'maxSelf') {
        toast(`${i + 1}번은 인접 금지를 최대 ${MAX_AVOID}명까지만 등록할 수 있어요`)
      } else if (result.reason === 'maxTarget') {
        toast(`${num}번은 인접 금지가 이미 ${MAX_AVOID}명이라 등록할 수 없어요`)
      }
      return
    }
    setStudents(applyAvoid(students, i, num))
  }

  function removeLastStudent() {
    const n = students.length
    if (n <= 1) return
    // 마지막 번호(n) 제거 + 다른 학생 기피 목록에서도 정리
    const next = students.slice(0, n - 1).map((s) => ({ ...s, avoid: s.avoid.filter((x) => x !== n) }))
    const nextInputs = { ...inputVals }
    delete nextInputs[n - 1]
    setStudents(next)
    setInputVals(nextInputs)
  }

  return {
    students,
    inputVals,
    setName: (i, val) => setStudents(students.map((s, idx) => (idx === i ? { ...s, name: val } : s))),
    addStudent: () => setStudents([...students, createStudent('새 학생')]),
    removeLastStudent,
    // 번호순으로 들어온 명단을 그대로 새 학생 목록으로 교체. 표시 번호는 인덱스+1로 재부여되고
    // avoid는 비워진다(기피 정보는 PDF에서 추출하지 않음). 빈 명단은 무시.
    replaceStudents: (parsed) => {
      if (parsed.length === 0) return
      setStudents(parsed.map((p) => createStudent(p.name)))
      setInputVals({})
    },
    addAvoid,
    removeAvoid: (i, num) => setStudents(removeAvoidPair(students, i, num)),
    setInputVal: (i, val) => setInputVals({ ...inputVals, [i]: val }),
  }
}
