import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, type Variants } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Float } from '@react-three/drei'
import * as THREE from 'three'

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// ─── Node positions ───────────────────────────────────────────────
const NODE_POSITIONS: [number, number, number][] = [
  [0, 0, 0], [1.8, 0.8, -0.5], [-1.5, 0.9, 0.3],
  [0.5, -1.4, 0.6], [-0.7, -1.2, -0.8], [2.2, -0.6, 0.2],
  [-2, -0.4, -0.3], [0.3, 1.8, 0.7], [-0.9, 0.4, 1.6],
]
const BIASED_INDICES = [1, 3, 5]

// ─── Edges ────────────────────────────────────────────────────────
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 5], [2, 6],
  [3, 4], [4, 7], [6, 8], [7, 8],
]

function NodeMesh({
  position, biased, corrected, onClick
}: {
  position: [number, number, number]
  biased: boolean
  corrected: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const color = biased ? (corrected ? '#4DFFB4' : '#FF4D4D') : '#888899'

  useFrame((_, delta) => {
    if (!meshRef.current || prefersReduced()) return
    if (biased && !corrected) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.004) * 0.12)
    }
    meshRef.current.rotation.y += delta * 0.3
  })

  return (
    <mesh ref={meshRef} position={position} onClick={onClick}>
      <sphereGeometry args={[biased ? 0.18 : 0.12, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={biased ? (corrected ? 0.6 : 0.8) : 0.2}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  )
}

function EdgeLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: '#2a2a35', transparent: true, opacity: 0.6 })
  const lineObj = new THREE.Line(geometry, material)
  return <primitive object={lineObj} />
}

function ModelGraph() {
  const groupRef = useRef<THREE.Group>(null)
  const [corrected, setCorrected] = useState<Set<number>>(new Set())

  useFrame((_, delta) => {
    if (!groupRef.current || prefersReduced()) return
    groupRef.current.rotation.y += delta * 0.003 * 60
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef}>
        {NODE_POSITIONS.map((pos, i) => (
          <NodeMesh
            key={i}
            position={pos}
            biased={BIASED_INDICES.includes(i)}
            corrected={corrected.has(i)}
            onClick={() => {
              if (BIASED_INDICES.includes(i)) {
                setCorrected((prev) => new Set(prev).add(i))
              }
            }}
          />
        ))}
        {EDGES.map(([a, b], i) => (
          <EdgeLine key={i} start={NODE_POSITIONS[a]} end={NODE_POSITIONS[b]} />
        ))}
        <ambientLight intensity={0.3} />
        <pointLight position={[2, 3, 4]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-3, -2, 2]} intensity={0.5} color="#E8FF47" />
      </group>
    </Float>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────
const HEADING_WORDS = [
  { text: 'Your', accent: false },
  { text: 'model', accent: false },
  { text: 'has', accent: false },
  { text: 'a', accent: false },
  { text: 'blindspot.', accent: true },
]

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] })
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, -80])
  const reduced = prefersReduced()

  const wordVariants: Variants = {
    hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 60 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: 0.3 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #1E1E24 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Accent glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%', left: '5%', width: '50%', height: '60%',
          background: 'radial-gradient(ellipse at center, #E8FF4718 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-[55%_45%] gap-12 items-center py-16">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          {/* Eyebrow */}
          <motion.div
            className="text-accent font-syne text-xs tracking-[0.3em] uppercase"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            [ AI FAIRNESS PLATFORM ]
          </motion.div>

          {/* Heading */}
          <h1
            className="font-syne font-bold leading-[0.95] flex flex-wrap gap-x-[0.25em]"
            style={{ fontSize: 'clamp(48px, 7vw, 104px)' }}
          >
            {HEADING_WORDS.map((w, i) => (
              <motion.span
                key={i}
                className={`inline-block ${w.accent ? 'text-accent relative' : 'text-textPrimary'}`}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                {w.accent && (
                  <motion.span
                    className="absolute inset-0 pointer-events-none -z-10"
                    style={{ background: 'radial-gradient(ellipse at center, #E8FF4730 0%, transparent 70%)' }}
                    animate={reduced ? {} : { scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  />
                )}
                {w.text}
              </motion.span>
            ))}
          </h1>

          {/* Subheading */}
          <motion.p
            className="font-dm text-lg text-textSecondary max-w-md leading-relaxed"
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            Detect, explain, and correct AI bias before it reaches real people.
            Developer-first. Open source core. Built for teams who care.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <motion.a
              href="/audit"
              className="bg-accent text-bg font-syne font-bold px-8 py-4 rounded-none inline-block"
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
            >
              Start Auditing Free
            </motion.a>
            <motion.a
              href="#demo"
              className="border border-white/20 text-white px-8 py-4 rounded-none inline-block font-dm"
              whileHover={reduced ? {} : { borderColor: 'rgba(255,255,255,0.6)' }}
              transition={{ duration: 0.2 }}
            >
              Watch Demo →
            </motion.a>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            className="flex flex-wrap gap-6"
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            {['✓ No credit card', '✓ Free audit', '✓ Open source'].map((t) => (
              <span key={t} className="text-xs text-textMuted font-dm">{t}</span>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — 3D Canvas */}
        <motion.div
          className="h-[420px] md:h-[560px] relative"
          style={{ y: canvasY }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }}>
            <Stars radius={80} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
            <ModelGraph />
          </Canvas>
          <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-textMuted font-dm text-center">
            Click red nodes to correct bias
          </p>
        </motion.div>
      </div>
    </div>
  )
}
