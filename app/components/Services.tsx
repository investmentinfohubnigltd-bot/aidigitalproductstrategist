const services = [
  { code: '01', title: 'Product Strategy & Architecture', text: 'Problem definition, market and regulatory research, business logic, data flows, technical scope and a buildable product roadmap.', output: 'Strategy · PRD · architecture' },
  { code: '02', title: 'AI-Native Product Development', text: 'Production-grade web products with purposeful AI, secure data patterns, API integrations, authentication, payments and operational tooling.', output: 'MVP · platform · automation' },
  { code: '03', title: 'Product Recovery & Repositioning', text: 'A rigorous review of an existing product, followed by sharper positioning, repaired user journeys and a realistic route to adoption.', output: 'Audit · redesign · growth logic' },
  { code: '04', title: 'Technical Product Advisory', text: 'Independent technical judgement for founders and institutions making product, vendor, architecture or go-to-market decisions.', output: 'Decision support · oversight' },
]

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">Capabilities</p><h2>From ambiguity to an operating product.</h2></div>
          <p>One accountable product layer from discovery through deployment.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <article className="service-card" key={service.code}>
              <div className="service-code">/{service.code}</div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <footer>{service.output}</footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
