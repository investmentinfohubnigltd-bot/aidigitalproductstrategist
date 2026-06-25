export default function About() {
  const domains = [
    ['Product Strategy & Architecture', 'Core'],
    ['Full-Stack Product Development', 'Core'],
    ['Brand & Content Strategy', 'Core'],
    ['Fintech & Financial Platforms', 'Specialist'],
    ['Luxury Digital Experiences', 'Specialist'],
    ['Aviation & Consumer Rights', 'Specialist'],
    ['Data Dashboards & Automation', 'Specialist'],
    ['Identity Protection & Security', 'Specialist'],
  ]

  return (
    <section id="about" style={{
      padding: '140px 60px', borderTop: '1px solid var(--rule)',
      background: 'var(--lift)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p className="reveal" style={{
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: 'var(--gold)',
          marginBottom: '80px', display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          About
          <span style={{ flex: 1, height: '1px', background: 'var(--rule)', maxWidth: '80px' }} />
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '120px', alignItems: 'start' }}>
          <div className="reveal reveal-d1" style={{
            fontFamily: "'Cormorant Garamond', 'Palatino Linotype', Georgia, serif",
            fontWeight: 300, fontStyle: 'italic', fontSize: '28px',
            lineHeight: 1.65, color: 'var(--parchment)',
            position: 'sticky', top: '100px',
          }}>
            I build things that work — and I build them to a standard most developers never reach.
            <br /><br />
            <strong style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--gold)' }}>
              That difference is the product.
            </strong>
          </div>

          <div>
            {[
              'Most developers know how to write code. Fewer understand the industries they are building for — the regulations, the user psychology, the market dynamics. I bring both to every project.',
              'Eight live products across different categories, each built from idea to deployment without a team, an agency, or a six-week kickoff meeting. That is not luck — it is a repeatable process honed across every single build.',
              'Whether you need a product built from scratch, a platform scaled, or a brand and content strategy that converts — I work with founders and businesses who want things done properly and done fast.',
            ].map((p, i) => (
              <p key={i} className={`reveal reveal-d${i + 1}`} style={{
                fontSize: '15px', fontWeight: 300, lineHeight: 1.9,
                color: 'var(--secondary)', marginBottom: '28px',
              }}>{p}</p>
            ))}

            <div className="reveal" style={{ marginTop: '60px' }}>
              {domains.map(([name, tag], i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 0', borderBottom: '1px solid var(--rule)',
                  ...(i === 0 ? { borderTop: '1px solid var(--rule)' } : {}),
                  fontSize: '13px', fontWeight: 400, letterSpacing: '0.04em',
                  color: 'var(--parchment)',
                }}>
                  {name}
                  <span style={{
                    fontSize: '10px', letterSpacing: '0.2em',
                    textTransform: 'uppercase', color: 'var(--tertiary)',
                  }}>{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
