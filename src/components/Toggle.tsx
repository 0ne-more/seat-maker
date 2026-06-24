// 라벨 + 스위치 토글
import { COLORS } from '../constants'

interface ToggleProps {
  label: string
  on: boolean
  onToggle: () => void
}

export function Toggle({ label, on, onToggle }: ToggleProps) {
  return (
    <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
      <span style={{ fontWeight: 500, fontSize: 14 }}>{label}</span>
      <div
        style={{
          width: 50,
          height: 28,
          background: on ? COLORS.green : '#E1DBCC',
          borderRadius: 999,
          position: 'relative',
          transition: 'background .2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 25 : 3,
            width: 22,
            height: 22,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)',
            transition: 'left .2s',
          }}
        />
      </div>
    </div>
  )
}
