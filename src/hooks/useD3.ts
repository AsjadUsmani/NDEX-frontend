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
    let reconnectFrameId: number | null = null
    let lastWidth  = -1
    let lastHeight = -1
    let isRendering = false

    const runRender = (force = false): void => {
      if (isRendering) return

      const currentWidth  = Math.round(container.clientWidth)
      const currentHeight = Math.round(container.clientHeight)

      if (!force && lastWidth === currentWidth && lastHeight === currentHeight) return

      lastWidth  = currentWidth
      lastHeight = currentHeight

      if (cleanup) cleanup()

      // Disconnect during render so D3 DOM writes do not immediately feed back
      // into ResizeObserver and trigger another full render cycle.
      isRendering = true
      observer.disconnect()
      try {
        cleanup = renderFnRef.current(container, {
          width:  Math.max(0, currentWidth),
          height: Math.max(0, currentHeight),
        })
      } finally {
        reconnectFrameId = window.requestAnimationFrame(() => {
          isRendering = false
          observer.observe(container)
        })
      }
    }

    const observer = new ResizeObserver(() => {
      if (isRendering) return
      if (debounceTimer) window.clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => runRender(false), 150)
    })

    observer.observe(container)
    frameId = window.requestAnimationFrame(() => runRender(true))

    return () => {
      observer.disconnect()
      if (debounceTimer) window.clearTimeout(debounceTimer)
      if (frameId)       window.cancelAnimationFrame(frameId)
      if (reconnectFrameId) window.cancelAnimationFrame(reconnectFrameId)
      if (cleanup)       cleanup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return containerRef as RefObject<T>
}
