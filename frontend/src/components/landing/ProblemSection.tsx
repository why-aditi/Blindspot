import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

const STATS = [
  { num: 35, suffix: '%', label: 'more facial recognition errors on darker skin tones — MIT study' },
  { num: 68, suffix: '%', label: 'of men approved by Amazon hiring AI vs 31% of women' },
  { num: 200, suffix: 'M+', label: 'patient records affected by a biased healthcare algorithm' },
]

const BAR_DATA = [
  { label: 'Group A', without: 30, with: 78 },
  { label: 'Group B', without: 72, with: 76 },
  { label: 'Group C', without: 20, with: 74 },
]

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function useAnimatedNumber(target: number, active: boolean, duration = 2500) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    if (reduced) { setValue(target); return }
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, target, duration])

  return value
}

function StatCard({ stat, inView, delay }: { stat: typeof STATS[0]; inView: boolean; delay: number }) {
  const count = useAnimatedNumber(stat.num, inView)
  return (
    <motion.div
      className="border-l-[3px] border-danger pl-8 pr-6 py-8 bg-surface cursor-default"
      initial={reduced ? {} : { opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      whileHover={reduced ? {} : { x: 6, borderColor: '#E8FF47' }}
    >
      <div className="font-syne font-bold text-7xl text-white leading-none">
        {count}{stat.suffix}
      </div>
      <p className="font-dm text-sm text-textSecondary mt-3 leading-relaxed">
        {stat.label}
      </p>
    </motion.div>
  )
}

export default function ProblemSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section ref={ref} className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-16 items-start">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">THE PROBLEM</span>
          <h2 className="font-syne font-bold text-4xl md:text-5xl text-textPrimary leading-tight">
            The bias you can't see.
          </h2>
          <p className="font-dm text-base text-textMuted leading-relaxed max-w-xs">
            By the time bias is discovered, millions of decisions have already been made.
            Blindspot catches it before the first prediction.
          </p>

          {/* Mini bar chart */}
          <div className="flex gap-6 mt-4">
            {(['Without Blindspot', 'With Blindspot'] as const).map((label, ci) => (
              <div key={label} className="flex flex-col gap-2 flex-1">
                <span className="text-xs font-dm text-textMuted">{label}</span>
                <div className="flex flex-col gap-1.5">
                  {BAR_DATA.map((d, i) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <span className="text-[10px] text-textMuted w-10">{d.label}</span>
                      <div className="flex-1 h-2 bg-bs-border rounded-none overflow-hidden">
                        <motion.div
                          className={`h-full rounded-none ${ci === 0 ? 'bg-danger/60' : 'bg-clear/70'}`}
                          initial={{ width: '0%' }}
                          animate={inView ? { width: `${ci === 0 ? d.without : d.with}%` } : { width: '0%' }}
                          transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — stat cards */}
        <div className="flex flex-col gap-4">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} inView={inView} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}
