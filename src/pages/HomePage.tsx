import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIStore } from '../store/uiStore'
import {
  Code,
  FileText,
  GitBranch,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Cpu,
  Sun,
  Moon
} from 'lucide-react'

const features = [
  {
    title: 'Code Intelligence',
    desc: 'Deep semantic analysis of your entire codebase using state-of-the-art LLMs.',
    icon: Code,
    color: 'var(--teal)'
  },
  {
    title: 'Automated SRS',
    desc: 'Generate professional Software Requirements Specifications in seconds.',
    icon: FileText,
    color: 'var(--gold)'
  },
  {
    title: 'UML Visualizations',
    desc: 'Interactive diagrams that map out your system architecture and data flows.',
    icon: GitBranch,
    color: 'var(--teal)'
  },
  {
    title: 'Security Auditing',
    desc: 'Identify vulnerabilities and security bottlenecks before they reach production.',
    icon: Shield,
    color: 'var(--gold)'
  },
  {
    title: 'Performance Mapping',
    desc: 'Trace execution paths and identify performance hotspots automatically.',
    icon: Zap,
    color: 'var(--teal)'
  },
  {
    title: 'Repo Synced',
    desc: 'Always up to date with your latest commits and branch changes.',
    icon: Globe,
    color: 'var(--gold)'
  }
]

export default function HomePage() {
  const { theme, toggleTheme } = useUIStore()

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        width: '100%',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/ndex-logo.svg"
            alt="NDEX"
            style={{ width: 32, height: 32, borderRadius: 8, display: 'block' }}
          />
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>NDEX</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center'
            }}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/login" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>Login</Link>
          <Link to="/register" style={{
            background: 'var(--teal)', color: 'white', padding: '10px 24px',
            borderRadius: 999, textDecoration: 'none', fontSize: 15, fontWeight: 600,
            boxShadow: '0 4px 14px var(--teal-faint)'
          }}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        padding: '180px 24px 120px',
        textAlign: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Background Gradients */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '80%', height: '600px', background: 'radial-gradient(circle at center, var(--teal-faint) 0%, transparent 70%)',
          zIndex: 0, opacity: 0.6
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ zIndex: 1, maxWidth: 900 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-raised)',
            padding: '6px 16px', borderRadius: 999, border: '1px solid var(--border-2)',
            marginBottom: 24, fontSize: 13, fontWeight: 600, color: 'var(--teal)'
          }}>
            <Cpu size={14} />
            <span>Next-Gen Repository Intelligence</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: 24,
            background: 'linear-gradient(to bottom, var(--text-1) 30%, var(--text-2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Master Your Codebase <br />
            <span style={{ color: 'var(--teal)', WebkitTextFillColor: 'var(--teal)' }}>With AI-Driven Insights.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-2)',
            maxWidth: 650,
            margin: '0 auto 40px',
            lineHeight: 1.6
          }}>
            NDEX maps your complex repositories into actionable documentation,
            visual diagrams, and semantic insights. Built for engineers, by engineers.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/register" style={{
              background: 'var(--teal)', color: 'white', padding: '16px 36px',
              borderRadius: 12, textDecoration: 'none', fontSize: 17, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 25px var(--teal-faint)'
            }}>
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/login" style={{
              background: 'var(--bg-raised)', color: 'var(--text-1)', padding: '16px 36px',
              borderRadius: 12, textDecoration: 'none', fontSize: 17, fontWeight: 600,
              border: '1px solid var(--border-2)'
            }}>
              Explore Demo
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            marginTop: 80, width: '100%', maxWidth: 1000, height: 500,
            background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border-3)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.4)', position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ height: 40, borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px' }}>
             <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
             <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
             <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          <div style={{ padding: 40, display: 'flex', gap: 24, height: '100%' }}>
            <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3,4].map(i => <div key={i} className="ndex-skeleton" style={{ height: 12, borderRadius: 6, width: i%2===0 ? '80%' : '100%' }} />)}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
               <div className="ndex-skeleton" style={{ height: 40, borderRadius: 12, width: '40%' }} />
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                 <div className="ndex-skeleton" style={{ height: 180, borderRadius: 16 }} />
                 <div className="ndex-skeleton" style={{ height: 180, borderRadius: 16 }} />
               </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Features Grid */}
      <section style={{ padding: '120px 48px', background: 'var(--bg-void)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 80 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Engineered for Complexity.</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 18 }}>Everything you need to navigate enterprise-scale repositories.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                style={{
                  padding: 32, borderRadius: 20, background: 'var(--bg-surface)',
                  border: '1px solid var(--border-2)', transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: `${f.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
                }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.5 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '120px 48px', textAlign: 'center' }}>
         <div style={{
           maxWidth: 800, margin: '0 auto', background: 'var(--bg-card)',
           padding: '60px 40px', borderRadius: 32, border: '1px solid var(--teal-faint)',
           position: 'relative', overflow: 'hidden'
         }}>
           <div style={{
             position: 'absolute', top: 0, right: 0, width: 200, height: 200,
             background: 'var(--teal-faint)', filter: 'blur(100px)', borderRadius: '50%'
           }} />
           <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>Ready to decode your repository?</h2>
           <p style={{ color: 'var(--text-2)', fontSize: 18, marginBottom: 40 }}>
             Join hundreds of developers using NDEX to build better software faster.
           </p>
           <Link to="/register" style={{
             background: 'var(--teal)', color: 'white', padding: '16px 48px',
             borderRadius: 12, textDecoration: 'none', fontSize: 18, fontWeight: 700,
             display: 'inline-block'
           }}>
             Start for Free
           </Link>
         </div>
      </section>
    </div>
  )
}
