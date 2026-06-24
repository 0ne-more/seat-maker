import { describe, expect, it } from 'vitest'
import { createInitialStudents, createStudent } from './student'

describe('createStudent', () => {
  it('이름을 설정하고 빈 기피 목록과 id를 부여한다', () => {
    const s = createStudent('철수')
    expect(s.name).toBe('철수')
    expect(s.avoid).toEqual([])
    expect(typeof s.id).toBe('string')
    expect(s.id.length).toBeGreaterThan(0)
  })

  it('호출마다 고유한 id를 생성한다', () => {
    const a = createStudent('A')
    const b = createStudent('A')
    expect(a.id).not.toBe(b.id)
  })
})

describe('createInitialStudents', () => {
  it('기본 25명의 빈 학생을 만든다', () => {
    const students = createInitialStudents()
    expect(students).toHaveLength(25)
    expect(students.every((s) => s.name === '' && s.avoid.length === 0)).toBe(true)
  })

  it('모든 학생의 id가 고유하다', () => {
    const students = createInitialStudents(25)
    expect(new Set(students.map((s) => s.id)).size).toBe(25)
  })

  it('개수를 지정할 수 있다', () => {
    expect(createInitialStudents(3)).toHaveLength(3)
  })
})
