const ITEMS = [
  'HIRING AI', 'LOAN APPROVAL', 'HEALTHCARE AI', 'CREDIT SCORING',
  'CRIMINAL JUSTICE', 'ADMISSIONS', 'CONTENT MODERATION', 'FACIAL RECOGNITION',
]

function TickerRow({ reverse = false }: { reverse?: boolean }) {
  const doubled = [...ITEMS, ...ITEMS]

  return (
    <div className="overflow-hidden py-1">
      <div className={`flex gap-0 whitespace-nowrap ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center font-syne text-xs tracking-[0.25em] uppercase text-textMuted">
            {item}
            <span className="text-accent mx-6">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Ticker() {
  return (
    <div
      className="bg-surface border-y border-bs-border py-5 overflow-hidden"
      style={{ transform: 'skewY(-1deg)', margin: '-4px 0' }}
    >
      <div style={{ transform: 'skewY(1deg)' }}>
        <TickerRow />
        <TickerRow reverse />
      </div>
    </div>
  )
}
