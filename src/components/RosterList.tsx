// 명렬표 — 번호-이름 인덱스 (2열 그리드, 열 우선 채우기)
import type { Student } from '../types'
import { COLORS } from '../constants'

export function RosterList({ students }: { students: readonly Student[] }) {
  // 1열에 앞 절반, 2열에 뒤 절반을 둔다. 홀수면 ceil로 1열이 1명 더 많아진다.
  const rows = Math.max(1, Math.ceil(students.length / 2))
  return (
    <div
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateRows: `repeat(${rows}, auto)`,
        gridTemplateColumns: '1fr 1fr',
        gap: '6px 14px',
      }}
    >
      {students.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'baseline', fontSize: 13.5 }}>
          <span style={{ color: COLORS.mute, fontWeight: 700, minWidth: 18, textAlign: 'right' }}>{i + 1}</span>
          <span style={{ fontWeight: 500 }}>{s.name}</span>
        </div>
      ))}
    </div>
  )
}
