export const ndexScale = (index: number): string => {
  const colors = [
    '#00a19b', '#e4dd3d', '#00d4cc', '#b8b230',
    '#005e5b', '#f0e84a', '#007a76', '#c8c235',
  ]
  return colors[index % colors.length]
}

export const hashColor = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    '#00a19b', '#e4dd3d', '#00d4cc', '#3b82f6',
    '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4',
    '#10b981', '#f97316', '#ec4899', '#6366f1',
  ]
  return colors[Math.abs(hash) % colors.length]
}

export const heatColor = (t: number): string => {
  const clamped = Math.max(0, Math.min(1, t))
  const r = Math.round(228 * clamped)
  const g = Math.round(161 + (221 - 161) * clamped)
  const b = Math.round(155 * (1 - clamped))
  return `rgb(${r},${g},${b})`
}

export const opacityScale = (value: number, max: number): number => {
  if (max <= 0) {
    return 0.2
  }
  return 0.2 + (value / max) * 0.8
}
