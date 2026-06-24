// PDF import 경계 검증 스키마 — pdf.js 출력과 사용자가 편집한 명단은
// 신뢰할 수 없는 입력이므로 시스템 경계에서 zod로 검증한다.
import { z } from 'zod'

/** pdf.js에서 정규화한 텍스트 조각 1개 */
export const textItemSchema = z.object({
  str: z.string(),
  x: z.number().finite(),
  y: z.number().finite(),
  page: z.number().int().positive(),
})

/** 추출/편집된 학생 1명 (번호 1~99, 이름 비어있지 않음) */
export const parsedStudentSchema = z.object({
  number: z.number().int().min(1).max(99),
  name: z.string().trim().min(1),
})
