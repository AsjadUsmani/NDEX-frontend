import { useEffect, useRef, type DependencyList, type RefObject } from 'react'

export function useD3<T extends HTMLElement = HTMLDivElement>(
  renderFn: (container: T, dimensions: { width: number; height: number }) => (() => void) | void,
  deps: DependencyList,
): RefObject<T> {
  const containerRef = useRef<T | null>(null)

  // Keep renderFn in a ref so it's never a dependency — avoids double-trigger
  // when the caller uses useCallback (which would already re-create on data change)
  const renderFnRef = useRef(renderFn)
  useEffect(() => {
    renderFnRef.current = renderFn
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cleanup: (() => void) | void
    let debounceTimer: number | null = null
    let frameId: number | null = null
    let lastWidth  = -1
    let lastHeight = -1

    const runRender = (force = false): void => {
      const rect          = container.getBoundingClientRect()
      const currentWidth  = Math.round(rect.width)
      const currentHeight = Math.round(rect.height)

      if (!force && lastWidth === currentWidth && lastHeight === currentHeight) return

      lastWidth  = currentWidth
      lastHeight = currentHeight

      if (cleanup) cleanup()

      // Disconnect during render to prevent the ResizeObserver loop:
      // D3 DOM mutations change the bounding rect → observer fires → infinite loop
      observer.disconnect()
      try {
        cleanup = renderFnRef.current(container, {
          width:  Math.max(0, currentWidth),
          height: Math.max(0, currentHeight),
        })
      } finally {
        observer.observe(container)
      }
    }

    const observer = new ResizeObserver(() => {
      if (debounceTimer) window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => runRender(false), 150)
    })

    observer.observe(container)
    frameId = window.requestAnimationFrame(() => runRender(true))

    return () => {
      observer.disconnect()
      if (debounceTimer) window.clearTimeout(debounceTimer)
      if (frameId)       window.cancelAnimationFrame(frameId)
      if (cleanup)       cleanup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return containerRef as RefObject<T>
}
