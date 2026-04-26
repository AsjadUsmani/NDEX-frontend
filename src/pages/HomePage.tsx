import { motion } from 'framer-motion'
import { Github, GitBranch, FileText, Code2, Zap, Shield, ArrowRight, GitCommit, Layers, BarChart3, Chrome } from 'lucide-react'
import { supabase } from '../lib/supabase'

const features = [
  { icon: GitBranch, color: '#00a19b', title: 'Git Intelligence',   description: 'Interactive D3 visualizations of commits, branches, contributors, and PR activity.' },
  { icon: FileText,  color: '#e4dd3d', title: 'AI SRS Docs',        description: 'Groq AI generates a complete IEEE 830 Software Requirements Specification.' },
  { icon: Code2,     color: '#6366f1', title: 'Code Analysis',       description: 'AI code review with annotations, complexity metrics, patterns, and UML diagrams.' },
  { icon: BarChart3, color: '#ec4899', title: 'PR & Issues',         description: 'Visualize pull request activity, merge rates, and contributor involvement over time.' },
  { icon: Zap,       color: '#f97316', title: 'Instant Setup',       description: 'Paste any GitHub URL and connect in seconds. No configuration needed.' },
  { icon: Shield,    color: '#00c896', title: 'Secure by Default',   description: 'Tokens stay on your backend. OAuth via Supabase. No data stored beyond session.' },
]

const stats = [
  { value: '100%', label: 'Free to use' },
  { value: 'Groq',  label: 'AI powered' },
  { value: 'D3.js', label: 'Visualizations' },
  { value: '830',   label: 'IEEE standard' },
]

const steps = [
  { number: '01', title: 'Sign in',         icon: Shield,    description: 'Authenticate with GitHub or Google for read access to your repositories.' },
  { number: '02', title: 'Connect a repo',  icon: GitCommit, description: 'Paste any GitHub URL — public repos work instantly, private repos need a PAT.' },
  { number: '03', title: 'Explore',         icon: Layers,    description: 'Get git visualizations, AI-generated SRS docs, code analysis, and more.' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function HomePage() {
  return (
    <div style={{ background: '#05080f', minHeight: '100vh', color: '#e8f4f3', fontFamily: "'Inter', 'IBM Plex Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(12px)', borderBottom: '0.5px solid rgba(0,161,155,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#00a19b,#00d4cc)', display: 'grid', placeItems: 'center', fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 14, color: '#05080f' }}>Nx</div>
          <span style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1, background: 'linear-gradient(135deg,#00a19b,#e4dd3d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NDEX</span>
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['Features', 'Integrations', 'Documentation'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ color: '#8fb5b3', fontSize: 14, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => (e.currentTarget.style.color = '#e8f4f3')} onMouseOut={e => (e.currentTarget.style.color = '#8fb5b3')}>{l}</a>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 900px 700px at 50% 40%, rgba(0,161,155,0.09) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 600px 500px at 75% 75%, rgba(228,221,61,0.05) 0%, transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, textAlign: 'center' }}>
          <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '0.5px solid rgba(228,221,61,0.3)', background: 'rgba(228,221,61,0.07)', color: '#e4dd3d', fontFamily: "'Geist Mono, monospace',monospace", fontSize: 12, padding: '5px 14px', borderRadius: 99, marginBottom: 28, letterSpacing: 1 }}>
            ✦ Neural Design Explorer · v1.0
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 'clamp(42px,7vw,80px)', lineHeight: 1.05, letterSpacing: -2, margin: '0 0 24px' }}>
            <span style={{ color: '#e8f4f3' }}>Understand Any</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg,#00a19b 0%,#00d4cc 40%,#e4dd3d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>GitHub Repository</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} style={{ color: '#8fb5b3', fontSize: 18, lineHeight: 1.75, margin: '0 0 44px', maxWidth: 540, marginLeft: 'auto', marginRight: 'auto' }}>
            AI-generated SRS docs, interactive D3 visualizations, deep code analysis, and full git intelligence — all in one place.
          </motion.p>

          <motion.div {...fadeUp(0.22)} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button onClick={() => window.location.href = '/register'} style={{ display: 'flex', alignItems: 'center', gap: 9, height: 52, padding: '0 28px', background: '#00a19b', color: '#05080f', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 32px rgba(0,161,155,0.35)' }} onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Register
            </button>
            <button onClick={() => window.location.href = '/login'} style={{ display: 'flex', alignItems: 'center', gap: 9, height: 52, padding: '0 28px', background: 'transparent', color: '#e4dd3d', border: '0.5px solid rgba(228,221,61,0.3)', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(228,221,61,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Login
            </button>
          </motion.div>

          <motion.p {...fadeUp(0.28)} style={{ color: '#2a4a48', fontSize: 12, fontFamily: "'Geist Mono, monospace',monospace", letterSpacing: 0.5 }}>
            Free forever · No credit card · Open source
          </motion.p>

          {/* Mock UI preview */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} style={{ marginTop: 60, borderRadius: 16, overflow: 'hidden', border: '0.5px solid rgba(0,161,155,0.18)', background: 'linear-gradient(180deg,rgba(0,161,155,0.04) 0%,transparent)', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,161,155,0.1) inset' }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid rgba(0,161,155,0.1)', display: 'flex', gap: 6, background: 'rgba(8,13,24,0.8)' }}>
              {['#ff5f56','#ffbd2e','#27c93f'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ display: 'flex', height: 340, background: 'rgba(8,13,24,0.6)' }}>
              <div style={{ width: 180, borderRight: '0.5px solid rgba(0,161,155,0.08)', padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[90, 65, 80, 55, 75, 60, 70].map((w, i) => (
                  <div key={i} style={{ height: 14, borderRadius: 4, background: `rgba(0,161,155,${i === 2 ? 0.25 : 0.07})`, width: `${w}%`, border: i === 2 ? '1px solid rgba(0,161,155,0.3)' : 'none' }} />
                ))}
              </div>
              <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
                {[0.08, 0.06, 0.1, 0.05].map((op, i) => (
                  <div key={i} style={{ borderRadius: 10, background: `rgba(0,161,155,${op})`, border: '0.5px solid rgba(0,161,155,0.12)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 10, left: 12, height: 8, width: '40%', borderRadius: 4, background: 'rgba(0,161,155,0.2)' }} />
                    <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, height: 50, borderRadius: 6, background: 'rgba(228,221,61,0.06)', border: '0.5px solid rgba(228,221,61,0.1)' }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: "'Geist Mono, monospace',monospace", fontSize: 11, color: '#00a19b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Capabilities</div>
          <h2 style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)', color: '#e8f4f3', margin: '0 0 12px', letterSpacing: -1 }}>Everything you need to understand code</h2>
          <p style={{ color: '#8fb5b3', fontSize: 16, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>A complete suite of tools to visualize, document, and analyze your repositories.</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.07 }}
              style={{ background: 'rgba(12,20,32,0.8)', border: '0.5px solid rgba(0,161,155,0.1)', borderRadius: 14, padding: '28px 24px', cursor: 'default', transition: 'all 0.25s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = `${f.color}55`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = `rgba(12,20,32,1)` }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(0,161,155,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(12,20,32,0.8)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, border: `0.5px solid ${f.color}33`, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                <f.icon size={20} color={f.color} />
              </div>
              <h3 style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontSize: 16, fontWeight: 700, color: '#e8f4f3', margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ color: '#8fb5b3', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: 'rgba(12,20,32,0.6)', borderTop: '0.5px solid rgba(0,161,155,0.1)', borderBottom: '0.5px solid rgba(0,161,155,0.1)', padding: '48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 40, background: 'linear-gradient(135deg,#00a19b,#e4dd3d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ color: '#4d7c79', fontSize: 12, fontFamily: "'Geist Mono, monospace',monospace", textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontFamily: "'Geist Mono, monospace',monospace", fontSize: 11, color: '#00a19b', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Quick Start</div>
          <h2 style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4vw,42px)', color: '#e8f4f3', margin: '0 0 12px', letterSpacing: -1 }}>Get started in 3 steps</h2>
          <p style={{ color: '#8fb5b3', fontSize: 16, margin: 0, lineHeight: 1.7 }}>From zero to complete codebase intelligence in minutes.</p>
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap', gap: 4 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: '1 1 260px', maxWidth: 340 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1 }}
                style={{ flex: 1, position: 'relative', background: 'rgba(12,20,32,0.8)', border: '0.5px solid rgba(0,161,155,0.12)', borderRadius: 16, padding: '32px 28px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: "'Geist, sans-serif',sans-serif", fontSize: 52, fontWeight: 900, color: '#00a19b', opacity: 0.1, lineHeight: 1 }}>{step.number}</div>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,161,155,0.15)', border: '0.5px solid rgba(0,161,155,0.3)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                  <step.icon size={19} color="#00a19b" />
                </div>
                <h3 style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontSize: 18, fontWeight: 700, color: '#e8f4f3', margin: '0 0 10px' }}>{step.title}</h3>
                <p style={{ color: '#8fb5b3', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{step.description}</p>
              </motion.div>
              {i < steps.length - 1 && <div style={{ padding: '0 12px', flexShrink: 0, color: '#2a4a48' }}><ArrowRight size={20} /></div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 48px' }}>
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg,rgba(0,161,155,0.1) 0%,rgba(228,221,61,0.05) 100%)', border: '0.5px solid rgba(228,221,61,0.2)', borderRadius: 20, padding: '60px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Geist, sans-serif',sans-serif", fontSize: 220, fontWeight: 900, color: '#e4dd3d', opacity: 0.03, pointerEvents: 'none', lineHeight: 1 }}>Nx</div>
          <div style={{ fontFamily: "'Geist Mono, monospace',monospace", fontSize: 11, color: '#e4dd3d', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Ready?</div>
          <h2 style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)', color: '#e8f4f3', margin: '0 0 12px', letterSpacing: -1 }}>Start exploring your codebase</h2>
          <p style={{ color: '#8fb5b3', fontSize: 16, margin: '0 0 36px', lineHeight: 1.7 }}>Connect your first repository in seconds. Free forever.</p>
          <button onClick={() => window.location.href = '/register'} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 52, padding: '0 32px', background: '#00a19b', color: '#05080f', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 40px rgba(0,161,155,0.3)' }} onMouseOver={e => { e.currentTarget.style.filter = 'brightness(1.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Get Started Free
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 48px', borderTop: '0.5px solid rgba(0,161,155,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg,#00a19b,#00d4cc)', display: 'grid', placeItems: 'center', fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 900, fontSize: 11, color: '#05080f' }}>Nx</div>
            <span style={{ fontFamily: "'Geist, sans-serif',sans-serif", fontWeight: 800, fontSize: 15, color: '#8fb5b3', letterSpacing: 1 }}>NDEX</span>
            <span style={{ color: '#2a4a48', fontSize: 13 }}>Neural Design Explorer</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[['GitHub','https://github.com'],['Features','#features'],['Privacy','#privacy']].map(([l,h]) => (
              <a key={l} href={h} target={h.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ color: '#2a4a48', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#8fb5b3'} onMouseOut={e => e.currentTarget.style.color = '#2a4a48'}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '20px auto 0', textAlign: 'center', color: '#2a4a48', fontSize: 12, fontFamily: "'Geist Mono, monospace',monospace" }}>
          © 2026 NDEX · Built with React, D3.js &amp; Groq AI
        </div>
      </footer>

    </div>
  )
}
