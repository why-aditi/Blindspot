import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'

interface BiasedWord {
  text: string
  tooltip: string
}

const BIASED: BiasedWord[] = [
  { text: 'aggressive', tooltip: 'Gender-coded language' },
  { text: 'young dynamic', tooltip: 'Age bias — discriminatory' },
  { text: 'digital native', tooltip: 'Age bias — excludes older candidates' },
  { text: 'own community preferred', tooltip: 'Caste signal — severity: critical' },
  { text: 'rockstar', tooltip: 'Gender-coded language' },
]

const FIXED = [
  'results-driven',
  'collaborative',
  'tech-savvy',
  'all backgrounds welcome',
  'skilled',
]

function BiasWord({ text, tooltip }: BiasedWord) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <mark className="bg-[#FF4D4D20] text-danger rounded-sm px-1 border-b border-danger/50 cursor-default not-italic">
        {text}
      </mark>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-surface border border-danger/40 text-danger text-xs font-dm whitespace-nowrap pointer-events-none"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function NLPScanner() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section ref={ref} className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">NLP BIAS SCANNER</span>
        <h2 className="font-syne font-bold text-4xl md:text-5xl text-textPrimary mt-4">
          Find bias hiding in plain text.
        </h2>
        <p className="font-dm text-textMuted mt-3 max-w-lg mx-auto leading-relaxed">
          India-first. Detects gendered language, age bias, and caste signals in job descriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        {/* LEFT — Before */}
        <motion.div
          className="bg-dangerDim border border-danger/30 p-8 flex flex-col gap-6"
          initial={reduced ? {} : { opacity: 0, x: -60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-danger font-syne text-xs tracking-widest uppercase">BEFORE SCAN</span>
          <p className="font-dm text-sm text-textSecondary leading-8">
            We are looking for an{' '}
            <BiasWord text={BIASED[0].text} tooltip={BIASED[0].tooltip} />{' '}
            go-getter to join our{' '}
            <BiasWord text={BIASED[1].text} tooltip={BIASED[1].tooltip} />{' '}
            team. The ideal candidate is a{' '}
            <BiasWord text={BIASED[2].text} tooltip={BIASED[2].tooltip} />{' '}
            who thrives in a fast-paced environment.{' '}
            <BiasWord text={BIASED[3].text} tooltip={BIASED[3].tooltip} />.{' '}
            Must be a{' '}
            <BiasWord text={BIASED[4].text} tooltip={BIASED[4].tooltip} />{' '}
            developer ready to hustle.
          </p>
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-dm text-sm text-danger">Bias score</span>
              <span className="font-syne font-bold text-danger text-lg">0.84</span>
            </div>
            <div className="h-2 bg-bs-border">
              <motion.div
                className="h-full bg-danger"
                initial={{ width: '0%' }}
                animate={inView ? { width: '84%' } : { width: '0%' }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        {/* CENTER arrow */}
        <div className="hidden md:flex flex-col items-center justify-center relative px-2">
          <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-bs-border" />
          <motion.div
            className="relative z-10 w-10 h-10 bg-surface border border-accent flex items-center justify-center text-accent"
            animate={reduced ? {} : { rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            →
          </motion.div>
        </div>

        {/* RIGHT — After */}
        <motion.div
          className="bg-clearDim border border-clear/30 p-8 flex flex-col gap-6"
          initial={reduced ? {} : { opacity: 0, x: 60 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-clear font-syne text-xs tracking-widest uppercase">AFTER SCAN</span>
          <p className="font-dm text-sm text-textSecondary leading-8">
            We are looking for a{' '}
            <mark className="bg-[#4DFFB420] text-clear rounded-sm px-1 border-b border-clear/50 not-italic">{FIXED[0]}</mark>{' '}
            professional to join our{' '}
            <mark className="bg-[#4DFFB420] text-clear rounded-sm px-1 border-b border-clear/50 not-italic">{FIXED[1]}</mark>{' '}
            team. The ideal candidate is{' '}
            <mark className="bg-[#4DFFB420] text-clear rounded-sm px-1 border-b border-clear/50 not-italic">{FIXED[2]}</mark>{' '}
            and thrives in a dynamic environment.{' '}
            <mark className="bg-[#4DFFB420] text-clear rounded-sm px-1 border-b border-clear/50 not-italic">{FIXED[3]}</mark>.{' '}
            Must be a{' '}
            <mark className="bg-[#4DFFB420] text-clear rounded-sm px-1 border-b border-clear/50 not-italic">{FIXED[4]}</mark>{' '}
            developer ready to make an impact.
          </p>
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-dm text-sm text-clear">Bias score</span>
              <span className="font-syne font-bold text-clear text-lg">0.12</span>
            </div>
            <div className="h-2 bg-bs-border">
              <motion.div
                className="h-full bg-clear"
                initial={{ width: '0%' }}
                animate={inView ? { width: '12%' } : { width: '0%' }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
