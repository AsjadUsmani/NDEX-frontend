import * as d3 from 'd3'
import type { IssueStats, PRData, PRStats } from '../../types/index.ts'

export interface ActivityChartConfig {
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  onWeekHover: (week: string | null, data?: any) => void
}

interface WeeklyCombinedData {
  week: string
  openedPRs: number
  mergedPRs: number
  openedIssues: number
  closedIssues: number
}

function createTooltip() {
  return d3.select(document.body)
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
}

function parseWeekLabel(week: string): Date {
  return new Date(week)
}

function startOfWeekUTC(date: Date): string {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = copy.getUTCDay()
  const diff = (day + 6) % 7
  copy.setUTCDate(copy.getUTCDate() - diff)
  copy.setUTCHours(0, 0, 0, 0)
  return copy.toISOString().slice(0, 10)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getLastWeeks(count: number): string[] {
  const weeks: string[] = []
  const current = new Date()
  for (let index = count - 1; index >= 0; index -= 1) {
    const weekDate = new Date(current)
    weekDate.setUTCDate(weekDate.getUTCDate() - index * 7)
    weeks.push(startOfWeekUTC(weekDate))
  }
  return weeks
}

function combineWeeklyData(prStats: PRStats, issueStats: IssueStats): WeeklyCombinedData[] {
  const map = new Map<string, WeeklyCombinedData>()

  prStats.weeklyActivity.forEach(week => {
    map.set(week.week, {
      week: week.week,
      openedPRs: week.opened,
      mergedPRs: week.merged,
      openedIssues: 0,
      closedIssues: 0,
    })
  })

  issueStats.weeklyActivity.forEach(week => {
    const existing = map.get(week.week)
    if (existing) {
      existing.openedIssues = week.opened
      existing.closedIssues = week.closed
      return
    }

    map.set(week.week, {
      week: week.week,
      openedPRs: 0,
      mergedPRs: 0,
      openedIssues: week.opened,
      closedIssues: week.closed,
    })
  })

  const weeks = Array.from(map.values()).sort((a, b) => parseWeekLabel(a.week).getTime() - parseWeekLabel(b.week).getTime())
  const lastTwelve = getLastWeeks(12)
  return weeks.filter(entry => lastTwelve.includes(entry.week)).slice(-12)
}

export function renderActivityChart(
  container: HTMLElement,
  prStats: PRStats,
  issueStats: IssueStats,
  config: ActivityChartConfig,
): () => void {
  d3.select(container).selectAll('*').remove()

  const { width, height, margin } = config
  const innerW = Math.max(0, width - margin.left - margin.right)
  const innerH = Math.max(0, height - margin.top - margin.bottom)
  const tooltip = createTooltip()

  const data = combineWeeklyData(prStats, issueStats)
  if (!data.length || innerW <= 0 || innerH <= 0) {
    return () => {
      tooltip.remove()
      d3.select(container).selectAll('*').remove()
    }
  }

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const yMax = d3.max(data, d => Math.max(d.openedPRs, d.mergedPRs, d.openedIssues, d.closedIssues)) ?? 1
  const xScale = d3.scaleBand<string>().domain(data.map(d => d.week)).range([0, innerW]).padding(0.22)
  const yScale = d3.scaleLinear().domain([0, yMax + 2]).range([innerH - 38, 24]).nice()
  const barWidth = Math.max(2, (xScale.bandwidth() / 4) - 4)
  const colors = {
    openedPRs: '#00a19b',
    mergedPRs: '#e4dd3d',
    openedIssues: '#3b82f6',
    closedIssues: '#00c896',
  }

  const defs = svg.append('defs')
  const gradient = defs.append('linearGradient').attr('id', 'pr-activity-gradient').attr('x1', '0%').attr('x2', '100%')
  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#00a19b')
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#e4dd3d')

  g.append('g')
    .call(d3.axisLeft(yScale).ticks(5).tickFormat(value => `${value}`))
    .selectAll('text')
    .attr('fill', '#4d7c79')
    .style('font-size', '11px')
    .style('font-family', 'IBM Plex Sans, sans-serif')

  g.selectAll('.domain').attr('stroke', 'none')
  g.selectAll('g.tick line')
    .attr('stroke', 'rgba(0,161,155,0.10)')
    .attr('stroke-dasharray', '2,4')

  const xAxis = g.append('g').attr('transform', `translate(0,${innerH - 20})`)
  xAxis.call(d3.axisBottom(xScale).tickValues(data.filter((_, index) => index % 2 === 0).map(d => d.week)).tickFormat(value => d3.timeFormat('%b %d')(parseWeekLabel(String(value)))))
  xAxis.selectAll('text').attr('fill', '#4d7c79').style('font-size', '11px').style('font-family', 'IBM Plex Sans, sans-serif')
  xAxis.selectAll('line').attr('stroke', 'rgba(0,161,155,0.2)')
  xAxis.selectAll('.domain').attr('stroke', 'rgba(0,161,155,0.2)')

  const legendItems = [
    { label: 'PRs Opened', color: colors.openedPRs },
    { label: 'PRs Merged', color: colors.mergedPRs },
    { label: 'Issues Opened', color: colors.openedIssues },
    { label: 'Issues Closed', color: colors.closedIssues },
  ]

  const legend = g.append('g').attr('transform', `translate(${innerW - 160},0)`)
  legendItems.forEach((item, index) => {
    const row = legend.append('g').attr('transform', `translate(0,${index * 16})`)
    row.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', item.color)
    row.append('text')
      .attr('x', 14)
      .attr('y', 9)
      .attr('fill', '#8fb5b3')
      .style('font-size', '11px')
      .style('font-family', 'IBM Plex Sans, sans-serif')
      .text(item.label)
  })

  const maxBand = xScale.bandwidth()
  const groupOffsets = [-1.5, -0.5, 0.5, 1.5].map(multiplier => (maxBand / 4) * multiplier)

  const barGroups = g.append('g')
  const tooltipFormatter = d3.timeFormat('%b %d, %Y')

  const drawBar = (
    className: string,
    valueAccessor: (item: WeeklyCombinedData) => number,
    color: string,
    delayOffset: number,
  ): void => {
    const bars = barGroups.selectAll<SVGRectElement, WeeklyCombinedData>(`.${className}`)
      .data(data)
      .join('rect')
      .attr('class', className)
      .attr('x', d => (xScale(d.week) ?? 0) + (maxBand / 2) + groupOffsets[delayOffset])
      .attr('y', innerH - 20)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('rx', 3)
      .attr('fill', color)
      .style('cursor', 'pointer')

    bars.transition()
      .duration(600)
      .delay((_, index) => index * 30 + delayOffset * 60)
      .ease(d3.easeCubicOut)
      .attr('y', d => yScale(valueAccessor(d)))
      .attr('height', d => Math.max(0, innerH - 20 - yScale(valueAccessor(d))))

    bars.on('mouseenter', function handleEnter(event, item) {
      const weekLabel = tooltipFormatter(parseWeekLabel(item.week))
      tooltip
        .style('opacity', '1')
        .style('left', `${event.pageX + 16}px`)
        .style('top', `${event.pageY - 20}px`)
        .html(`
          <div style="font-weight:600;margin-bottom:6px">${weekLabel}</div>
          <div style="color:#00a19b">PRs opened: ${item.openedPRs}</div>
          <div style="color:#e4dd3d">PRs merged: ${item.mergedPRs}</div>
          <div style="color:#3b82f6">Issues opened: ${item.openedIssues}</div>
          <div style="color:#00c896">Issues closed: ${item.closedIssues}</div>
        `)
      config.onWeekHover(item.week, item)
    })
      .on('mousemove', function handleMove(event, item) {
        tooltip.style('left', `${event.pageX + 16}px`).style('top', `${event.pageY - 20}px`)
        config.onWeekHover(item.week, item)
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', '0')
        config.onWeekHover(null)
      })
  }

  drawBar('bar-open-pr', d => d.openedPRs, colors.openedPRs, 0)
  drawBar('bar-merged-pr', d => d.mergedPRs, colors.mergedPRs, 1)
  drawBar('bar-open-issues', d => d.openedIssues, colors.openedIssues, 2)
  drawBar('bar-closed-issues', d => d.closedIssues, colors.closedIssues, 3)

  const crosshair = g.append('line')
    .attr('y1', 20)
    .attr('y2', innerH - 20)
    .attr('stroke', 'rgba(0,161,155,0.35)')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,4')
    .style('opacity', 0)

  svg.on('mouseleave', () => {
    crosshair.style('opacity', 0)
  })

  return () => {
    tooltip.remove()
    d3.select(container).selectAll('*').remove()
  }
}

export function renderMergeGauge(
  container: HTMLElement,
  mergeRate: number,
  avgMergeTimeHours: number,
): () => void {
  d3.select(container).selectAll('*').remove()

  const width = 220
  const height = 160
  const radius = 66
  const arcAngle = (clamp(mergeRate, 0, 100) / 100) * Math.PI
  const cx = width / 2
  const cy = 112

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const gaugeColor = mergeRate < 40 ? '#ff5e5e' : mergeRate < 70 ? '#e4dd3d' : mergeRate < 85 ? '#00a19b' : '#00c896'
  const arc = d3.arc()
    .innerRadius(radius)
    .outerRadius(radius)
    .startAngle(-Math.PI)
    .endAngle(0)

  svg.append('path')
    .attr('d', arc({} as d3.DefaultArcObject) ?? '')
    .attr('transform', `translate(${cx},${cy})`)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(0,161,155,0.15)')
    .attr('stroke-width', 16)
    .attr('stroke-linecap', 'round')

  const valuePath = svg.append('path')
    .attr('transform', `translate(${cx},${cy})`)
    .attr('fill', 'none')
    .attr('stroke', gaugeColor)
    .attr('stroke-width', 16)
    .attr('stroke-linecap', 'round')

  const valueArc = d3.arc().innerRadius(radius).outerRadius(radius).startAngle(-Math.PI).endAngle(-Math.PI + arcAngle)
  valuePath.attr('d', valueArc({} as d3.DefaultArcObject) ?? '')

  const textGroup = svg.append('g').attr('transform', `translate(${cx},${78})`)
  textGroup.append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', '#e4dd3d')
    .style('font-family', 'Syne, sans-serif')
    .style('font-size', '32px')
    .style('font-weight', '700')
    .text(`${Math.round(mergeRate)}%`)

  textGroup.append('text')
    .attr('y', 24)
    .attr('text-anchor', 'middle')
    .attr('fill', '#4d7c79')
    .style('font-family', 'JetBrains Mono, monospace')
    .style('font-size', '12px')
    .text('Merge Rate')

  svg.append('text')
    .attr('x', 20)
    .attr('y', 146)
    .attr('fill', '#4d7c79')
    .style('font-family', 'JetBrains Mono, monospace')
    .style('font-size', '11px')
    .text('0%')

  svg.append('text')
    .attr('x', width - 20)
    .attr('y', 146)
    .attr('text-anchor', 'end')
    .attr('fill', '#4d7c79')
    .style('font-family', 'JetBrains Mono, monospace')
    .style('font-size', '11px')
    .text('100%')

  const avgText = avgMergeTimeHours > 48 ? `${(avgMergeTimeHours / 24).toFixed(1)} days avg` : `${avgMergeTimeHours.toFixed(1)} hrs avg`
  svg.append('text')
    .attr('x', cx)
    .attr('y', 156)
    .attr('text-anchor', 'middle')
    .attr('fill', '#00a19b')
    .style('font-family', 'JetBrains Mono, monospace')
    .style('font-size', '14px')
    .text(avgText)

  return () => {
    d3.select(container).selectAll('*').remove()
  }
}

export function renderPRSizeChart(
  container: HTMLElement,
  prs: PRData[],
  config: { width: number; height: number; onPRClick: (pr: PRData) => void },
): () => void {
  d3.select(container).selectAll('*').remove()

  const width = Math.max(320, config.width)
  const height = Math.max(280, config.height)
  const margin = { top: 24, right: 24, bottom: 42, left: 54 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const tooltip = createTooltip()
  if (!prs.length) {
    return () => {
      tooltip.remove()
      d3.select(container).selectAll('*').remove()
    }
  }

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
  const xMax = d3.max(prs, d => d.additions) ?? 1
  const yMax = d3.max(prs, d => d.deletions) ?? 1
  const xScale = d3.scaleLinear().domain([0, xMax]).range([0, innerW]).nice()
  const yScale = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]).nice()
  const rScale = d3.scaleSqrt().domain([0, d3.max(prs, d => d.changedFiles) ?? 1]).range([4, 14])

  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(5))
    .selectAll('text')
    .attr('fill', '#4d7c79')
    .style('font-size', '11px')
    .style('font-family', 'IBM Plex Sans, sans-serif')

  g.append('g')
    .call(d3.axisLeft(yScale).ticks(5))
    .selectAll('text')
    .attr('fill', '#4d7c79')
    .style('font-size', '11px')
    .style('font-family', 'IBM Plex Sans, sans-serif')

  g.selectAll('.domain').attr('stroke', 'rgba(0,161,155,0.20)')
  g.selectAll('line').attr('stroke', 'rgba(0,161,155,0.10)')

  const medianX = d3.median(prs, d => d.additions) ?? 0
  const medianY = d3.median(prs, d => d.deletions) ?? 0

  g.append('line')
    .attr('x1', xScale(medianX))
    .attr('x2', xScale(medianX))
    .attr('y1', 0)
    .attr('y2', innerH)
    .attr('stroke', 'rgba(0,161,155,0.20)')
    .attr('stroke-dasharray', '5,4')

  g.append('line')
    .attr('x1', 0)
    .attr('x2', innerW)
    .attr('y1', yScale(medianY))
    .attr('y2', yScale(medianY))
    .attr('stroke', 'rgba(0,161,155,0.20)')
    .attr('stroke-dasharray', '5,4')

  g.append('text')
    .attr('x', innerW - 12)
    .attr('y', 16)
    .attr('text-anchor', 'end')
    .attr('fill', '#4d7c79')
    .style('font-size', '11px')
    .text('Large PRs')

  g.append('text')
    .attr('x', 8)
    .attr('y', innerH - 8)
    .attr('fill', '#4d7c79')
    .style('font-size', '11px')
    .text('Small PRs')

  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 34)
    .attr('text-anchor', 'middle')
    .attr('fill', '#8fb5b3')
    .style('font-size', '11px')
    .style('font-family', 'JetBrains Mono, monospace')
    .text('Lines Added')

  g.append('text')
    .attr('transform', `translate(-34,${innerH / 2}) rotate(-90)`)
    .attr('text-anchor', 'middle')
    .attr('fill', '#8fb5b3')
    .style('font-size', '11px')
    .style('font-family', 'JetBrains Mono, monospace')
    .text('Lines Deleted')

  const circles = g.selectAll('circle')
    .data(prs)
    .join('circle')
    .attr('cx', d => xScale(d.additions))
    .attr('cy', d => yScale(d.deletions))
    .attr('r', d => rScale(d.changedFiles))
    .attr('fill', d => (d.merged ? '#00a19b' : d.state === 'closed' ? '#ff5e5e' : '#e4dd3d'))
    .attr('stroke', 'rgba(255,255,255,0.20)')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')

  circles.transition().duration(400).delay((_, index) => index * 10).ease(d3.easeCubicOut).attr('opacity', 1)

  circles.on('mouseenter', function handleEnter(event, pr) {
    d3.select(this).transition().duration(200).attr('r', rScale(pr.changedFiles) * 1.5)
    const title = pr.title.length > 40 ? `${pr.title.slice(0, 40)}...` : pr.title
    tooltip
      .style('opacity', '1')
      .style('left', `${event.pageX + 16}px`)
      .style('top', `${event.pageY - 20}px`)
      .html(`
        <div style="font-weight:600;margin-bottom:4px">#${pr.number} ${title}</div>
        <div style="color:#8fb5b3">${pr.author}</div>
        <div style="color:#00a19b">+${pr.additions.toLocaleString()} / -${pr.deletions.toLocaleString()}</div>
        <div style="color:#4d7c79">${pr.merged ? 'Merged' : pr.state.toUpperCase()}</div>
      `)
  }).on('mousemove', function handleMove(event) {
    tooltip.style('left', `${event.pageX + 16}px`).style('top', `${event.pageY - 20}px`)
  }).on('mouseleave', function handleLeave(_event, pr) {
    d3.select(this).transition().duration(200).attr('r', rScale(pr.changedFiles))
    tooltip.style('opacity', '0')
  }).on('click', (_, pr) => config.onPRClick(pr))

  return () => {
    tooltip.remove()
    d3.select(container).selectAll('*').remove()
  }
}

export function renderContributorBars(
  container: HTMLElement,
  contributors: { login: string; prCount: number }[],
  config: { width: number; height: number },
): () => void {
  d3.select(container).selectAll('*').remove()

  const width = Math.max(300, config.width)
  const height = Math.max(260, config.height)
  const margin = { top: 24, right: 18, bottom: 20, left: 110 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  if (!contributors.length) {
    return () => {
      d3.select(container).selectAll('*').remove()
    }
  }

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
  const xMax = d3.max(contributors, d => d.prCount) ?? 1
  const xScale = d3.scaleLinear().domain([0, xMax]).range([0, innerW]).nice()
  const yScale = d3.scaleBand<string>().domain(contributors.map(d => d.login)).range([0, innerH]).padding(0.18)

  const defs = svg.append('defs')
  const gradient = defs.append('linearGradient').attr('id', 'pr-contrib-gradient').attr('x1', '0%').attr('x2', '100%')
  gradient.append('stop').attr('offset', '0%').attr('stop-color', '#00a19b')
  gradient.append('stop').attr('offset', '100%').attr('stop-color', '#e4dd3d')

  g.append('g')
    .call(d3.axisLeft(yScale))
    .selectAll('text')
    .attr('fill', '#8fb5b3')
    .style('font-size', '11px')
    .style('font-family', 'JetBrains Mono, monospace')

  g.selectAll('.domain').attr('stroke', 'rgba(0,161,155,0.20)')
  g.selectAll('line').attr('stroke', 'rgba(0,161,155,0.10)')

  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(5))
    .selectAll('text')
    .attr('fill', '#4d7c79')
    .style('font-size', '11px')
    .style('font-family', 'IBM Plex Sans, sans-serif')

  const bars = g.selectAll('rect')
    .data(contributors)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => yScale(d.login) ?? 0)
    .attr('width', 0)
    .attr('height', yScale.bandwidth())
    .attr('rx', 3)
    .attr('fill', 'url(#pr-contrib-gradient)')

  bars.transition()
    .duration(600)
    .delay((_, index) => index * 80)
    .ease(d3.easeCubicOut)
    .attr('width', d => xScale(d.prCount))

  g.selectAll('.bar-label')
    .data(contributors)
    .join('text')
    .attr('class', 'bar-label')
    .attr('x', d => xScale(d.prCount) + 8)
    .attr('y', d => (yScale(d.login) ?? 0) + yScale.bandwidth() / 2 + 4)
    .attr('fill', '#8fb5b3')
    .style('font-size', '12px')
    .style('font-family', 'JetBrains Mono, monospace')
    .text(d => `${d.prCount}`)

  return () => {
    d3.select(container).selectAll('*').remove()
  }
}
