// 디자인 시스템 색상 및 배치 제약 상수

export const COLORS = {
  bgCream: '#F4F1E8',
  surface: '#FBF9F2',
  ink: '#221E18',
  coral: '#FF7A4D',
  coralShadow: '#E15A2C',
  yellow: '#FFD23E', // 고정석
  blue: '#7FB3F2',
  green: '#74C268',
  pink: '#F4A6C0',
  avoidTagBg: '#FFE0DA',
  avoidTagText: '#D6452A',
  border: '#E7E2D4',
  borderStrong: '#DCD6C7',
  mute: '#9A917F',
  muteSoft: '#B5AC99',
  subText: '#6B6358',
} as const

/** 기피 번호 최대 등록 수 (PRD 6장: 디자인 구현은 8명) */
export const MAX_AVOID = 8

/** 그리드 크기 범위 */
export const GRID_MIN = 2
export const GRID_MAX = 10

/** 배치 휴리스틱 반복 상한 */
export const GENERATE_ATTEMPTS = 60
export const LOCAL_SEARCH_ITER = 500

/** 좌석 기본 크기 (setup / result) */
export const SEAT_DIM = {
  setupW: 86,
  setupH: 60,
  resultW: 92,
  resultH: 66,
} as const
