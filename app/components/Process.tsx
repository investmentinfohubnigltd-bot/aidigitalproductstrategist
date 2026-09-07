const stages = [
  ['01', 'Investigate', 'Understand the user, market, constraint and regulatory environment.'],
  ['02', 'Architect', 'Define the product logic, boundaries, flows and technical shape.'],
  ['03', 'Build', 'Develop a coherent system with disciplined scope and production quality.'],
  ['04', 'Validate', 'Test the journeys, edge cases and operating assumptions before scale.'],
]

export default function Process() {
  return (
    <section id="process" className="section-v3 section-warm">
      <div className="container">
        <div className="section-topline dark-line"><p className="section-mark">04 / Method</p><p>Evidence before scope. Architecture before decoration.</p></div>
        <div className="process-v3">
          {stages.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </div>
    </section>
  )
}
