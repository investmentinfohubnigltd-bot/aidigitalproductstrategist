const steps = [
  { num: 'I', title: 'We scope it together', desc: 'A focused conversation to understand what you are building, why it matters, and what it needs to do. No assumptions, no unnecessary features, no wasted time.' },
  { num: 'II', title: 'I develop it, end to end', desc: 'Design, development, database, and deployment — handled completely. You will see progress early and often, not just at the finish line. Communication is direct, always.' },
  { num: 'III', title: 'It goes live, properly', desc: 'A working product, deployed, tested, and ready for real users from day one. Not a prototype. Something finished — to a standard that holds.' },
]

export default function Process() {
  return (
    <section id="process" className="section" style={{ background: 'var(--ink)' }}>
      <div className="container">
        <p className="eyebrow reveal" style={{ marginBottom: '48px' }}>How it works</p>
        <h2 className="reveal" style={{
          fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 'clamp(42px, 5.5vw, 74px)',
          lineHeight: 1.06, letterSpacing: '-0.02em', color: 'var(--parchment)', marginBottom: '72px',
        }}>
          From first message<br />to <em style={{ color: 'var(--gold)' }}>live product.</em>
        </h2>
        <div style={{ borderTop: '1px solid var(--rule)' }}>
          {steps.map((s, i) => (
            <div key={s.num} className={`reveal process-step-grid reveal-d${i + 1}`} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '56px',
              alignItems: 'start', padding: '56px 0', borderBottom: '1px solid var(--rule)',
            }}>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 300, fontStyle: 'italic',
                fontSize: '19px', color: 'var(--gold)', letterSpacing: '0.05em', paddingTop: '6px',
              }}>{s.num}</div>
              <div className="ps-title-cell" style={{
                fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '32px',
                color: 'var(--parchment)', lineHeight: 1.15, letterSpacing: '-0.01em',
              }}>{s.title}</div>
              <div className="ps-desc-cell" style={{
                fontSize: '14px', fontWeight: 300, color: 'var(--secondary)', lineHeight: 1.9, paddingTop: '8px',
              }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
