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

export default function RemoteWorkPage() {
  return (
    <main style={{ background: '#000', minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '0 48px 80px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 32px' }}>
            003 · ECONOMETRICS
          </p>
          <h1 style={{ fontFamily: 'Inter, ui-rounded, system-ui, sans-serif', fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 700, lineHeight: 0.95, color: '#ffffff', margin: '0 0 24px', letterSpacing: '-0.03em' }}>
            Does Remote Work Close the Gap?
          </h1>
          <p style={{ fontFamily: 'Inter, ui-rounded, system-ui, sans-serif', fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,0.45)', margin: '0 0 40px' }}>
            OLS regression on gender, telework, and wages using IPUMS CPS data
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Regression', 'Labor Economics', 'IPUMS CPS'].map(p => (
              <span key={p} style={pill}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FULL-BLEED IMAGE */}
      <img
        src="/regression.jpg"
        alt="Regression output"
        style={{ width: '100%', height: '60vh', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
      />

      {/* STATS */}
      <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '80px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <p style={statNum}>3</p>
            <p style={statLabel}>Interaction Terms</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', margin: '0 48px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={statNum}>2022</p>
            <p style={statLabel}>Data Year</p>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.08)', alignSelf: 'stretch', margin: '0 48px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={statNum}>IPUMS CPS</p>
            <p style={statLabel}>Dataset</p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '0 48px' }}>

        <div style={divider} />
        <p style={sectionLabel}>THE QUESTION</p>
        <p style={body}>
          Does access to remote work meaningfully reduce the gender wage gap, and does that effect vary by occupation and industry? The post-pandemic expansion of telework eligibility created sharp identifying variation across occupations, making it possible to isolate the effect of remote access from confounding job characteristics.
        </p>

        <div style={divider} />
        <p style={sectionLabel}>THE MODEL</p>
        <p style={body}>
          OLS regression on log hourly wages using IPUMS CPS 2022 microdata. Key variables: female indicator, telework eligibility flag, and a three-way interaction term (Female x Remote x Industry). Controls include education, potential experience, hours worked per week, occupation fixed effects, and state fixed effects. Heteroskedasticity-robust standard errors throughout.
        </p>

        <div style={divider} />
        <p style={sectionLabel}>LITERATURE</p>
        <p style={body}>
          Prior literature on flexible work and the gender gap shows mixed results. Goldin (2014) documented a temporal flexibility penalty, particularly in high-hour professions. Mas and Pallais (2017) found flexibility premiums in white-collar roles. Bloom et al. (2015) showed productivity gains from remote arrangements but limited wage effects. This paper extends that work to the post-2020 remote eligibility landscape, where the variation is broader and more plausibly exogenous.
        </p>

        <div style={divider} />
        <p style={{ ...sectionLabel, paddingTop: 80 }}>BUILT WITH</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 120 }}>
          {['R', 'OLS Regression', 'IPUMS CPS', 'Labor Economics', 'Econometrics', 'stargazer'].map(t => (
            <span key={t} style={pill}>{t}</span>
          ))}
        </div>

      </div>
    </main>
  );
}
