const architecture = [
  ['01', 'Research'], ['02', 'Product logic'], ['03', 'Data'], ['04', 'AI'],
  ['05', 'APIs'], ['06', 'Interface'], ['07', 'Production'],
]

export default function Hero() {
  return (
    <section id="hero" className="hero-v3">
      <div className="hero-grid-lines" aria-hidden />
      <div className="container hero-v3-grid">
        <div className="hero-v3-main">
          <p className="kicker"><span>ADPS / Independent practice</span> Nigeria · Global outlook</p>
          <h1>Strategy is only valuable when it <em>survives production.</em></h1>
          <p className="hero-v3-lede">AI Digital Product Strategist is an independent practice shaping difficult ideas into clear product logic, robust digital systems and working software.</p>
          <div className="hero-v3-actions">
            <a href="#portfolio" className="primary-link">Explore selected work <span>↘</span></a>
            <a href="#contact" className="text-link">Start a conversation <span>→</span></a>
          </div>
        </div>
        <aside className="architecture-card" aria-label="End-to-end product architecture">
          <div className="architecture-head"><span>PRODUCT ARCHITECTURE</span><span>END-TO-END / 01</span></div>
          <div className="architecture-field">
            <svg viewBox="0 0 460 360" role="img" aria-label="Connected product development layers">
              <defs><linearGradient id="signal" x1="0" x2="1"><stop stopColor="#705b37"/><stop offset=".5" stopColor="#d4b074"/><stop offset="1" stopColor="#705b37"/></linearGradient></defs>
              <path className="signal-path" d="M45 180 C105 180 95 75 165 75 S225 180 285 180 S350 75 415 75" />
              <path className="signal-path signal-path-2" d="M45 180 C105 180 95 285 165 285 S225 180 285 180 S350 285 415 285" />
              <circle className="pulse-ring" cx="230" cy="180" r="61" />
              <circle className="pulse-ring ring-2" cx="230" cy="180" r="92" />
              <g className="core-node"><rect x="176" y="139" width="108" height="82" rx="2"/><text x="230" y="173">PRODUCT</text><text className="core-sub" x="230" y="195">SYSTEM</text></g>
              <g className="edge-node"><circle cx="45" cy="180" r="7"/><text x="45" y="159">RESEARCH</text></g>
              <g className="edge-node"><circle cx="165" cy="75" r="7"/><text x="165" y="54">STRATEGY</text></g>
              <g className="edge-node"><circle cx="165" cy="285" r="7"/><text x="165" y="317">DATA</text></g>
              <g className="edge-node"><circle cx="285" cy="180" r="7"/><text x="305" y="185">AI / API</text></g>
              <g className="edge-node"><circle cx="415" cy="75" r="7"/><text x="415" y="54">INTERFACE</text></g>
              <g className="edge-node"><circle cx="415" cy="285" r="7"/><text x="415" y="317">PRODUCTION</text></g>
            </svg>
          </div>
          <div className="architecture-stack">
            {architecture.map(([number, label]) => <span key={number}><b>{number}</b>{label}</span>)}
          </div>
        </aside>
      </div>
      <div className="hero-v3-footer container"><span>ADPS / From Nigeria to the world</span><span>Product strategy · AI · full-stack systems</span></div>
    </section>
  )
}
