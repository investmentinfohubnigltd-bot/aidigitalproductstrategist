const disciplines = ['Product strategy', 'AI systems', 'Full-stack development', 'Regulated markets']

export default function Hero() {
  return (
    <section id="hero" className="hero-v3">
      <div className="container hero-v3-grid">
        <div className="hero-v3-main">
          <p className="kicker"><span>Independent practice</span> Nigeria · Global outlook</p>
          <h1>Strategy is only valuable when it <em>survives production.</em></h1>
          <p className="hero-v3-lede">
            I shape difficult ideas into clear product logic, robust digital systems and working software.
          </p>
          <div className="hero-v3-actions">
            <a href="#portfolio" className="primary-link">Explore selected work <span>↘</span></a>
            <a href="#contact" className="text-link">Start a conversation <span>→</span></a>
          </div>
        </div>
        <aside className="practice-index">
          <div className="practice-index-head"><span>Practice index</span><span>01—04</span></div>
          <ol>
            {disciplines.map((item, index) => <li key={item}><span>0{index + 1}</span><strong>{item}</strong></li>)}
          </ol>
          <p>Research-led. Architecture-minded. Built for real operating conditions.</p>
        </aside>
      </div>
      <div className="hero-v3-footer container">
        <span>From Nigeria to the world</span><span>Scroll to examine the work</span>
      </div>
    </section>
  )
}
