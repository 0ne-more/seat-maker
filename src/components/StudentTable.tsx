// 학생 명단 테이블 — 번호/이름/기피 번호 태그 입력
import type { SeatingApi } from '../hooks/useSeating'
import { COLORS } from '../constants'

const GRID_COLS = '46px 1.1fr 1.5fr'

export function StudentTable({ api }: { api: SeatingApi }) {
  const canDelete = api.students.length > 1

  return (
    <div style={{ overflowY: 'auto', paddingRight: 4 }}>
      {/* 헤더 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID_COLS,
          gap: 10,
          padding: '0 6px 10px',
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.mute,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div>번호</div>
        <div>이름</div>
        <div style={{ textAlign: 'left' }}>인접 금지 번호</div>
      </div>

      {/* 학생 행 */}
      {api.students.map((s, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLS,
            gap: 10,
            padding: '8px 6px',
            alignItems: 'center',
            borderBottom: '1px solid #F0EBDE',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: COLORS.bgCream,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
              color: COLORS.subText,
            }}
          >
            {i + 1}
          </div>
          <input
            value={s.name}
            onChange={(e) => api.setName(i, e.target.value)}
            style={{
              width: '100%',
              background: '#fff',
              border: `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: 10,
              padding: '8px 10px',
              fontSize: 14,
              fontFamily: 'inherit',
              color: COLORS.ink,
              outline: 'none',
            }}
          />
          <div
            style={{
              background: '#fff',
              border: `1.5px solid ${COLORS.borderStrong}`,
              borderRadius: 10,
              padding: '5px 7px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
              alignItems: 'center',
              minHeight: 38,
            }}
          >
            {s.avoid.map((num) => (
              <div
                key={num}
                style={{
                  background: COLORS.avoidTagBg,
                  color: COLORS.avoidTagText,
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: '4px 8px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  whiteSpace: 'nowrap',
                }}
              >
                {num}번
                <span onClick={() => api.removeAvoid(i, num)} style={{ cursor: 'pointer', opacity: 0.6, fontWeight: 700 }}>
                  ×
                </span>
              </div>
            ))}
            <input
              value={api.inputVals[i] || ''}
              placeholder={s.avoid.length ? '' : '번호+Enter'}
              onChange={(e) => api.setInputVal(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  api.addAvoid(i, (e.target as HTMLInputElement).value)
                  api.setInputVal(i, '')
                }
              }}
              style={{
                flex: 1,
                minWidth: 64,
                border: 'none',
                outline: 'none',
                fontSize: 13,
                fontFamily: 'inherit',
                background: 'transparent',
                color: COLORS.ink,
              }}
            />
          </div>
        </div>
      ))}

      {/* 추가/삭제 */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <div
          onClick={() => api.addStudent()}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 12,
            fontSize: 13.5,
            fontWeight: 700,
            color: COLORS.subText,
            cursor: 'pointer',
            border: `1.5px dashed ${COLORS.borderStrong}`,
            borderRadius: 12,
          }}
        >
          + 학생 추가
        </div>
        <div
          onClick={() => {
            if (canDelete) api.removeLastStudent()
          }}
          style={{
            flex: 1,
            textAlign: 'center',
            padding: 12,
            fontSize: 13.5,
            fontWeight: 700,
            color: canDelete ? COLORS.avoidTagText : '#CFC8B8',
            cursor: canDelete ? 'pointer' : 'default',
            border: `1.5px dashed ${canDelete ? '#F3C7BF' : COLORS.border}`,
            borderRadius: 12,
            background: canDelete ? '#FFF6F3' : 'transparent',
          }}
        >
          − 마지막 학생 삭제
        </div>
      </div>
    </div>
  )
}
