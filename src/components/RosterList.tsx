// 명렬표 — 번호-이름 인덱스 (2열 그리드)
import type { Student } from '../types'
import { COLORS } from '../constants'

export function RosterList({ students }: { students: readonly Student[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
      {students.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'baseline', fontSize: 13.5 }}>
          <span style={{ color: COLORS.mute, fontWeight: 700, minWidth: 18, textAlign: 'right' }}>{i + 1}</span>
          <span style={{ fontWeight: 500 }}>{s.name}</span>
        </div>
      ))}
    </div>
  )
}
