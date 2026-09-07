const capabilities = [
  ['01', 'Product Strategy', 'Positioning, validation, commercial logic and product roadmaps grounded in real market behaviour.'],
  ['02', 'System Architecture', 'User journeys, data models, API boundaries, workflows and operational controls before code hardens assumptions.'],
  ['03', 'Technical Execution', 'Full-stack products, AI integrations, payments, dashboards and deployment carried through to production.'],
  ['04', 'Institutional Thinking', 'Products shaped for trust, privacy, regulation and the realities of complex African markets.'],
]

export default function About() {
  return (
    <section id="about" className="section-v3 section-warm">
      <div className="container">
        <div className="editorial-heading">
          <p className="section-mark">01 / Approach</p>
          <h2>I do not separate the product decision from the technical decision.</h2>
          <p className="editorial-intro">The strongest products emerge when market understanding, business logic, user experience and engineering are treated as one continuous discipline.</p>
        </div>
        <div className="capability-list">
          {capabilities.map(([number, title, text]) => (
            <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </div>
    </section>
  )
}
