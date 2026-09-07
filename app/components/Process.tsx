const phases = [
  ['01', 'Understand', 'Research the problem, user, market, regulation and current operating reality.'],
  ['02', 'Define', 'Convert evidence into product logic, boundaries, flows and measurable outcomes.'],
  ['03', 'Engineer', 'Design and build the smallest complete system that can carry real usage.'],
  ['04', 'Validate', 'Test the journeys, edge cases, security assumptions and operational readiness.'],
  ['05', 'Evolve', 'Use real signals to improve adoption, reliability and commercial performance.'],
]

export default function Process() {
  return (
    <section id="process" className="section section-light">
      <div className="container">
        <p className="eyebrow">Operating method</p>
        <div className="process-heading"><h2>A disciplined build loop.</h2><p>Evidence before scope. Architecture before decoration. Validation before scale.</p></div>
        <div className="process-track">
          {phases.map(([n, title, description]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </div>
    </section>
  )
}
