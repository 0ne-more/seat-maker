// 뷰포트 크기 추적 — 그리드 스케일링에 사용
import { useEffect, useState } from 'react'
import type { Viewport } from '../logic/layout'

export function useViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() => ({
    vpW: typeof window !== 'undefined' ? window.innerWidth : 1200,
    vpH: typeof window !== 'undefined' ? window.innerHeight : 720,
  }))

  useEffect(() => {
    const onResize = () => setVp({ vpW: window.innerWidth, vpH: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return vp
}
