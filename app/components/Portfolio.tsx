import Link from 'next/link'

const products = [
  ['CheckVIN.ng', 'Automotive intelligence', 'https://checkvin.ng', 'LIVE', 'VIN decoding, import-age eligibility and paid import-status reporting for vehicle buyers.'],
  ['VivaVeri', 'Identity assurance', 'https://vivaveri.com', 'SYSTEM', 'Provider-neutral life-status assurance, policy orchestration and auditable institutional controls.'],
  ['WingWatch', 'Aviation consumer rights', 'https://wingwatch.ng', 'LIVE', 'Flight disruption intelligence, evidence capture and claims-support journeys.'],
  ['ScamProtect.ng', 'Consumer protection', 'https://scamprotect.ng', 'LIVE', 'A public-interest verification platform helping people check suspicious offers before acting.'],
  ['InsightEx', 'Financial intelligence', 'https://dashboard.investmentinfohubnigeria.com', 'LIVE', 'Education-first intelligence across Nigerian equities, FX, macro and fixed income.'],
  ['Huiyan-NG', 'Trade intelligence', 'https://huiyan-ng.com', 'LIVE', 'Nigeria-China landed-cost calculations and import-readiness logic.'],
  ['Football FanIQ', 'Sports technology', 'https://footballfaniq.com', 'LIVE', 'A football PWA combining match intelligence, private leagues and fan tools.'],
  ['ClaimLensIQ', 'Insurance technology', 'https://claimlensiq.com', 'PILOT', 'Structured claims intelligence designed for consistent institutional review.'],
  ['Cloakra', 'Identity protection', 'https://cloakra.com', 'SYSTEM', 'Digital identity-protection infrastructure for public figures and institutions.'],
  ['TradeSprint', 'Trade compliance', 'https://tradesprint.ng', 'LIVE', 'A cargo-clearance companion for importers and trade operators.'],
  ['LearnedIQ', 'Legal technology', 'https://learnediq.ng', 'SYSTEM', 'Plain-language legal knowledge designed around practical everyday questions.'],
  ['Ask the Strategist', 'AI product mentorship', '/ask', 'LIVE', 'An AI mentor built around original product frameworks and African market realities.'],
]

export default function Portfolio() {
  return (
    <section id="portfolio" className="section-v3 section-portfolio">
      <div className="container">
        <div className="editorial-heading portfolio-heading">
          <p className="section-mark">03 / Selected systems</p>
          <h2>Proof of thinking, expressed as working products.</h2>
          <p className="editorial-intro">Selected systems across consumer, enterprise and regulated-market contexts.</p>
        </div>
        <div className="portfolio-v3">
          {products.map(([name, sector, href, status, description], index) => {
            const content = <><header><span>{String(index + 1).padStart(2, '0')}</span><b>{status}</b></header><small>{sector}</small><h3>{name}</h3><p>{description}</p><footer>Examine product <span>↗</span></footer></>
            return href.startsWith('/') ? <Link href={href} key={name}>{content}</Link> : <a href={href} target="_blank" rel="noopener noreferrer" key={name}>{content}</a>
          })}
        </div>
      </div>
    </section>
  )
}
