import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, GitBranch, FileText, Code2, Settings as SettingsIcon, Layers, Shield } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'

interface CommandPaletteProps {
  onClose: () => void
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { toggleSidebar } = useUIStore()
  const { logout } = useAuth()
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const allCommands = [
    { label: 'Go to Dashboard',      shortcut: 'D',    path: '/dashboard', icon: LayoutDashboard },
    { label: 'Go to Git Tracking',   shortcut: 'G',    path: '/git',       icon: GitBranch      },
    { label: 'Go to SRS Docs',       shortcut: 'S',    path: '/srs',       icon: FileText       },
    { label: 'Go to Code Analysis',  shortcut: 'C',    path: '/code',      icon: Code2          },
    { label: 'Go to Settings',       shortcut: ',',    path: '/settings',  icon: SettingsIcon   },
    { label: 'Toggle Sidebar',       shortcut: '⌘ /',  action: 'sidebar',  icon: Layers         },
    { label: 'Disconnect Repository', shortcut: '',    action: 'disconnect', icon: GitBranch    },
    { label: 'Sign Out',             shortcut: '',     action: 'signout',  icon: Shield         },
  ]

  const filteredCommands = allCommands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    setActiveIndex(0)
  }, [search])

  useEffect(() => {
    inputRef.current?.focus()
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev + 1) % filteredCommands.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        executeCommand(filteredCommands[activeIndex])
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredCommands, activeIndex, onClose])

  const executeCommand = async (cmd: typeof allCommands[0]) => {
    if (cmd.path) {
      navigate(cmd.path)
    } else if (cmd.action === 'sidebar') {
      toggleSidebar()
    } else if (cmd.action === 'disconnect') {
      // Basic repo disconnect logic
    } else if (cmd.action === 'signout') {
      await logout()
      navigate('/')
    }
    onClose()
  }

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(4px)', zIndex: 1000 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 560, maxHeight: 400, background: 'var(--bg-card)',
          border: '1px solid var(--border-3)', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ height: 52, padding: '0 20px', borderBottom: '1px solid var(--border-2)', display: 'flex', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-1)', fontSize: 15, outline: 'none' }}
          />
        </div>
        
        <div style={{ overflowY: 'auto', padding: '8px 0', flex: 1 }}>
          {filteredCommands.map((cmd, i) => {
            const isActive = i === activeIndex
            return (
              <div
                key={cmd.label}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => executeCommand(cmd)}
                style={{
                  display: 'flex', alignItems: 'center', height: 44, padding: '0 20px',
                  background: isActive ? 'var(--bg-raised)' : 'transparent',
                  cursor: 'pointer', gap: 12
                }}
              >
                <cmd.icon size={16} color="var(--text-3)" />
                <span style={{ color: 'var(--text-1)', fontSize: 14, flex: 1 }}>{cmd.label}</span>
                {cmd.shortcut && (
                  <span style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'var(--bg-base)', border: '1px solid var(--border-1)', borderRadius: 4 }}>
                    {cmd.shortcut}
                  </span>
                )}
              </div>
            )
          })}
          {filteredCommands.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
              No commands found.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
