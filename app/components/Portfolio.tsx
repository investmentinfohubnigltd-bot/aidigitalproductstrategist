import Link from 'next/link'

const systems = [
  { name: 'CheckVIN.ng', sector: 'Automotive intelligence', href: 'https://checkvin.ng', signal: 'LIVE', text: 'VIN decoding and Nigerian import-verification workflows, including eligibility logic and paid report fulfilment.', tech: ['API orchestration', 'payments', 'PDF reports'] },
  { name: 'VivaVeri', sector: 'Identity assurance', href: 'https://vivaveri.com', signal: 'SYSTEM', text: 'Provider-neutral life-status assurance with maker-checker controls, policy evaluation and minimum-data orchestration.', tech: ['policy engine', 'audit layer', 'privacy by design'] },
  { name: 'WingWatch', sector: 'Aviation consumer rights', href: 'https://wingwatch.ng', signal: 'LIVE', text: 'A disruption-to-claim journey that turns flight events into rights information, evidence and claims support.', tech: ['event workflows', 'case management', 'payments'] },
  { name: 'ScamProtect.ng', sector: 'Consumer protection', href: 'https://scamprotect.ng', signal: 'LIVE', text: 'A public-interest verification system designed to help people check suspicious offers before acting.', tech: ['search', 'risk signals', 'regulated boundaries'] },
  { name: 'InsightEx', sector: 'Financial intelligence', href: 'https://dashboard.investmentinfohubnigeria.com', signal: 'LIVE', text: 'An education-first market-intelligence platform covering Nigerian equities, FX, macro and fixed income.', tech: ['data pipelines', 'scheduled updates', 'analytics'] },
  { name: 'Huiyan-NG', sector: 'Trade intelligence', href: 'https://huiyan-ng.com', signal: 'LIVE', text: 'A Nigeria-China landed-cost and import-readiness system with policy-aware calculations and trade documentation logic.', tech: ['calculation engine', 'trade rules', 'decision support'] },
  { name: 'Football FanIQ', sector: 'Sports technology', href: 'https://footballfaniq.com', signal: 'LIVE', text: 'A football PWA combining match intelligence, private leagues, fan tools and broadcast discovery across 195 countries.', tech: ['PWA', 'real-time data', 'community systems'] },
  { name: 'ClaimLensIQ', sector: 'Insurance technology', href: 'https://claimlensiq.com', signal: 'PILOT', text: 'Structured claims intelligence for insurers, built to strengthen review quality and operational consistency.', tech: ['claims workflow', 'AI assistance', 'institutional controls'] },
]

export default function Portfolio() {
  return (
    <section id="work" className="section work-section">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">Selected systems</p><h2>Products built around real operating constraints.</h2></div>
          <p>Selected work across consumer, enterprise and regulated-market contexts.</p>
        </div>
        <div className="work-grid">
          {systems.map((item, index) => (
            <a className="work-card" key={item.name} href={item.href} target="_blank" rel="noopener noreferrer">
              <header><span>{String(index + 1).padStart(2, '0')}</span><b>{item.signal}</b></header>
              <div className="work-sector">{item.sector}</div>
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <div className="work-tags">{item.tech.map(t => <span key={t}>{t}</span>)}</div>
              <footer><span>View system</span><i>↗</i></footer>
            </a>
          ))}
        </div>
        <div className="work-note">
          <div><span className="status-dot" /> Portfolio architecture</div>
          <p>These products are developed through independent product practice and consulting work. Selected Aurum Digital Consulting systems are represented in line with my public role as IP Consultant and Product Strategist.</p>
          <Link href="/ask">Ask the Strategist ↗</Link>
        </div>
      </div>
    </section>
  )
}
