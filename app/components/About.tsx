const capabilities = [
  'Product strategy', 'System architecture', 'AI integration', 'Full-stack development',
  'API orchestration', 'Data modelling', 'RegTech', 'Go-to-market systems',
]

export default function About() {
  return (
    <section id="about" className="section section-light">
      <div className="container about-layout">
        <div>
          <p className="eyebrow">Positioning</p>
          <h2>Technical depth is useful only when it solves the right problem.</h2>
        </div>
        <div className="about-copy">
          <p className="about-lead">
            I work at the intersection of product judgement, market intelligence and software execution.
            The result is not merely a website or an app. It is a coherent product system built around how
            users, institutions and operating environments actually behave.
          </p>
          <p>
            My work spans consumer platforms, enterprise workflows and regulated-market infrastructure.
            I research the domain, define the product logic, shape the interface and take the system into production.
          </p>
          <div className="capability-cloud">
            {capabilities.map((item, index) => <span key={item}><b>{String(index + 1).padStart(2, '0')}</b>{item}</span>)}
          </div>
        </div>
      </div>
    </section>
  )
}
