// PDF에서 추출한 명단 미리보기 — 사용자가 이름을 수정/삭제한 뒤 '적용'해야 명단에 반영된다.
import { useState } from 'react'
import type { ParsedStudent, ParseResult } from '../logic/parseRoster'
import { parsedStudentSchema } from '../logic/rosterImportSchema'
import { COLORS } from '../constants'

interface Props {
  readonly result: ParseResult
  readonly onApply: (students: ParsedStudent[]) => void
  readonly onCancel: () => void
}

export function ImportPreviewModal({ result, onApply, onCancel }: Props) {
  const [rows, setRows] = useState<ParsedStudent[]>(() => result.students.map((s) => ({ ...s })))

  const valid = rows.map((r) => parsedStudentSchema.safeParse(r)).filter((r) => r.success).length

  function setName(i: number, name: string) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, name } : r)))
  }

  function removeRow(i: number) {
    setRows(rows.filter((_, idx) => idx !== i))
  }

  function apply() {
    // 이름이 비어있지 않은 행만 반영 (번호는 명단에서 인덱스+1로 재부여되므로 순서만 의미)
    const students = rows
      .map((r) => parsedStudentSchema.safeParse(r))
      .filter((r) => r.success)
      .map((r) => r.data)
    if (students.length > 0) onApply(students)
  }

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(34,30,24,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          borderRadius: 20,
          padding: '24px 26px',
          width: 'min(460px, 100%)',
          maxHeight: '82vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ fontFamily: "'Jua', sans-serif", fontSize: 20, marginBottom: 4 }}>
          명단 미리보기
        </div>
        <div style={{ fontSize: 12.5, color: COLORS.mute, marginBottom: 14 }}>
          추출된 {valid}명을 확인하고 수정한 뒤 적용하세요. (적용하면 기존 명단을 덮어써요)
        </div>

        {result.confidence === 'low' && (
          <div
            style={{
              background: COLORS.avoidTagBg,
              color: COLORS.avoidTagText,
              fontSize: 12.5,
              fontWeight: 700,
              padding: '9px 12px',
              borderRadius: 10,
              marginBottom: 14,
              lineHeight: 1.5,
            }}
          >
            자동 매칭 정확도가 낮아요. 번호·이름이 맞는지 꼭 확인해 주세요.
          </div>
        )}

        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '38px 1fr 32px', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  color: COLORS.subText,
                }}
              >
                {i + 1}
              </div>
              <input
                value={r.name}
                onChange={(e) => setName(i, e.target.value)}
                style={{
                  width: '100%',
                  background: '#fff',
                  border: `1.5px solid ${COLORS.borderStrong}`,
                  borderRadius: 9,
                  padding: '7px 10px',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: COLORS.ink,
                  outline: 'none',
                }}
              />
              <span
                onClick={() => removeRow(i)}
                style={{ cursor: 'pointer', textAlign: 'center', color: COLORS.mute, fontWeight: 700, fontSize: 18 }}
              >
                ×
              </span>
            </div>
          ))}
          {rows.length === 0 && (
            <div style={{ fontSize: 13, color: COLORS.mute, padding: '12px 0', textAlign: 'center' }}>
              추출된 학생이 없어요.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <div
            onClick={onCancel}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 12,
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.subText,
              cursor: 'pointer',
              border: `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: 12,
            }}
          >
            취소
          </div>
          <div
            onClick={apply}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 12,
              fontSize: 14,
              fontWeight: 700,
              color: '#fff',
              cursor: valid > 0 ? 'pointer' : 'default',
              background: valid > 0 ? COLORS.coral : COLORS.muteSoft,
              borderRadius: 12,
              userSelect: 'none',
            }}
          >
            {valid}명 적용
          </div>
        </div>
      </div>
    </div>
  )
}
