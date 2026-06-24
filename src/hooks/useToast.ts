// 일시 토스트 메시지 상태 — 일정 시간 후 자동 소멸.
import { useRef, useState } from 'react'

const TOAST_DURATION_MS = 2800

export interface ToastApi {
  readonly toastMsg: string
  readonly toast: (msg: string) => void
}

export function useToast(): ToastApi {
  const [toastMsg, setToastMsg] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function toast(msg: string) {
    if (timer.current) clearTimeout(timer.current)
    setToastMsg(msg)
    timer.current = setTimeout(() => setToastMsg(''), TOAST_DURATION_MS)
  }

  return { toastMsg, toast }
}
