// PDF에서 추출한 텍스트 조각을 학생 번호↔이름으로 매칭하는 순수 휴리스틱.
// pdf.js 등 IO에 의존하지 않고(좌표만 받는다) 단위테스트로 검증한다.
//
// 좌표 기반 매칭으로 두 양식을 모두 처리한다:
//  - 표형(엑셀 명단): 번호와 이름이 같은 행에 가로로 → "같은 행 오른쪽" 매칭
//  - 자리표형: 셀마다 번호 위·이름 아래로 세로 배치 → "바로 아래" 매칭(폴백)

/** PDF 텍스트 조각 (pdf.js 비의존 표현). 좌표는 PDF 좌표계 — y는 위로 갈수록 커진다. */
export interface TextItem {
  readonly str: string
  readonly x: number
  readonly y: number
  /** 페이지 번호(1-based) — 페이지 경계를 넘어 매칭하지 않기 위함 */
  readonly page: number
}

/** 추출된 한 학생 — 번호(1-based)와 이름 */
export interface ParsedStudent {
  readonly number: number
  readonly name: string
}

export interface ParseResult {
  readonly students: readonly ParsedStudent[]
  /** 매칭 신뢰도 — 'low'면 미리보기에서 경고 배너로 안내(차단은 아님) */
  readonly confidence: 'high' | 'low'
}

/** 같은 행으로 볼 y 좌표 허용오차(pt) */
const ROW_TOLERANCE = 3
/** 세로(같은 열) 매칭 시 허용할 x 좌표 차이(pt) — 자리표 셀 내 번호↔이름 정렬 흔들림 흡수 */
const COL_TOLERANCE = 40
/** 학급 번호 유효 범위 */
const MIN_NUMBER = 1
const MAX_NUMBER = 99
/** 이름 최대 길이 — 과도하게 긴 토큰은 제목/문장으로 간주해 제외 */
const MAX_NAME_LEN = 10

/** 표 헤더·잡토큰으로 무시할 키워드 (소문자 + 끝 '.' 제거 후 비교) */
const HEADER_KEYWORDS = new Set([
  '번호', '이름', '성명', '순번', '연번', '학번', '비고', '구분', 'no', 'name',
])

interface Token {
  readonly str: string
  readonly x: number
  readonly y: number
  readonly page: number
}

/** 헤더 키워드 여부 — "No." 같은 표기를 위해 끝 마침표를 제거하고 비교 */
function isHeader(str: string): boolean {
  const k = str.trim().toLowerCase().replace(/\.$/, '')
  return HEADER_KEYWORDS.has(k)
}

/** 학급 번호 토큰이면 숫자값, 아니면 null. "1", "12번"처럼 끝의 '번'도 허용(1~99) */
function parseNumber(str: string): number | null {
  const m = str.trim().match(/^(\d{1,2})번?$/)
  if (!m) return null
  const n = Number(m[1])
  return n >= MIN_NUMBER && n <= MAX_NUMBER ? n : null
}

/** 이름으로 볼 수 있는 토큰인지 — 한글 포함 또는 영문 이름, 헤더/숫자류 제외 */
function isName(str: string): boolean {
  const s = str.trim()
  if (s.length === 0 || s.length > MAX_NAME_LEN) return false
  if (isHeader(s)) return false
  if (parseNumber(s) !== null) return false
  return /[가-힣]/.test(s) || /^[A-Za-z][A-Za-z.\-]*$/.test(s)
}

/**
 * 텍스트 조각을 토큰으로 분해한다. "1 홍길동"처럼 한 조각에 붙은 값은 공백으로 분리하되,
 * 분리된 토큰의 좌→우 순서를 유지하도록 x에 미세 오프셋을 준다.
 */
function tokenize(items: readonly TextItem[]): Token[] {
  return items
    .filter((it) => it.str.trim() !== '')
    .flatMap((it) => {
      const parts = it.str.trim().split(/\s+/).filter(Boolean)
      return parts.map((str, k) => ({ str, x: it.x + k * 0.01, y: it.y, page: it.page }))
    })
}

/** 같은 행(y 근접)에서 오른쪽으로 가장 가까운 이름 — 표형 / 가로 자리표형 */
function findHorizontal(num: Token, names: Token[], used: Set<number>): number {
  let pick = -1
  let best = Infinity
  names.forEach((nm, i) => {
    if (used.has(i) || nm.page !== num.page) return
    const dx = nm.x - num.x
    if (Math.abs(nm.y - num.y) <= ROW_TOLERANCE && dx > 0 && dx < best) {
      best = dx
      pick = i
    }
  })
  return pick
}

/** 같은 열(x 근접)에서 바로 아래로 가장 가까운 이름 — 세로 자리표형 */
function findVertical(num: Token, names: Token[], used: Set<number>): number {
  let pick = -1
  let best = Infinity
  names.forEach((nm, i) => {
    if (used.has(i) || nm.page !== num.page) return
    const dy = num.y - nm.y
    if (dy > 0 && Math.abs(nm.x - num.x) <= COL_TOLERANCE && dy < best) {
      best = dy
      pick = i
    }
  })
  return pick
}

/** 추출 쌍 수·번호 연속성·이름 패턴으로 신뢰도 판정 */
function computeConfidence(students: readonly ParsedStudent[]): 'high' | 'low' {
  if (students.length < 3) return 'low'
  const max = students[students.length - 1].number
  return students.length / max >= 0.7 ? 'high' : 'low'
}

/**
 * PDF 텍스트 조각에서 학생 번호↔이름을 추출한다.
 * 번호는 읽기 순서(위→아래, 왼→오른쪽)로 처리하고, 한 이름은 한 번호에만 매칭된다.
 * 중복 번호는 먼저 나온 항목을 유지하며, 결과는 번호 오름차순으로 정렬한다.
 */
export function parseRoster(items: readonly TextItem[]): ParseResult {
  const tokens = tokenize(items)
  const numbers = tokens
    .filter((t) => parseNumber(t.str) !== null)
    .sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
  const names = tokens.filter((t) => isName(t.str))

  const used = new Set<number>()
  const seen = new Set<number>()
  const pairs: ParsedStudent[] = []
  // 같은 행에 이름이 있는 번호가 우선권을 갖도록 가로 매칭을 먼저 끝내고,
  // 남은 번호만 세로(아래) 매칭한다 — 번호만 있는 행이 아래 행 이름을 가로채는 것을 막는다.
  const assign = (num: Token, pick: number) => {
    const n = parseNumber(num.str)!
    used.add(pick)
    seen.add(n)
    pairs.push({ number: n, name: names[pick].str.trim() })
  }
  for (const num of numbers) {
    if (seen.has(parseNumber(num.str)!)) continue
    const pick = findHorizontal(num, names, used)
    if (pick >= 0) assign(num, pick)
  }
  for (const num of numbers) {
    if (seen.has(parseNumber(num.str)!)) continue
    const pick = findVertical(num, names, used)
    if (pick >= 0) assign(num, pick)
  }

  pairs.sort((a, b) => a.number - b.number)
  return { students: pairs, confidence: computeConfidence(pairs) }
}
