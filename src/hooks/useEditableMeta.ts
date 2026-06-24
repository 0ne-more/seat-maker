// 편집 가능한 자리표 메타 텍스트 — 제목, 하단 안내 멘트.
import { useState } from 'react'
import type { SeatingSnapshot } from '../persistence/schema'

const DEFAULT_TITLE = '1반 자리 편성표'
const DEFAULT_MSG = '오늘부터 새 자리예요. 2주 동안 잘 지내봐요! 😊'

export interface EditableMetaApi {
  readonly titleText: string
  readonly msgText: string
  readonly setTitle: (t: string) => void
  readonly setMsg: (m: string) => void
}

export function useEditableMeta(restored: SeatingSnapshot | null): EditableMetaApi {
  const [titleText, setTitleText] = useState(restored?.titleText ?? DEFAULT_TITLE)
  const [msgText, setMsgText] = useState(restored?.msgText ?? DEFAULT_MSG)

  return {
    titleText,
    msgText,
    setTitle: setTitleText,
    setMsg: setMsgText,
  }
}
