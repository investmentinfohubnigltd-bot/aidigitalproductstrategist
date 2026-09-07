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

  const paragraphs = [
    'Most developers know how to write code. Fewer understand the industries they are developing for — the regulations, the user psychology, the market dynamics. I bring both to every project.',
    'Twelve products across eleven industries, each developed from idea to deployment without a team, an agency, or a six-week kickoff meeting. That is not luck — it is a repeatable process honed across every single one.',
    'Whether you need a product developed from scratch, a platform scaled, or a brand and content strategy that converts — I work with founders and businesses who want things done properly and done fast.',
  ]

  return (
    <section id="about" className="section" style={{ background: 'var(--lift)' }}>
      <div className="container">
        <p className="eyebrow reveal" style={{ marginBottom: '72px' }}>About</p>

        <div className="about-grid-wrap" style={{
          display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '112px', alignItems: 'start',
        }}>
          <p className="reveal reveal-d1 about-statement-text" style={{
            fontFamily: 'var(--font-serif)', fontWeight: 300, fontStyle: 'italic',
            fontSize: '29px', lineHeight: 1.5, color: 'var(--parchment)',
            position: 'sticky', top: '108px', margin: 0,
          }}>
            I develop things that work — and I develop them to a standard most developers never reach.
            <br /><br />
            <strong style={{ fontStyle: 'normal', fontWeight: 600, color: 'var(--gold)' }}>
              That difference is the product.
            </strong>
          </p>

          <div>
            {paragraphs.map((p, i) => (
              <p key={i} className={`reveal reveal-d${i + 1}`} style={{
                fontSize: '15px', fontWeight: 300, lineHeight: 1.85,
                color: 'var(--secondary)', marginBottom: '26px',
              }}>{p}</p>
            ))}

            <div className="reveal" style={{ marginTop: '56px' }}>
              {domains.map(([name, tag], i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '17px 0', borderBottom: '1px solid var(--rule)',
                  ...(i === 0 ? { borderTop: '1px solid var(--rule)' } : {}),
                  fontSize: '13px', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--parchment)',
                }}>
                  {name}
                  <span style={{
                    fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
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
