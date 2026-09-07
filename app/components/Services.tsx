const services = [
  ['A', 'New Product Development', 'From early concept through research, architecture, interface, engineering and launch.'],
  ['B', 'Product Recovery', 'Diagnose unclear positioning, weak journeys or technical friction, then rebuild the product around a sharper thesis.'],
  ['C', 'AI & Automation', 'Apply AI where it improves the product, with clear boundaries, dependable workflows and human oversight.'],
  ['D', 'Technical Product Advisory', 'Independent judgement for product scope, vendors, architecture, data, risk and go-to-market decisions.'],
]

export default function Services() {
  return (
    <section id="services" className="section-v3 section-deep">
      <div className="container">
        <div className="section-topline"><p className="section-mark">02 / Capabilities</p><p>Focused engagements. End-to-end accountability.</p></div>
        <div className="services-v3">
          {services.map(([code, title, text]) => (
            <article key={code}><span className="service-letter">{code}</span><div><h3>{title}</h3><p>{text}</p><a href="#contact">Discuss this engagement <span>↗</span></a></div></article>
          ))}
        </div>
      </div>
    </section>
  )
}
