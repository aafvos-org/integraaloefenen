/** Kaart van 1200×630 voor WhatsApp: titel plus het merk. */
export function ogKaart(titel: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#f7f4ee',
        padding: '72px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: '#2d6a4f',
            color: '#f7f4ee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            marginRight: 20,
          }}
        >
          ∫
        </div>
        <div style={{ fontSize: 32, color: '#2d6a4f' }}>IntegraalOefenen</div>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: titel.length > 42 ? 56 : 68,
          lineHeight: 1.15,
          color: '#1c1917',
        }}
      >
        {titel}
      </div>
    </div>
  )
}
