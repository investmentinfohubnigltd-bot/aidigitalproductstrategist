'use client'

import { useEffect, useState } from 'react'

const SIGNALS = [
  ['PRODUCT', 'Strategy → production'],
  ['SYSTEMS', 'AI · APIs · data'],
  ['MARKETS', 'Nigeria → Africa'],
]

export default function Hero() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  return (
    <section id="hero" className={`hero ${ready ? 'is-ready' : ''}`}>
      <div className="hero-grid" aria-hidden />
      <div className="container hero-shell">
        <div className="hero-copy">
          <div className="status-line"><span className="status-dot" /> Independent product practice · Nigeria</div>
          <h1>I turn difficult ideas into <span>working digital systems.</span></h1>
          <p className="hero-lede">
            AI product strategy, technical architecture and full-stack execution for useful products,
            especially where regulation, local-market complexity and trust matter.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">Explore selected systems <span>↘</span></a>
            <a className="button button-ghost" href="#contact">Discuss a product</a>
          </div>
        </div>

        <aside className="system-card" aria-label="Product system overview">
          <div className="system-card-bar"><span>PRODUCT.SYSTEM</span><span>v1.0</span></div>
          <div className="system-diagram">
            <div className="system-node system-node-core"><small>CORE</small><strong>Problem</strong></div>
            <div className="system-orbit orbit-one"><span>Research</span></div>
            <div className="system-orbit orbit-two"><span>Architecture</span></div>
            <div className="system-orbit orbit-three"><span>Production</span></div>
          </div>
          <div className="system-log">
            <span><b>01</b> Define the real constraint</span>
            <span><b>02</b> Design the operating logic</span>
            <span><b>03</b> Ship, instrument, improve</span>
          </div>
        </aside>

        <div className="hero-signals">
          {SIGNALS.map(([label, value]) => (
            <div key={label}><small>{label}</small><span>{value}</span></div>
          ))}
        </div>
      </div>
    </section>
  )
}
