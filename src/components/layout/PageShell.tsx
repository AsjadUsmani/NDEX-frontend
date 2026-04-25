import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageShellProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  noPadding?: boolean
}

export default function PageShell({ children, title, subtitle, actions, noPadding = false }: PageShellProps) {
  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto' }}>
      {title ? (
        <div
          style={{
            padding: '28px 32px 20px',
            borderBottom: '1px solid var(--border-1)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 24,
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text-1)' }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-3)' }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: noPadding ? 0 : '24px 32px' }}
      >
        {children}
      </motion.div>
    </div>
  )
}
