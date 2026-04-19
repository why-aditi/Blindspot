import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01', title: 'Audit',
    desc: 'Upload your dataset. We scan every feature for representation gaps, proxy variables, label skew, and historical bias.',
  },
  {
    num: '02', title: 'Score',
    desc: 'Your model gets a FairScore from 0–100 across demographic parity, equalized odds, and individual fairness. One number that matters.',
  },
  {
    num: '03', title: 'Explain',
    desc: 'See exactly why each decision was made — SHAP feature attribution, counterfactuals, and a plain-English reason anyone can read.',
  },
  {
    num: '04', title: 'Correct',
    desc: 'Apply bias correction at any pipeline stage. Pre, in, or post-processing. Download a fairer model and compare before/after.',
  },
]

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 })

  return (
    <section ref={ref} className="py-24 px-6 md:px-12 overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-20">
        <h2 className="font-syne font-bold leading-[0.95]" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
          <span className="text-textPrimary">From biased to fair</span>
          <br />
          <span className="text-accent">in four steps.</span>
        </h2>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 1" preserveAspectRatio="none">
            <motion.line
              x1="0" y1="0" x2="100" y2="0"
              stroke="#1E1E24"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex flex-col gap-4 group cursor-default"
              initial={reduced ? {} : { opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6, ease: 'easeOut' }}
            >
              <motion.span
                className="font-syne font-bold select-none transition-all duration-300"
                style={{
                  fontSize: 'clamp(64px, 8vw, 96px)',
                  color: 'transparent',
                  WebkitTextStroke: '1px #E8FF47',
                  lineHeight: 1,
                }}
                whileHover={reduced ? {} : {
                  WebkitTextFillColor: '#E8FF47',
                  WebkitTextStroke: '1px #E8FF47',
                }}
              >
                {step.num}
              </motion.span>
              <h3 className="font-syne font-bold text-xl text-white">{step.title}</h3>
              <p className="font-dm text-sm text-textMuted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
