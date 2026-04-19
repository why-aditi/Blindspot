import { motion } from 'framer-motion'

const ORBS = [
  { color: '#E8FF47', size: 600, x: '10%',  y: '20%', dur: 12 },
  { color: '#FF4D4D', size: 400, x: '70%',  y: '60%', dur: 16 },
  { color: '#4DFFB4', size: 350, x: '50%',  y: '10%', dur: 14 },
]

const WORDS_LINE1 = ['Stop', 'shipping']
const WORDS_LINE2 = ['biased', 'models.']

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function FinalCTA() {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden py-24">
      {/* Animated orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}12 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
          }}
          animate={reduced ? {} : {
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: orb.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center gap-8 px-6 max-w-4xl mx-auto">
        <motion.span
          className="text-accent font-syne text-xs tracking-[0.3em] uppercase"
          initial={reduced ? {} : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          READY TO START?
        </motion.span>

        {/* Heading */}
        <h2
          className="font-syne font-bold leading-[0.95]"
          style={{ fontSize: 'clamp(44px, 7vw, 92px)' }}
        >
          <span className="flex flex-wrap justify-center gap-x-[0.25em] text-textPrimary">
            {WORDS_LINE1.map((w, i) => (
              <motion.span
                key={w}
                className="inline-block"
                initial={reduced ? {} : { opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </span>
          <span className="flex flex-wrap justify-center gap-x-[0.25em] text-accent">
            {WORDS_LINE2.map((w, i) => (
              <motion.span
                key={w}
                className="inline-block"
                initial={reduced ? {} : { opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            ))}
          </span>
        </h2>

        <motion.p
          className="font-dm text-lg text-textSecondary max-w-lg leading-relaxed"
          initial={reduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Blindspot takes 60 seconds to set up.
          <br />Your first audit is completely free.
        </motion.p>

        <motion.a
          href="/audit"
          className="bg-accent text-bg font-syne font-bold text-lg px-12 py-5 inline-block"
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={reduced ? {} : {
            scale: 1.04,
            filter: 'drop-shadow(0 0 40px #E8FF4760)',
          }}
          whileTap={reduced ? {} : { scale: 0.97 }}
        >
          Audit Your First Model →
        </motion.a>

        <motion.p
          className="font-dm text-xs text-textMuted"
          initial={reduced ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          No credit card · No setup · Open source core
        </motion.p>
      </div>
    </section>
  )
}
