// 인라인 편집 텍스트 — contentEditable(비제어). 현재 값은 ref로 조회
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'

export interface EditableHandle {
  getText: () => string
}

interface EditableTextProps {
  initial: string
  style?: CSSProperties
  title?: string
}

export const EditableText = forwardRef<EditableHandle, EditableTextProps>(function EditableText(
  { initial, style, title },
  ref,
) {
  const elRef = useRef<HTMLDivElement>(null)

  // 초기 텍스트는 마운트 시 1회만 설정 (React가 사용자 편집을 덮어쓰지 않도록 비제어)
  useEffect(() => {
    if (elRef.current && elRef.current.textContent === '') {
      elRef.current.textContent = initial
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    getText: () => (elRef.current?.textContent ?? initial).trim(),
  }))

  return (
    <div ref={elRef} className="ce-edit" contentEditable suppressContentEditableWarning title={title} style={style} />
  )
})
