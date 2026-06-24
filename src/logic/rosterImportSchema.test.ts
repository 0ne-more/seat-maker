import { describe, expect, it } from 'vitest'
import { parsedStudentSchema, textItemSchema } from './rosterImportSchema'

describe('textItemSchema', () => {
  it('정상 텍스트 조각을 통과시킨다', () => {
    expect(textItemSchema.safeParse({ str: '홍길동', x: 10, y: 20, page: 1 }).success).toBe(true)
  })

  it('좌표가 NaN/Infinity이면 거부한다', () => {
    expect(textItemSchema.safeParse({ str: 'a', x: NaN, y: 20, page: 1 }).success).toBe(false)
    expect(textItemSchema.safeParse({ str: 'a', x: 10, y: Infinity, page: 1 }).success).toBe(false)
  })

  it('page가 0 이하이면 거부한다', () => {
    expect(textItemSchema.safeParse({ str: 'a', x: 10, y: 20, page: 0 }).success).toBe(false)
  })
})

describe('parsedStudentSchema', () => {
  it('번호 1~99, 비어있지 않은 이름을 통과시킨다', () => {
    expect(parsedStudentSchema.safeParse({ number: 1, name: '홍길동' }).success).toBe(true)
    expect(parsedStudentSchema.safeParse({ number: 99, name: 'A' }).success).toBe(true)
  })

  it('이름 앞뒤 공백을 제거한다', () => {
    const r = parsedStudentSchema.safeParse({ number: 3, name: '  김철수  ' })
    expect(r.success && r.data.name).toBe('김철수')
  })

  it('번호 범위를 벗어나거나 빈 이름은 거부한다', () => {
    expect(parsedStudentSchema.safeParse({ number: 0, name: '홍길동' }).success).toBe(false)
    expect(parsedStudentSchema.safeParse({ number: 100, name: '홍길동' }).success).toBe(false)
    expect(parsedStudentSchema.safeParse({ number: 5, name: '   ' }).success).toBe(false)
  })
})
