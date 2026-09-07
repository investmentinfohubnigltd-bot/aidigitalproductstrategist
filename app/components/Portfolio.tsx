import Link from 'next/link'

const signatures = [
  {
    number: '01', name: 'CheckVIN.ng', field: 'Automotive intelligence', href: 'https://checkvin.ng',
    thesis: 'Make an opaque vehicle decision legible before money changes hands.',
    system: 'VIN intelligence, import-age eligibility and paid import-status reporting in one focused buyer journey.',
    architecture: ['Next.js', 'Vehicle data APIs', 'Paystack', 'Report engine'],
  },
  {
    number: '02', name: 'VivaVeri', field: 'Institutional identity assurance', href: 'https://vivaveri.com',
    thesis: 'Let institutions verify life-status signals without becoming a new custodian of sensitive identity data.',
    system: 'A provider-neutral orchestration, policy and audit layer designed around minimum-necessary signals.',
    architecture: ['Policy engine', 'Provider orchestration', 'Audit trails', 'Privacy by design'],
  },
  {
    number: '03', name: 'InsightEx', field: 'Financial information systems', href: 'https://dashboard.investmentinfohubnigeria.com',
    thesis: 'Turn fragmented market information into a structured educational intelligence experience.',
    system: 'Source-led coverage across Nigerian equities, FX, macroeconomic indicators and fixed income.',
    architecture: ['Data pipelines', 'Source controls', 'Analytics', 'Information UX'],
  },
]

export default function Portfolio() {
  return (
    <section id="portfolio" className="section-v3 section-portfolio">
      <div className="container">
        <div className="editorial-heading portfolio-heading">
          <p className="section-mark">03 / Signature work</p>
          <h2>Three systems. Three difficult problems made operational.</h2>
          <p className="editorial-intro">A focused view of the product judgement, architecture and execution behind the practice.</p>
        </div>

        <div className="signature-list">
          {signatures.map((item) => (
            <article className="signature-case" key={item.name}>
              <header className="signature-index"><span>{item.number}</span><small>CASE / {item.field}</small></header>
              <div className="signature-title">
                <h3>{item.name}</h3>
                <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.name}`}>View live system <span>↗</span></a>
              </div>
              <div className="signature-detail">
                <div><small>PRODUCT THESIS</small><p>{item.thesis}</p></div>
                <div><small>SYSTEM RESPONSE</small><p>{item.system}</p></div>
                <div className="architecture-tags"><small>TECHNICAL SURFACE</small><ul>{item.architecture.map((layer) => <li key={layer}>{layer}</li>)}</ul></div>
              </div>
            </article>
          ))}
        </div>

        <div className="archive-cta">
          <div><span>BEYOND THE SIGNATURE THREE</span><p>Additional work across aviation, consumer protection, trade, insurance, sport and legal technology.</p></div>
          <Link href="/systems">Open systems archive <span>→</span></Link>
        </div>
      </div>
    </section>
  )
}
