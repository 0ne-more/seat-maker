// 자리 배치 도구의 전체 상태와 액션을 관리하는 훅
import { useRef, useState } from 'react'
import type { Page, SeatKey, Student } from '../types'
import { GRID_MAX, GRID_MIN, MAX_AVOID } from '../constants'
import { activeSeats } from '../logic/seats'
import { describeViolations, generateArrangement } from '../logic/generate'

/** 초기 학생 명단 — 빈 행 25개로 시작 (이름/기피 번호 없음) */
function createInitialStudents(): Student[] {
  return Array.from({ length: 25 }, () => ({ name: '', avoid: [] }))
}

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
  // 편집
  setTitle: (t: string) => void
  setMsg: (m: string) => void
}

export function useSeating(): SeatingApi {
  const [page, setPage] = useState<Page>('setup')
  const [pair, setPair] = useState(false)
  const [cols, setCols] = useState(6)
  const [rows, setRows] = useState(5)
  const [inactive, setInactive] = useState<ReadonlySet<SeatKey>>(new Set())
  const [students, setStudents] = useState<Student[]>(createInitialStudents)
  const [inputVals, setInputVals] = useState<Record<number, string>>({})
  const [arrangement, setArrangement] = useState<Record<SeatKey, number | null>>({})
  const [fixed, setFixed] = useState<ReadonlySet<SeatKey>>(new Set())
  const [showRoster, setShowRoster] = useState(false)
  const [titleText, setTitleText] = useState('1반 자리 편성표')
  const [msgText, setMsgText] = useState('오늘부터 새 자리예요. 2주 동안 잘 지내봐요! 😊')
  const [setupWarn, setSetupWarn] = useState('')
  const [resultWarn, setResultWarn] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const dragFrom = useRef<SeatKey | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const count = students.length
  const activeCount = activeSeats(rows, cols, inactive).length
  const fits = count <= activeCount

  function toast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(msg)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2800)
  }

  // ---------- 배치 ----------
  function runGenerate(keepFixed: boolean) {
    const seats = activeSeats(rows, cols, inactive)
    const n = students.length
    if (n > seats.length) {
      setSetupWarn(`활성 자리(${seats.length})가 학생 수(${n})보다 적어요. 자리를 더 켜주세요.`)
      return
    }
    const fixedAssign: Record<SeatKey, number> = {}
    if (keepFixed) {
      fixed.forEach((k) => {
        const idx = arrangement[k]
        if (idx != null && seats.includes(k)) fixedAssign[k] = idx
      })
    }
    const { arrangement: next, violationCount } = generateArrangement(seats, students, fixedAssign)
    let warn = ''
    if (violationCount > 0) {
      const names = describeViolations(next, students)
      warn = `인접 금지 설정이 빡빡해 일부는 붙었어요: ${names.join(', ')} (위반 최소 배치)`
    }
    setArrangement(next)
    setPage('result')
    setSetupWarn('')
    setResultWarn(warn)
  }

  // ---------- 좌석 ----------
  function toggleSeat(k: SeatKey) {
    const s = new Set(inactive)
    s.has(k) ? s.delete(k) : s.add(k)
    setInactive(s)
  }
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

  // ---------- 기피 번호 ----------
  function addAvoid(i: number, raw: string) {
    const num = parseInt(String(raw).replace(/[^0-9]/g, ''), 10)
    const n = students.length
    if (!num || num < 1 || num > n || num === i + 1) return
    if (students[i].avoid.includes(num)) return
    if (students[i].avoid.length >= MAX_AVOID) {
      toast(`${i + 1}번은 인접 금지를 최대 ${MAX_AVOID}명까지만 등록할 수 있어요`)
      return
    }
    if (students[num - 1].avoid.length >= MAX_AVOID) {
      toast(`${num}번은 인접 금지가 이미 ${MAX_AVOID}명이라 등록할 수 없어요`)
      return
    }
    const next = students.map((s) => ({ name: s.name, avoid: [...s.avoid] }))
    next[i].avoid.push(num)
    if (!next[num - 1].avoid.includes(i + 1)) next[num - 1].avoid.push(i + 1)
    setStudents(next)
  }
  function removeAvoid(i: number, num: number) {
    const next = students.map((s) => ({ name: s.name, avoid: [...s.avoid] }))
    next[i].avoid = next[i].avoid.filter((x) => x !== num)
    next[num - 1].avoid = next[num - 1].avoid.filter((x) => x !== i + 1)
    setStudents(next)
  }

  // ---------- 명단 ----------
  function setName(i: number, val: string) {
    const next = students.map((s, idx) => (idx === i ? { ...s, name: val } : s))
    setStudents(next)
  }
  function addStudent() {
    setStudents([...students, { name: '새 학생', avoid: [] }])
  }
  function removeLastStudent() {
    const n = students.length
    if (n <= 1) return
    // 마지막 번호(n) 제거 + 다른 학생 기피 목록에서도 정리
    const next = students.slice(0, n - 1).map((s) => ({ name: s.name, avoid: s.avoid.filter((x) => x !== n) }))
    const nextInputs = { ...inputVals }
    delete nextInputs[n - 1]
    setStudents(next)
    setInputVals(nextInputs)
  }

  return {
    page, pair, cols, rows, inactive, students, inputVals, arrangement, fixed,
    showRoster, titleText, msgText, setupWarn, resultWarn, toastMsg,
    activeCount, count, fits,
    togglePair: () => setPair((p) => !p),
    toggleRoster: () => setShowRoster((r) => !r),
    incCols: () => setCols((c) => Math.min(GRID_MAX, c + 1)),
    decCols: () => setCols((c) => Math.max(GRID_MIN, c - 1)),
    incRows: () => setRows((r) => Math.min(GRID_MAX, r + 1)),
    decRows: () => setRows((r) => Math.max(GRID_MIN, r - 1)),
    goBack: () => setPage('setup'),
    generate: () => runGenerate(false),
    regenerate: () => runGenerate(true),
    toggleSeat,
    toggleFixed,
    setDragFrom: (k) => {
      dragFrom.current = k
    },
    dropSeat,
    setName,
    addStudent,
    removeLastStudent,
    addAvoid,
    removeAvoid,
    setInputVal: (i, val) => setInputVals({ ...inputVals, [i]: val }),
    setTitle: setTitleText,
    setMsg: setMsgText,
  }
}
