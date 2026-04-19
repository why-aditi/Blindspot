import { Toaster } from 'sonner'
import Navbar from './Navbar'
import Hero from './Hero'
import Ticker from './Ticker'
import ProblemSection from './ProblemSection'
import HowItWorks from './HowItWorks'
import FeaturesGrid from './FeaturesGrid'
import FairScoreDemo from './FairScoreDemo'
import NLPScanner from './NLPScanner'
import CredibilityStrip from './CredibilityStrip'
import FinalCTA from './FinalCTA'
import Footer from './Footer'

// SVG noise grain as data URI
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`

export default function LandingPage() {
  return (
    <div className="bg-bg text-textPrimary font-dm overflow-x-hidden">
      {/* Film grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.035]"
        style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }}
      />

      <Navbar />
      <main>
        <section id="hero"><Hero /></section>
        <section id="ticker"><Ticker /></section>
        <section id="problem"><ProblemSection /></section>
        <section id="how-it-works"><HowItWorks /></section>
        <section id="features"><FeaturesGrid /></section>
        <section id="demo"><FairScoreDemo /></section>
        <section id="nlp"><NLPScanner /></section>
        <CredibilityStrip />
        <section id="cta"><FinalCTA /></section>
      </main>
      <Footer />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111114',
            border: '1px solid #E8FF47',
            color: '#F0F0F0',
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />
    </div>
  )
}
