import { useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

const NAV_LINKS = ['Features', 'How it works', 'Demo', 'Docs']

export default function Navbar() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { scrollY } = useScroll()

  const bgColor = useTransform(scrollY, [0, 100], ['rgba(10,10,11,0)', 'rgba(10,10,11,0.92)'])
  const backdropBlur = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)'])

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between"
        style={{ backgroundColor: bgColor, backdropFilter: backdropBlur }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-0 font-syne font-bold text-xl tracking-tight text-textPrimary">
          BLIND
          <motion.span
            className="inline-block w-2.5 h-2.5 rounded-full bg-accent mx-1"
            animate={prefersReducedMotion ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
          SPOT
        </a>

        {/* Center nav links (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="relative text-sm text-textMuted hover:text-white transition-colors duration-200 pb-1"
              onMouseEnter={() => setHoveredLink(link)}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {link}
              {hoveredLink === link && (
                <motion.span
                  className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                  layoutId="nav-underline"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </a>
          ))}
        </div>

        {/* Right: Try Free button */}
        <div className="flex items-center gap-4">
          <motion.a
            href="/audit"
            className="hidden md:inline-flex items-center border border-accent text-accent px-5 py-2 text-sm font-syne rounded-none"
            whileHover={{ backgroundColor: '#E8FF47', color: '#0A0A0B' }}
            transition={{ duration: 0.2 }}
          >
            Try Free
          </motion.a>

          {/* Mobile hamburger — transform-based (framer-motion can't morph d= across different path structures) */}
          <button
            className="md:hidden p-2 text-textPrimary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-[14px] flex flex-col justify-between">
              <motion.span
                className="block h-px w-full bg-current origin-center"
                animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="block h-px w-full bg-current"
                animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-px w-full bg-current origin-center"
                animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed top-[60px] left-0 right-0 z-30 bg-surface border-b border-bs-border px-6 py-6 flex flex-col gap-4 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-textSecondary hover:text-white text-sm font-dm transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link}
              </a>
            ))}
            <a
              href="/audit"
              className="inline-flex items-center border border-accent text-accent px-5 py-2 text-sm font-syne w-fit rounded-none mt-2"
            >
              Try Free
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
