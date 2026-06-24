// 교탁 표시 박스 — 설정/결과/인쇄 화면에서 크기만 달리하여 공용한다.
import { COLORS } from '../constants'

interface TeacherDeskProps {
  readonly width: number
  readonly height: number
  readonly fontSize: number
  readonly marginTop: number
}

export function TeacherDesk({ width, height, fontSize, marginTop }: TeacherDeskProps) {
  return (
    <div
      style={{
        width,
        height,
        background: COLORS.ink,
        color: '#fff',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        letterSpacing: 4,
        marginTop,
      }}
    >
      교 탁
    </div>
  )
}
