import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

const ITEMS = [
  {
    label: 'Google Solution Challenge 2026',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: 'SDG 10 — Reduced Inequalities',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3L4 7v4c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V7l-8-4z" />
      </svg>
    ),
  },
  {
    label: '100% open-source core',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    label: 'Zero cost to start',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <text x="12" y="16" textAnchor="middle" fill="#E8FF47" fontSize="10" fontFamily="sans-serif">₹</text>
      </svg>
    ),
  },
]

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function CredibilityStrip() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <div ref={ref} className="bg-surface border-y border-bs-border py-10 px-6 md:px-12">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left justify-center"
            initial={reduced ? {} : { opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            {item.icon}
            <span className="font-dm text-sm text-textSecondary leading-tight">{item.label}</span>
            {i < ITEMS.length - 1 && (
              <span className="hidden md:block w-px h-8 bg-bs-border ml-auto" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
