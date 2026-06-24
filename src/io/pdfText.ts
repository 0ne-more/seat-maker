// PDF 텍스트 추출 (IO 경계) — pdf.js에 의존하는 유일한 레이어.
// 결과는 pdf.js 비의존 TextItem[]로 정규화해 순수 파싱(logic/parseRoster)에 넘긴다.
import type { TextItem } from '../logic/parseRoster'
import { textItemSchema } from '../logic/rosterImportSchema'

// pdf.js를 동적 import해 초기 번들에서 분리(코드 스플리팅)하고, worker는 1회만 설정한다.
async function loadPdfjs() {
  const pdfjsLib = await import('pdfjs-dist')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
  }
  return pdfjsLib
}

/**
 * PDF 파일에서 텍스트 조각을 좌표와 함께 추출한다.
 * @throws 손상·암호화 등으로 읽을 수 없거나 텍스트가 전혀 없는 경우 한국어 에러
 */
export async function extractTextItems(file: File): Promise<TextItem[]> {
  let pdf
  try {
    const pdfjsLib = await loadPdfjs()
    const data = new Uint8Array(await file.arrayBuffer())
    pdf = await pdfjsLib.getDocument({ data }).promise
  } catch (error) {
    console.error('PDF 로드 실패:', error)
    throw new Error('PDF를 읽을 수 없어요. 손상되었거나 암호가 걸린 파일일 수 있어요.')
  }

  const items: TextItem[] = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    for (const it of content.items) {
      // pdf.js는 TextItem | TextMarkedContent를 섞어 반환 — str 없는 항목은 건너뛴다.
      if (!('str' in it) || it.str.trim() === '') continue
      const candidate = { str: it.str, x: it.transform[4], y: it.transform[5], page: p }
      const parsed = textItemSchema.safeParse(candidate)
      if (parsed.success) items.push(parsed.data)
    }
  }

  if (items.length === 0) {
    throw new Error('PDF에서 글자를 찾지 못했어요. 스캔(이미지)된 PDF는 지원하지 않아요.')
  }
  return items
}
