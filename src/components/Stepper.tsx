// 가로/세로 크기 조절 스텝퍼
import { COLORS } from '../constants'

interface StepperProps {
  label: string
  value: number
  onDec: () => void
  onInc: () => void
}

export function Stepper({ label, value, onDec, onInc }: StepperProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontWeight: 500, fontSize: 13.5, color: COLORS.subText }}>{label}</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#fff',
          border: `1.5px solid ${COLORS.borderStrong}`,
          borderRadius: 999,
          padding: '5px 8px',
        }}
      >
        <div
          onClick={onDec}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: COLORS.bgCream,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 19,
            color: COLORS.subText,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          −
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, minWidth: 22, textAlign: 'center' }}>{value}</div>
        <div
          onClick={onInc}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: COLORS.ink,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 19,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          +
        </div>
      </div>
    </div>
  )
}
