// 자리 배치 도구의 상태를 조율하는 최상위 훅 — 하위 도메인 훅들을 조립해 단일 SeatingApi로 노출한다.
import { useState } from 'react'
import type { Page, SeatKey, Student } from '../types'
import type { ParsedStudent } from '../logic/parseRoster'
import { activeSeats } from '../logic/seats'
import { describeViolations, generateArrangement } from '../logic/generate'
import { loadState } from '../persistence/storage'
import { usePersistence } from './usePersistence'
import { useToast } from './useToast'
import { useGridConfig } from './useGridConfig'
import { useArrangement } from './useArrangement'
import { useRoster } from './useRoster'
import { useEditableMeta } from './useEditableMeta'

export interface SeatingApi {
  page: Page
  pair: boolean
  cols: number
  rows: number
  inactive: ReadonlySet<SeatKey>
  students: Student[]
  inputVals: Record<number, string>
  arrangement: Record<SeatKey, number | null>
  fixed: ReadonlySet<SeatKey>
  showRoster: boolean
  titleText: string
  msgText: string
  setupWarn: string
  resultWarn: string
  toastMsg: string
  toast: (msg: string) => void
  // 파생값
  activeCount: number
  count: number
  fits: boolean
  // 토글/네비
  togglePair: () => void
  toggleRoster: () => void
  incCols: () => void
  decCols: () => void
  incRows: () => void
  decRows: () => void
  goBack: () => void
  generate: () => void
  regenerate: () => void
  // 좌석
  toggleSeat: (k: SeatKey) => void
  toggleFixed: (k: SeatKey) => void
  setDragFrom: (k: SeatKey | null) => void
  dropSeat: (to: SeatKey) => void
  // 명단
  setName: (i: number, val: string) => void
  addStudent: () => void
  removeLastStudent: () => void
  addAvoid: (i: number, raw: string) => void
  removeAvoid: (i: number, num: number) => void
  setInputVal: (i: number, val: string) => void
  importStudents: (parsed: readonly ParsedStudent[]) => void
  // 편집
  setTitle: (t: string) => void
  setMsg: (m: string) => void
}

export function useSeating(): SeatingApi {
  // 마운트 시 저장된 상태를 1회만 복원 (없으면 null → 각 훅이 기본값 사용)
  const [restored] = useState(loadState)

  const grid = useGridConfig(restored)
  const arr = useArrangement(restored)
  const { toastMsg, toast } = useToast()
  const roster = useRoster(restored, toast)
  const meta = useEditableMeta(restored)

  const [page, setPage] = useState<Page>(restored?.page ?? 'setup')
  const [showRoster, setShowRoster] = useState(restored?.showRoster ?? false)
  const [setupWarn, setSetupWarn] = useState('')
  const [resultWarn, setResultWarn] = useState('')

  const { cols, rows, inactive } = grid
  const { students } = roster
  const count = students.length
  const activeCount = activeSeats(rows, cols, inactive).length
  const fits = count <= activeCount

  // 휘발성 상태(inputVals/경고/토스트)를 제외한 작업 상태를 자동 저장한다.
  usePersistence({
    page,
    pair: grid.pair,
    cols,
    rows,
    inactive,
    fixed: arr.fixed,
    students,
    arrangement: arr.arrangement,
    showRoster,
    titleText: meta.titleText,
    msgText: meta.msgText,
  })

  // 활성 좌석에 학생을 배치한다. keepFixed=true면 기존 고정석을 유지한 채 나머지만 재배치.
  function runGenerate(keepFixed: boolean) {
    const seats = activeSeats(rows, cols, inactive)
    const n = students.length
    if (n > seats.length) {
      setSetupWarn(`활성 자리(${seats.length})가 학생 수(${n})보다 적어요. 자리를 더 켜주세요.`)
      return
    }
    const fixedAssign: Record<SeatKey, number> = {}
    if (keepFixed) {
      arr.fixed.forEach((k) => {
        const idx = arr.arrangement[k]
        if (idx != null && seats.includes(k)) fixedAssign[k] = idx
      })
    }
    const { arrangement: next, violationCount } = generateArrangement(seats, students, fixedAssign)
    let warn = ''
    if (violationCount > 0) {
      const names = describeViolations(next, students)
      warn = `인접 금지 설정이 빡빡해 일부는 붙었어요: ${names.join(', ')} (위반 최소 배치)`
    }
    arr.setArrangement(next)
    setPage('result')
    setSetupWarn('')
    setResultWarn(warn)
  }

  // PDF 등에서 추출한 명단으로 교체. 학생 인덱스가 바뀌므로 기존 배치는 폐기하고 설정 화면으로 돌아간다.
  function importStudents(parsed: readonly ParsedStudent[]) {
    if (parsed.length === 0) return
    roster.replaceStudents(parsed)
    arr.reset()
    setPage('setup')
    setSetupWarn('')
    setResultWarn('')
  }

  return {
    page,
    pair: grid.pair,
    cols,
    rows,
    inactive,
    students,
    inputVals: roster.inputVals,
    arrangement: arr.arrangement,
    fixed: arr.fixed,
    showRoster,
    titleText: meta.titleText,
    msgText: meta.msgText,
    setupWarn,
    resultWarn,
    toastMsg,
    toast,
    activeCount,
    count,
    fits,
    togglePair: grid.togglePair,
    toggleRoster: () => setShowRoster((r) => !r),
    incCols: grid.incCols,
    decCols: grid.decCols,
    incRows: grid.incRows,
    decRows: grid.decRows,
    goBack: () => setPage('setup'),
    generate: () => runGenerate(false),
    regenerate: () => runGenerate(true),
    toggleSeat: grid.toggleSeat,
    toggleFixed: arr.toggleFixed,
    setDragFrom: arr.setDragFrom,
    dropSeat: arr.dropSeat,
    setName: roster.setName,
    addStudent: roster.addStudent,
    removeLastStudent: roster.removeLastStudent,
    addAvoid: roster.addAvoid,
    removeAvoid: roster.removeAvoid,
    setInputVal: roster.setInputVal,
    importStudents,
    setTitle: meta.setTitle,
    setMsg: meta.setMsg,
  }
}
