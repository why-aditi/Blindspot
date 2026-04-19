import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const CIRCUMFERENCE = 2 * Math.PI * 80

function scoreToOffset(score: number) {
  return CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE
}

function scoreColor(score: number) {
  if (score < 50) return '#FF4D4D'
  if (score < 70) return '#E8FF47'
  return '#4DFFB4'
}

const METRICS = [
  { label: 'Demographic Parity', before: 42, after: 81 },
  { label: 'Equalized Odds',     before: 38, after: 76 },
  { label: 'Individual Fairness',before: 44, after: 80 },
]

type DemoState = 'idle' | 'applying' | 'corrected'

const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function FairScoreDemo() {
  const [state, setState] = useState<DemoState>('idle')
  const score = state === 'corrected' ? 79 : 41
  const color = scoreColor(score)

  const handleApply = () => {
    if (state !== 'idle') return
    setState('applying')
    setTimeout(() => {
      setState('corrected')
      toast.success('Model fairness improved by +38 points 🎯', {
        duration: 4000,
      })
    }, 1400)
  }

  const handleReset = () => setState('idle')

  return (
    <section className="bg-surface border-y border-bs-border py-24 px-6 md:px-12">
      <div className="text-center mb-12">
        <span className="text-accent font-syne text-xs tracking-[0.3em] uppercase">[ INTERACTIVE DEMO ]</span>
        <h2 className="font-syne font-bold text-4xl md:text-5xl text-textPrimary mt-4">
          See bias correction in action.
        </h2>
        <p className="font-dm text-textMuted mt-3">
          Click 'Apply Correction' and watch the model become fair.
        </p>
      </div>

      <div className="border border-bs-border bg-bg p-6 md:p-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* LEFT — Gauge */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Track */}
                <circle cx="100" cy="100" r="80" stroke="#1E1E24" strokeWidth="12" fill="none" />
                {/* Progress arc */}
                <motion.circle
                  cx="100" cy="100" r="80"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  style={{ rotate: '-90deg', transformOrigin: '100px 100px' }}
                  stroke={color}
                  strokeDasharray={CIRCUMFERENCE}
                  animate={{
                    strokeDashoffset: reduced ? scoreToOffset(score) : scoreToOffset(score),
                    stroke: color,
                  }}
                  initial={{ strokeDashoffset: scoreToOffset(41) }}
                  transition={{ duration: reduced ? 0 : 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                />
                {/* Center text */}
                <text x="100" y="96" textAnchor="middle" dominantBaseline="middle" fill={color} fontFamily="Syne, sans-serif" fontWeight="700" fontSize="44">
                  {score}
                </text>
                <text x="100" y="126" textAnchor="middle" fill="#6B6B7A" fontFamily="DM Sans, sans-serif" fontSize="12">
                  FairScore™
                </text>
              </svg>
            </div>

            {/* Status badge */}
            <AnimatePresence mode="wait">
              {state === 'corrected' ? (
                <motion.div
                  key="corrected"
                  className="px-4 py-2 border border-clear/30 bg-clearDim text-clear text-sm font-dm flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  ✓ BIAS CORRECTED
                </motion.div>
              ) : (
                <motion.div
                  key="bias"
                  className="px-4 py-2 border border-danger/30 bg-dangerDim text-danger text-sm font-dm flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <span className="animate-blink-dot">⚠</span> BIAS DETECTED
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-xs text-textMuted font-dm">Hiring model — Adult Income dataset</p>
          </div>

          {/* RIGHT — Metrics */}
          <div className="flex flex-col gap-6">
            <h3 className="font-syne font-bold text-lg text-white">Fairness breakdown</h3>

            {METRICS.map((m, i) => {
              const val = state === 'corrected' ? m.after : m.before
              const deltaVal = m.after - m.before

              return (
                <div key={m.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-dm text-sm text-textSecondary">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-dm text-sm text-white">{val}%</span>
                      <AnimatePresence>
                        {state === 'corrected' && (
                          <motion.span
                            className="text-clear text-xs font-dm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.15 + 0.3 }}
                          >
                            +{deltaVal} pts
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="h-2 bg-bs-border overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: scoreColor(val) }}
                      initial={{ width: `${m.before}%` }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: reduced ? 0 : 1.2, delay: i * 0.1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )
            })}

            {/* Button */}
            <div className="flex flex-col gap-3 mt-4">
              <motion.button
                className={`w-full py-4 px-10 font-syne font-bold text-base flex items-center justify-center gap-3 transition-colors ${
                  state === 'corrected'
                    ? 'bg-clear text-bg cursor-default'
                    : 'bg-accent text-bg cursor-pointer'
                }`}
                onClick={handleApply}
                disabled={state !== 'idle'}
                whileHover={state === 'idle' && !reduced ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
                whileTap={state === 'idle' && !reduced ? { scale: 0.97 } : {}}
              >
                {state === 'applying' && <span className="spinner" />}
                {state === 'idle' && 'Apply Correction'}
                {state === 'applying' && 'Applying...'}
                {state === 'corrected' && 'Correction Applied ✓'}
              </motion.button>

              {state !== 'idle' && (
                <button
                  onClick={handleReset}
                  className="text-xs text-textMuted underline underline-offset-2 text-center font-dm hover:text-textSecondary transition-colors"
                >
                  Reset demo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
