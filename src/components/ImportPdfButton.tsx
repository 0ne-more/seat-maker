// PDF 명단 가져오기 진입점 — 파일 선택 → 텍스트 추출 → 파싱 → 미리보기 모달.
import { useRef, useState } from 'react'
import type { SeatingApi } from '../hooks/useSeating'
import type { ParseResult } from '../logic/parseRoster'
import { parseRoster } from '../logic/parseRoster'
import { extractTextItems } from '../io/pdfText'
import { COLORS } from '../constants'
import { ImportPreviewModal } from './ImportPreviewModal'

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function ImportPdfButton({ api }: { api: SeatingApi }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ParseResult | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일을 다시 선택할 수 있도록 초기화
    if (!file) return
    if (!isPdf(file)) {
      api.toast('PDF 파일만 첨부할 수 있어요.')
      return
    }
    setLoading(true)
    try {
      const items = await extractTextItems(file)
      const parsed = parseRoster(items)
      if (parsed.students.length === 0) {
        api.toast('PDF에서 학생 번호와 이름을 찾지 못했어요.')
        return
      }
      setResult(parsed)
    } catch (error) {
      api.toast(error instanceof Error ? error.message : 'PDF를 처리하지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />
      <div
        onClick={() => {
          if (!loading) inputRef.current?.click()
        }}
        style={{
          textAlign: 'center',
          padding: '10px 12px',
          marginBottom: 12,
          fontSize: 13.5,
          fontWeight: 700,
          color: loading ? COLORS.mute : COLORS.subText,
          cursor: loading ? 'default' : 'pointer',
          border: `1.5px dashed ${COLORS.borderStrong}`,
          borderRadius: 12,
          background: '#fff',
          userSelect: 'none',
        }}
      >
        {loading ? 'PDF 분석 중…' : '📄 PDF에서 명단 가져오기'}
      </div>

      {result && (
        <ImportPreviewModal
          result={result}
          onApply={(students) => {
            api.importStudents(students)
            setResult(null)
            api.toast(`${students.length}명을 명단에 가져왔어요.`)
          }}
          onCancel={() => setResult(null)}
        />
      )}
    </>
  )
}
