// 토스트 알림
export function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div data-noprint="1">
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 34,
          transform: 'translateX(-50%)',
          background: '#221E18',
          color: '#fff',
          padding: '13px 24px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,.20)',
          zIndex: 9999,
          maxWidth: '80vw',
          textAlign: 'center',
        }}
      >
        {message}
      </div>
    </div>
  )
}
