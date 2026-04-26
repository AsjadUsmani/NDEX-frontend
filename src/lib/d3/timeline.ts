import * as d3 from 'd3'
import { hashColor } from './colors'
import type { CommitData } from '../../types/index.ts'

export interface TimelineConfig {
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  onCommitClick: (commit: CommitData) => void
  onCommitHover: (commit: CommitData | null, event?: MouseEvent) => void
}

function ensureDateDomain(data: CommitData[]): [Date, Date] {
  const values = data.map(commit => new Date(commit.author.date).getTime()).filter(Number.isFinite)
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    const now = new Date()
    return [now, now]
  }
  if (min === max) {
    const oneDay = 24 * 60 * 60 * 1000
    return [new Date(min - oneDay), new Date(max + oneDay)]
  }
  return [new Date(min), new Date(max)]
}

export function renderTimeline(
  container: HTMLElement,
  data: CommitData[],
  config: TimelineConfig,
): () => void {
  d3.select(container).selectAll('*').remove()

  const { width, height, margin } = config
  const innerW = Math.max(0, width - margin.left - margin.right)
  const innerH = Math.max(0, height - margin.top - margin.bottom)

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('background', 'transparent')
    .style('overflow', 'hidden')

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const tooltip = d3.select(document.body)
    .append('div')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('background', '#101928')
    .style('border', '0.5px solid rgba(0,161,155,0.3)')
    .style('border-radius', '8px')
    .style('padding', '10px 14px')
    .style('font-family', 'IBM Plex Sans, sans-serif')
    .style('font-size', '12px')
    .style('color', '#e8f4f3')
    .style('z-index', '9999')

  if (data.length === 0 || innerW <= 0 || innerH <= 0) {
    return () => {
      tooltip.remove()
      d3.select(container).selectAll('*').remove()
    }
  }

  const parseDate = (d: CommitData): Date => new Date(d.author.date)
  const [startDate, endDate] = ensureDateDomain(data)

  const xScale = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, innerW])
    .nice()

  const maxFiles = d3.max(data, d => Math.max(1, d.filesChanged || 1)) || 1
  const rScale = d3.scaleSqrt()
    .domain([0, maxFiles])
    .range([4, 16])

  const yScale = d3.scaleLinear()
    .domain([0, Math.max(1, data.length - 1)])
    .range([20, Math.max(20, innerH - 40)])

  const gridAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickSize(-innerW)
    .tickFormat(() => '')

  g.append('g')
    .call(gridAxis)
    .selectAll('line')
    .attr('stroke', 'rgba(0,161,155,0.10)')

  g.selectAll('.domain').attr('stroke', 'none')

  const xAxis = d3.axisBottom(xScale)
    .ticks(6)
    .tickFormat(domainValue => d3.timeFormat('%b %-d')(domainValue as Date))

  const xAxisG = g.append('g')
    .attr('transform', `translate(0, ${innerH - 20})`)

  xAxisG.call(selection => {
    xAxis(selection as d3.Selection<SVGGElement, unknown, null, undefined>)
  })

  xAxisG.selectAll('text')
    .attr('fill', '#4d7c79')
    .style('font-size', '11px')
    .style('font-family', 'IBM Plex Sans, sans-serif')

  xAxisG.selectAll('line').attr('stroke', 'rgba(0,161,155,0.20)')
  xAxisG.selectAll('.domain').attr('stroke', 'rgba(0,161,155,0.20)')

  const dotsLayer = g.append('g')

  const dots = dotsLayer
    .selectAll<SVGCircleElement, CommitData>('circle')
    .data(data)
    .join('circle')
    .attr('cx', d => xScale(parseDate(d)))
    .attr('cy', innerH + 30)
    .attr('r', d => rScale(d.filesChanged || 1))
    .attr('fill', d => hashColor(d.author.name || d.sha))
    .attr('stroke', 'rgba(255,255,255,0.20)')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')

  dots
    .transition()
    .duration(300)
    .delay((_, i) => i * 12)
    .ease(d3.easeCubicOut)
    .attr('cy', (_, i) => yScale(i))

  const setTooltip = (event: MouseEvent, commit: CommitData): void => {
    const safeMessage = commit.message.length > 50 ? `${commit.message.slice(0, 50)}...` : commit.message
    const dateLabel = d3.timeFormat('%b %-d, %Y %H:%M')(new Date(commit.author.date))

    tooltip
      .style('opacity', '1')
      .style('left', `${event.pageX + 16}px`)
      .style('top', `${event.pageY - 20}px`)
      .html(
        `<div style="font-family:Geist Mono, monospace;color:#e4dd3d;margin-bottom:6px">${commit.shortSha}</div>
         <div style="margin-bottom:4px">${safeMessage}</div>
         <div style="color:#8fb5b3">${commit.author.name} · ${dateLabel}</div>
         <div style="color:#4d7c79">Files changed: ${commit.filesChanged.toLocaleString()}</div>`,
      )
  }

  dots
    .on('mouseenter', function handleEnter(event, commit) {
      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', rScale(commit.filesChanged || 1) * 1.4)

      setTooltip(event as MouseEvent, commit)
      config.onCommitHover(commit, event as MouseEvent)
    })
    .on('mousemove', function handleMove(event, commit) {
      setTooltip(event as MouseEvent, commit)
      config.onCommitHover(commit, event as MouseEvent)
    })
    .on('mouseleave', function handleLeave(_, commit) {
      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', rScale(commit.filesChanged || 1))

      tooltip.style('opacity', '0')
      config.onCommitHover(null)
    })
    .on('click', (_, commit) => {
      config.onCommitClick(commit)
    })

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 8])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .wheelDelta(event => -event.deltaY * 0.002)
    .on('zoom', event => {
      const transform = event.transform
      const zx = transform.rescaleX(xScale)

      dots.attr('cx', d => zx(parseDate(d)))
      const zoomedAxis = d3.axisBottom(zx)
        .ticks(6)
        .tickFormat(domainValue => d3.timeFormat('%b %-d')(domainValue as Date))

      xAxisG.call(selection => {
        zoomedAxis(selection as d3.Selection<SVGGElement, unknown, null, undefined>)
      })
      xAxisG.selectAll('text')
        .attr('fill', '#4d7c79')
        .style('font-size', '11px')
        .style('font-family', 'IBM Plex Sans, sans-serif')
      xAxisG.selectAll('line').attr('stroke', 'rgba(0,161,155,0.20)')
      xAxisG.selectAll('.domain').attr('stroke', 'rgba(0,161,155,0.20)')
    })

  svg.call(zoom)

  const brush = d3.brushX()
    .extent([[0, innerH - 24], [innerW, innerH]])
    .on('brush end', event => {
      const selection = event.selection as [number, number] | null
      if (!selection) {
        dots.attr('opacity', 1)
        return
      }
      const [x0, x1] = selection
      dots.attr('opacity', d => {
        const x = xScale(parseDate(d))
        return x >= x0 && x <= x1 ? 1 : 0.2
      })
    })

  g.append('g').call(brush)

  return () => {
    tooltip.remove()
    svg.on('.zoom', null)
    d3.select(container).selectAll('*').remove()
  }
}
