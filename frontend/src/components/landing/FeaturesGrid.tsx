import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'

const FEATURES = [
  {
    title: 'Dataset Audit',
    desc: 'Scan for bias before a line of training runs.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
  },
  {
    title: 'FairScore API',
    desc: 'One REST call. An ethics rating for any model.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 11-.001 20.001A10 10 0 0112 2z" />
        <path d="M12 12m-3 0a3 3 0 106 0" />
        <line x1="12" y1="2" x2="12" y2="12" />
        <line x1="12" y1="12" x2="18.5" y2="8.5" />
      </svg>
    ),
  },
  {
    title: 'SHAP Explainer',
    desc: 'Feature-by-feature attribution. No black boxes.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="4" rx="1" />
        <rect x="2" y="10" width="20" height="4" rx="1" fill="#E8FF4730" />
        <rect x="2" y="17" width="20" height="4" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Counterfactuals',
    desc: 'Actionable paths from rejected to approved.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="6" y1="3" x2="6" y2="15" />
        <path d="M6 15c0 0 4-4 8-4s8 4 8 4" />
        <path d="M6 15c0 0 4 4 8 4" />
        <circle cx="6" cy="3" r="2" />
        <circle cx="14" cy="19" r="2" />
        <circle cx="22" cy="15" r="2" />
      </svg>
    ),
  },
  {
    title: 'NLP Scanner',
    desc: 'Catch bias in job descriptions. India-first.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <rect x="8" y="16" width="5" height="2" rx="0.5" fill="#E8FF4750" stroke="none" />
        <line x1="8" y1="10" x2="16" y2="10" />
      </svg>
    ),
  },
  {
    title: 'Drift Monitor',
    desc: 'Fairness degrades silently. We surface it early.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
]

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      className="bg-surface p-8 flex flex-col gap-4 cursor-default relative overflow-hidden"
      initial={reduced ? {} : { opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
      whileHover={reduced ? {} : {
        y: -4,
        backgroundColor: '#16161A',
        boxShadow: 'inset 0 0 0 1px #E8FF4730, 0 0 40px 0 #E8FF4708',
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div>{feature.icon}</div>
      <h3 className="font-syne font-bold text-[17px] text-white">{feature.title}</h3>
      <p className="font-dm text-sm text-textMuted leading-relaxed">{feature.desc}</p>

      <AnimatePresence>
        {hovered && (
          <motion.span
            className="text-accent text-base font-dm absolute bottom-8 right-8"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FeaturesGrid() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">EVERYTHING YOU NEED</span>
        <h2 className="font-syne font-bold text-4xl md:text-5xl text-textPrimary mt-4">
          Six modules. One platform.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-bs-border">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} index={i} />
        ))}
      </div>
    </section>
  )
}
