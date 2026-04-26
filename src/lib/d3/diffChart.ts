import * as d3 from 'd3'
import type { DiffFile, DiffStats } from '../../types'

// ── CHART 1: File Changes Waterfall ─────────────────────────────
// Horizontal bars showing additions (teal) and deletions (red)
// per file — like GitHub's diff summary bar

export interface WaterfallConfig {
  width: number
  height: number
  onFileClick: (file: DiffFile) => void
  onFileHover: (file: DiffFile | null) => void
}

export function renderDiffWaterfall(
  container: HTMLElement,
  files: DiffFile[],
  config: WaterfallConfig
): () => void {

  d3.select(container).selectAll('*').remove()

  const margin = { top: 20, right: 120, bottom: 20, left: 200 }
  const innerW  = config.width  - margin.left - margin.right
  const innerH  = Math.max(config.height, files.length * 32)
    - margin.top - margin.bottom

  const svg = d3.select(container)
    .append('svg')
    .attr('width', config.width)
    .attr('height', innerH + margin.top + margin.bottom)
    .style('overflow', 'visible')

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Sort: most changed files first
  const sorted = [...files].sort((a, b) => b.changes - a.changes)
  const maxChanges = d3.max(sorted, d => d.changes) || 1

  // Y scale: one band per file
  const yScale = d3.scaleBand()
    .domain(sorted.map(f => f.filename))
    .range([0, innerH])
    .padding(0.25)

  // X scale: 0 to maxChanges, split at center
  const xScale = d3.scaleLinear()
    .domain([0, maxChanges])
    .range([0, innerW])

  // File rows
  const rows = g.selectAll('.diff-row')
    .data(sorted)
    .enter()
    .append('g')
    .attr('class', 'diff-row')
    .attr('transform', d => `translate(0, ${yScale(d.filename)})`)
    .style('cursor', 'pointer')
    .on('click', (_e, d) => config.onFileClick(d))
    .on('mouseenter', (_e, d) => {
      config.onFileHover(d)
      d3.select(_e.currentTarget as Element)
        .select('.row-bg')
        .attr('opacity', 0.15)
    })
    .on('mouseleave', (_e, d) => {
      config.onFileHover(null)
      d3.select(_e.currentTarget as Element)
        .select('.row-bg')
        .attr('opacity', 0)
    })

  // Row background (hover highlight)
  rows.append('rect')
    .attr('class', 'row-bg')
    .attr('x', -margin.left)
    .attr('y', 0)
    .attr('width', config.width)
    .attr('height', yScale.bandwidth())
    .attr('fill', '#00a19b')
    .attr('opacity', 0)
    .attr('rx', 4)

  // File status color dot
  rows.append('circle')
    .attr('cx', -8)
    .attr('cy', yScale.bandwidth() / 2)
    .attr('r', 4)
    .attr('fill', d =>
      d.status === 'added'    ? '#00c896' :
      d.status === 'removed'  ? '#ff5e5e' :
      d.status === 'modified' ? '#e4dd3d' : '#8fb5b3'
    )

  // Filename label (truncated)
  rows.append('text')
    .attr('x', -18)
    .attr('y', yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('fill', '#8fb5b3')
    .attr('font-family', 'Geist Mono, monospace')
    .attr('font-size', 11)
    .text(d => {
      const parts = d.filename.split('/')
      const name  = parts[parts.length - 1]
      const dir   = parts.length > 1 ? parts[parts.length - 2] + '/' : ''
      return (dir + name).slice(0, 28)
    })

  // Additions bar (teal, left → right from center-ish)
  rows.append('rect')
    .attr('class', 'additions-bar')
    .attr('x', 0)
    .attr('y', yScale.bandwidth() * 0.15)
    .attr('width', 0) // animated
    .attr('height', yScale.bandwidth() * 0.4)
    .attr('fill', '#00a19b')
    .attr('rx', 2)
    .transition()
    .duration(600)
    .delay((_d, i) => i * 20)
    .ease(d3.easeCubicOut)
    .attr('width', d =>
      (d.additions / (d.additions + d.deletions || 1)) *
      xScale(d.changes)
    )

  // Deletions bar (red, continues after additions)
  rows.append('rect')
    .attr('class', 'deletions-bar')
    .attr('x', d =>
      (d.additions / (d.additions + d.deletions || 1)) *
      xScale(d.changes)
    )
    .attr('y', yScale.bandwidth() * 0.15)
    .attr('width', 0) // animated
    .attr('height', yScale.bandwidth() * 0.4)
    .attr('fill', '#ff5e5e')
    .attr('rx', 2)
    .transition()
    .duration(600)
    .delay((_d, i) => i * 20)
    .ease(d3.easeCubicOut)
    .attr('width', d =>
      (d.deletions / (d.additions + d.deletions || 1)) *
      xScale(d.changes)
    )

  // Stats labels right side
  rows.append('text')
    .attr('x', innerW + 8)
    .attr('y', yScale.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('fill', '#4d7c79')
    .attr('font-family', 'Geist Mono, monospace')
    .attr('font-size', 10)
    .text(d => `+${d.additions} -${d.deletions}`)

  return () => d3.select(container).selectAll('*').remove()
}


// ── CHART 2: Diff Summary Donut ──────────────────────────────────
// Donut chart showing file status breakdown

export function renderDiffDonut(
  container: HTMLElement,
  stats: DiffStats
): () => void {

  d3.select(container).selectAll('*').remove()

  const size   = 160
  const radius = size / 2
  const inner  = radius * 0.55

  const svg = d3.select(container)
    .append('svg')
    .attr('width', size)
    .attr('height', size)

  const g = svg.append('g')
    .attr('transform', `translate(${radius},${radius})`)

  const data = [
    { label: 'Modified', value: stats.modifiedFiles, color: '#e4dd3d' },
    { label: 'Added',    value: stats.addedFiles,    color: '#00c896' },
    { label: 'Removed',  value: stats.removedFiles,  color: '#ff5e5e' },
  ].filter(d => d.value > 0)

  const pie   = d3.pie<any>().value(d => d.value).sort(null)
  const arc   = d3.arc<any>().innerRadius(inner).outerRadius(radius - 4)
  const arcs  = pie(data)

  // Draw arcs with animation
  g.selectAll('path')
    .data(arcs)
    .enter()
    .append('path')
    .attr('fill', d => d.data.color)
    .attr('stroke', '#080d18')
    .attr('stroke-width', 2)
    .transition()
    .duration(700)
    .ease(d3.easeCubicOut)
    .attrTween('d', function(d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
      return (t: number) => arc(i(t)) as string
    })

  // Center text: total files
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-0.2em')
    .attr('fill', '#e8f4f3')
    .attr('font-family', 'Geist, sans-serif')
    .attr('font-size', 22)
    .attr('font-weight', 700)
    .text(stats.totalFiles)

  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .attr('fill', '#4d7c79')
    .attr('font-family', 'Geist, sans-serif')
    .attr('font-size', 9)
    .text('files changed')

  return () => d3.select(container).selectAll('*').remove()
}


// ── CHART 3: Commit Timeline for Diff ───────────────────────────
// Small timeline showing commits between base and head

export function renderDiffTimeline(
  container: HTMLElement,
  commits: import('../../types').CommitData[],
  config: { width: number; height: number;
            onCommitClick: (c: import('../../types').CommitData) => void }
): () => void {

  d3.select(container).selectAll('*').remove()

  if (!commits.length) return () => {}

  const margin = { top: 20, right: 20, bottom: 30, left: 20 }
  const innerW  = config.width  - margin.left - margin.right
  const innerH  = config.height - margin.top  - margin.bottom

  const svg = d3.select(container)
    .append('svg')
    .attr('width',  config.width)
    .attr('height', config.height)

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  const parseDate = (c: import('../../types').CommitData) =>
    new Date(c.author.date)

  const xScale = d3.scaleTime()
    .domain(d3.extent(commits, parseDate) as [Date, Date])
    .range([0, innerW])
    .nice()

  // Spine line
  g.append('line')
    .attr('x1', 0).attr('x2', innerW)
    .attr('y1', innerH / 2).attr('y2', innerH / 2)
    .attr('stroke', 'rgba(0,161,155,0.25)')
    .attr('stroke-width', 1.5)

  // Commit dots
  const dots = g.selectAll('.commit-dot')
    .data(commits)
    .enter()
    .append('g')
    .attr('class', 'commit-dot')
    .attr('transform', d =>
      `translate(${xScale(parseDate(d))}, ${innerH / 2})`
    )
    .style('cursor', 'pointer')
    .on('click', (_e, d) => config.onCommitClick(d))

  // Outer ring
  dots.append('circle')
    .attr('r', 0)
    .attr('fill', 'none')
    .attr('stroke', '#00a19b')
    .attr('stroke-width', 1)
    .attr('opacity', 0.4)
    .transition()
    .duration(400)
    .delay((_d, i) => i * 30)
    .attr('r', 10)

  // Inner dot
  dots.append('circle')
    .attr('r', 0)
    .attr('fill', '#00a19b')
    .transition()
    .duration(400)
    .delay((_d, i) => i * 30)
    .attr('r', 4)

  // X axis ticks
  g.append('g')
    .attr('transform', `translate(0, ${innerH})`)
    .call(
      d3.axisBottom(xScale)
        .ticks(Math.min(commits.length, 5))
        .tickFormat(d3.timeFormat('%b %d') as any)
        .tickSize(4)
    )
    .call(axis => {
      axis.select('.domain').remove()
      axis.selectAll('line').attr('stroke', 'rgba(0,161,155,0.2)')
      axis.selectAll('text')
        .attr('fill', '#4d7c79')
        .attr('font-family', 'Geist Mono, monospace')
        .attr('font-size', 10)
    })

  return () => d3.select(container).selectAll('*').remove()
}
