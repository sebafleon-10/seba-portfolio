const pill: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '6px 16px',
  borderRadius: 999,
  color: 'rgba(255,255,255,0.4)',
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.25)',
  margin: 0,
  paddingTop: 64,
  paddingBottom: 24,
};

const body: React.CSSProperties = {
  fontFamily: 'Inter, ui-rounded, system-ui, sans-serif',
  fontSize: 17,
  lineHeight: 1.85,
  color: 'rgba(255,255,255,0.65)',
  fontWeight: 300,
  maxWidth: 680,
  margin: '0 0 64px',
};

const divider: React.CSSProperties = {
  height: 1,
  background: 'rgba(255,255,255,0.06)',
};

const statNum: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 64,
  fontWeight: 700,
  color: '#ffffff',
  margin: '0 0 8px',
  lineHeight: 1,
};

const statLabel: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.3)',
  margin: 0,
};

export default function GhostFCPage() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '0 48px 80px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 32px' }}>
            002 · CHICAGO GHOST FC
          </p>
          <h1 style={{ fontFamily: 'Inter, ui-rounded, system-ui, sans-serif', fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 700, lineHeight: 0.95, color: '#ffffff', margin: '0 0 24px', letterSpacing: '-0.03em' }}>
            Building the Stack
          </h1>
          <p style={{ fontFamily: 'Inter, ui-rounded, system-ui, sans-serif', fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,0.45)', margin: '0 0 40px' }}>
            Full analytics infrastructure for a semi-pro soccer club
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Python', 'Excel', 'API'].map(p => (
              <span key={p} style={pill}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FULL-BLEED GHOST FC VISUAL */}
      <div style={{ width: '100%', height: '60vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '10vw', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.04)', userSelect: 'none', whiteSpace: 'nowrap' }}>
          GHOST FC
        </span>
      </div>

      {/* STATS */}
      <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '80px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={statNum}>5</p>
            <p style={statLabel}>Deliverables Built</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', margin: '0 48px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={statNum}>Jan 2026</p>
            <p style={statLabel}>Start Date</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', margin: '0 48px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={statNum}>Chicago</p>
            <p style={statLabel}>Location</p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '0 48px' }}>

        <div style={divider} />
        <p style={sectionLabel}>OVERVIEW</p>
        <p style={body}>
          Chicago Ghost FC competes in USL League Two, the fourth tier of American soccer. When I joined as a player-analyst in January 2026, the club had no centralized data infrastructure. Match data lived in isolated spreadsheets, recruitment was intuition-driven, and performance tracking was entirely absent. I was both on the field and building the tooling.
        </p>

        <div style={divider} />
        <p style={sectionLabel}>DELIVERABLES</p>
        <p style={body}>
          Five core deliverables built across the engagement. A player performance dashboard tracking 40 metrics per player per match, including progressive carries, press success rate, xG contribution, and defensive actions. A recruitment scoring model weighted by position archetype. Opponent scouting reports generated from API-pulled match logs. Substitution timing analytics built on pressing intensity and fatigue proxy variables. A weekly team report automatically compiled from ingested match data.
        </p>

        <div style={divider} />
        <p style={sectionLabel}>KEY IMPACT</p>
        <p style={body}>
          Dashboards were adopted as standard pre-match preparation within the first month. The coaching staff began incorporating the substitution analytics into match-day decisions within six weeks of deployment. Recruitment conversations shifted from qualitative assessments to model-backed shortlists.
        </p>

        <div style={divider} />
        <p style={{ ...sectionLabel, paddingTop: 80 }}>BUILT WITH</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 120 }}>
          {['Python', 'Pandas', 'Excel', 'REST API', 'Data Modeling', 'Sport Analytics'].map(t => (
            <span key={t} style={pill}>{t}</span>
          ))}
        </div>

      </div>
    </main>
  );
}
