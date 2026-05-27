export default function WhoPage() {
  return (
    <main style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p style={{
        position: 'absolute',
        top: 40,
        left: 80,
        fontFamily: 'monospace',
        fontSize: 10,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        margin: 0,
        pointerEvents: 'none',
      }}>
        001 · The Athlete
      </p>

      <p style={{
        fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
        fontSize: 16,
        fontWeight: 400,
        color: 'rgba(255,255,255,0.4)',
        margin: 0,
      }}>
        Story coming soon.
      </p>
    </main>
  );
}
