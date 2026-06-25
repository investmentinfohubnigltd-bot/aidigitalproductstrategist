const steps = [
  { num: 'I', title: 'We scope it together', desc: 'A focused conversation to understand what you are building, why it matters, and what it needs to do. No assumptions, no unnecessary features, no wasted time.' },
  { num: 'II', title: 'I build it, end to end', desc: 'Design, development, database, and deployment — handled completely. You will see progress early and often, not just at the finish line. Communication is direct, always.' },
  { num: 'III', title: 'It goes live, properly', desc: 'A working product, deployed, tested, and ready for real users from day one. Not a prototype. Something finished — to a standard that holds.' },
]

export default function Process() {
  return (
    <section id="process" className="section-pad" style={{
      padding: '140px 60px', borderTop: '1px solid var(--rule)',
      background: 'var(--ink)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p className="reveal" style={{
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--gold)',
          marginBottom: '80px', display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          How it works
          <span style={{ flex: 1, height: '1px', background: 'var(--rule)', maxWidth: '80px' }} />
        </p>
        <h2 className="reveal" style={{
          fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
          fontWeight: 300, fontSize: 'clamp(44px, 5.5vw, 72px)',
          lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--parchment)',
          marginBottom: '80px',
        }}>
          From first message<br />to <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>live product.</em>
        </h2>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {steps.map((s, i) => (
            <div key={s.num} className={`reveal process-step-grid reveal-d${i + 1}`} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 1fr',
              gap: '60px', alignItems: 'start',
              padding: '60px 0', borderBottom: '1px solid var(--rule)',
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
                fontWeight: 300, fontStyle: 'italic', fontSize: '18px',
                color: 'var(--gold)', letterSpacing: '0.05em', paddingTop: '4px',
              }}>{s.num}</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
                fontWeight: 400, fontSize: '32px', color: 'var(--parchment)', lineHeight: 1.2,
              }}>{s.title}</div>
              <div style={{
                fontSize: '14px', fontWeight: 300, color: 'var(--secondary)',
                lineHeight: 1.9, paddingTop: '6px',
              }} className="ps-desc-cell">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
