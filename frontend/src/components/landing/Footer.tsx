import { motion } from 'framer-motion'

const LINKS = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: 'HuggingFace Demo', href: '#' },
  { label: 'Docs', href: '#' },
  { label: 'Contact', href: '#' },
]

export default function Footer() {
  return (
    <footer className="border-t border-bs-border py-10 bg-bg px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
        {/* Left — Logo + tagline */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center font-syne font-bold text-base tracking-tight text-textPrimary">
            BLIND
            <motion.span
              className="inline-block w-2 h-2 rounded-full bg-accent mx-1"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            />
            SPOT
          </div>
          <p className="font-dm text-xs text-textMuted">AI fairness for everyone.</p>
        </div>

        {/* Center — Links */}
        <div className="flex flex-wrap gap-6 md:justify-center items-start">
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-dm text-sm text-textMuted hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="flex flex-col gap-2 md:items-end">
          <span className="font-dm text-xs text-textMuted">Built for Google Solution Challenge 2026</span>
          <span className="inline-block border border-accent text-accent font-dm text-xs px-3 py-1 w-fit">
            SDG 10
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 pt-6 border-t border-bs-border/50 text-center">
        <p className="font-dm text-xs text-textMuted">
          © 2026 Blindspot. Open source under MIT License.
        </p>
      </div>
    </footer>
  )
}
