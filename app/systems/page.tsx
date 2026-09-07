import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Systems Archive',
  description: 'Additional product systems shaped across consumer, institutional and regulated-market contexts.',
}

const systems = [
  ['WingWatch', 'Aviation consumer rights', 'https://wingwatch.ng', 'Flight disruption intelligence, evidence capture and claims-support journeys.'],
  ['ScamProtect.ng', 'Consumer protection', 'https://scamprotect.ng', 'Public-interest verification designed to help people examine suspicious offers before acting.'],
  ['Huiyan-NG', 'Trade intelligence', 'https://huiyan-ng.com', 'Nigeria–China landed-cost calculations and import-readiness logic.'],
  ['Football FanIQ', 'Sports technology', 'https://footballfaniq.com', 'A football PWA combining match intelligence, private leagues and practical fan tools.'],
  ['VivaVeri', 'Institutional identity assurance', 'https://vivaveri.com', 'A provider-neutral life-status assurance, policy-orchestration and audit system in development.'],
  ['Cloakra', 'Identity protection', 'https://cloakra.com', 'Digital identity-protection infrastructure for public figures and institutions.'],
  ['TradeSprint', 'Trade compliance', 'https://tradesprint.ng', 'A cargo-clearance companion for importers and trade operators.'],
  ['LearnedIQ', 'Legal technology', 'https://learnediq.ng', 'Plain-language legal knowledge organised around practical everyday questions.'],
  ['Ask the Strategist', 'AI product mentorship', '/ask', 'An AI mentor grounded in original product frameworks and African market realities.'],
]

export default function SystemsArchive() {
  return (
    <main className="archive-page">
      <nav className="archive-nav container" aria-label="Archive navigation">
        <Link href="/" className="v3-brand"><span className="brand-bracket">[</span>ADPS<span className="brand-bracket">]</span></Link>
        <Link href="/">Return to practice <span>↖</span></Link>
      </nav>
      <header className="archive-hero container">
        <p className="section-mark">SYSTEMS ARCHIVE / 09</p>
        <h1>The wider body of work.</h1>
        <p>Additional systems spanning consumer, enterprise and regulated-market contexts. The archive is supporting evidence, not the centre of the practice.</p>
      </header>
      <section className="archive-grid container" aria-label="Additional systems">
        {systems.map(([name, field, href, description], index) => {
          const body = <><header><span>{String(index + 1).padStart(2, '0')}</span><small>{field}</small></header><h2>{name}</h2><p>{description}</p><footer>Examine system <span>↗</span></footer></>
          return href.startsWith('/')
            ? <Link href={href} key={name}>{body}</Link>
            : <a href={href} target="_blank" rel="noopener noreferrer" key={name}>{body}</a>
        })}
      </section>
      <footer className="archive-footer container"><span>ADPS · AI Digital Product Strategist</span><Link href="/#contact">Discuss a product problem <span>→</span></Link></footer>
    </main>
  )
}
