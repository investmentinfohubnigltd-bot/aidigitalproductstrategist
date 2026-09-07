const layers = [
  ['STRATEGY', 'Market logic · validation · positioning'],
  ['APPLICATION', 'Next.js · React · TypeScript'],
  ['INTELLIGENCE', 'LLMs · automation · decision systems'],
  ['DATA', 'Postgres · Supabase · analytics'],
  ['INFRASTRUCTURE', 'APIs · payments · cloud deployment'],
]

export default function StackSignal() {
  return (
    <section className="stack-signal" aria-label="Technical stack">
      <div className="container">
        <div className="stack-signal-head"><span>TECHNICAL FINGERPRINT</span><span>05 INTERCONNECTED LAYERS</span></div>
        <div className="stack-layers">
          {layers.map(([name, detail], index) => <div key={name}><span>0{index + 1}</span><strong>{name}</strong><p>{detail}</p><i aria-hidden /></div>)}
        </div>
      </div>
    </section>
  )
}
