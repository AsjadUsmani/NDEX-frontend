import * as d3 from 'd3'
import { hashColor } from './colors'
import type { ContributorData } from '../../types/index.ts'

export interface ForceNode extends d3.SimulationNodeDatum {
  id: string
  login: string
  avatarUrl: string
  contributions: number
  color: string
  radius: number
}

export interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  strength: number
}

export interface ForceGraphConfig {
  width: number
  height: number
  onNodeClick: (contributor: ContributorData) => void
  onNodeHover: (contributor: ContributorData | null) => void
}

function contributorFromNode(node: ForceNode): ContributorData {
  return {
    login: node.login,
    avatarUrl: node.avatarUrl,
    contributions: node.contributions,
    name: null,
    url: `https://github.com/${node.login}`,
  }
}

function pseudoStrength(i: number, j: number): number {
  return ((i + 3) * (j + 5)) % 10 + 1
}

function initials(login: string): string {
  return login.slice(0, 2).toUpperCase()
}

export function renderForceGraph(
  container: HTMLElement,
  contributors: ContributorData[],
  config: ForceGraphConfig,
): () => void {
  d3.select(container).selectAll('*').remove()

  const width = Math.max(320, config.width)
  const height = Math.max(260, config.height)

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

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

  if (contributors.length === 0) {
    return () => {
      tooltip.remove()
      d3.select(container).selectAll('*').remove()
    }
  }

  const maxContributions = d3.max(contributors, d => d.contributions) ?? 1
  const medianContrib = d3.median(contributors, d => d.contributions) ?? 0

  const radiusScale = d3.scaleSqrt()
    .domain([0, maxContributions])
    .range([12, 48])

  const nodes: ForceNode[] = contributors.map((contributor, index) => ({
    id: contributor.login,
    login: contributor.login,
    avatarUrl: contributor.avatarUrl,
    contributions: contributor.contributions,
    color: hashColor(contributor.login),
    radius: radiusScale(contributor.contributions),
    x: (width * ((index % 5) + 1)) / 6,
    y: (height * (Math.floor(index / 5) + 1)) / 4,
  }))

  const topFive = nodes.slice(0, Math.min(nodes.length, 5))
  const links: ForceLink[] = []
  for (let i = 0; i < topFive.length; i += 1) {
    for (let j = i + 1; j < topFive.length; j += 1) {
      links.push({
        source: topFive[i].id,
        target: topFive[j].id,
        strength: pseudoStrength(i, j),
      })
    }
  }

  const linkLayer = svg.append('g')
  const nodeLayer = svg.append('g')

  const linkSelection = linkLayer.selectAll<SVGLineElement, ForceLink>('line')
    .data(links)
    .join('line')
    .attr('stroke', 'rgba(0,161,155,0.2)')
    .attr('stroke-width', 1)

  const nodeSelection = nodeLayer.selectAll<SVGGElement, ForceNode>('g')
    .data(nodes)
    .join('g')
    .style('cursor', 'grab')

  nodeSelection.append('circle')
    .attr('r', d => d.radius + 4)
    .attr('fill', 'none')
    .attr('stroke', d => d.color)
    .attr('stroke-opacity', 0.3)
    .attr('stroke-width', 2)

  nodeSelection.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.color)
    .attr('stroke', 'rgba(255,255,255,0.20)')
    .attr('stroke-width', 1.5)

  nodeSelection.each(function setNodeVisual(node) {
    const group = d3.select(this)
    const clipId = `clip-${node.id.replace(/[^a-zA-Z0-9-_]/g, '-')}`

    group.append('clipPath')
      .attr('id', clipId)
      .append('circle')
      .attr('r', node.radius - 1)

    const image = group.append('image')
      .attr('href', node.avatarUrl)
      .attr('x', -node.radius)
      .attr('y', -node.radius)
      .attr('width', node.radius * 2)
      .attr('height', node.radius * 2)
      .attr('clip-path', `url(#${clipId})`)

    image.on('error', () => {
      image.remove()
      group.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('fill', '#e8f4f3')
        .style('font-size', '11px')
        .style('font-family', 'Geist Mono, monospace')
        .text(initials(node.login))
    })
  })

  nodeSelection.append('text')
    .attr('y', d => d.radius + 16)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('font-family', 'IBM Plex Sans, sans-serif')
    .attr('fill', '#4d7c79')
    .style('display', d => (d.contributions > medianContrib ? 'block' : 'none'))
    .text(d => d.login)

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink<ForceNode, ForceLink>(links)
      .id(d => d.id)
      .strength(link => link.strength * 0.01)
      .distance(120))
    .force('charge', d3.forceManyBody().strength(-300).distanceMax(250))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide<ForceNode>().radius(d => d.radius + 8))
    .force('x', d3.forceX<ForceNode>(width / 2).strength(0.05))
    .force('y', d3.forceY<ForceNode>(height / 2).strength(0.05))

  simulation.on('tick', () => {
    linkSelection
      .attr('x1', d => (d.source as ForceNode).x ?? 0)
      .attr('y1', d => (d.source as ForceNode).y ?? 0)
      .attr('x2', d => (d.target as ForceNode).x ?? 0)
      .attr('y2', d => (d.target as ForceNode).y ?? 0)

    nodeSelection.attr('transform', d => `translate(${d.x ?? width / 2},${d.y ?? height / 2})`)
  })

  // Let the graph settle, then stop the simulation to avoid perpetual motion.
  const settleTimer = window.setTimeout(() => {
    simulation.alphaTarget(0)
    simulation.stop()
  }, 5000)

  const dragBehavior = d3.drag<SVGGElement, ForceNode>()
    .on('start', (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0.3).restart()
      }
      d.fx = d.x
      d.fy = d.y
      d3.select(event.sourceEvent.currentTarget as SVGGElement).style('cursor', 'grabbing')
    })
    .on('drag', (event, d) => {
      d.fx = event.x
      d.fy = event.y
    })
    .on('end', (event, d) => {
      if (!event.active) {
        simulation.alphaTarget(0)
      }
      d.fx = null
      d.fy = null
      d3.select(event.sourceEvent.currentTarget as SVGGElement).style('cursor', 'grab')

      // Briefly reheat after drag and then settle again.
      simulation.alpha(0.25).restart()
      window.setTimeout(() => {
        simulation.alphaTarget(0)
        simulation.stop()
      }, 1200)
    })

  nodeSelection.call(dragBehavior)

  nodeSelection
    .on('mouseenter', function handleEnter(event, node) {
      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('transform', `translate(${node.x ?? width / 2},${node.y ?? height / 2}) scale(1.2)`)

      tooltip
        .style('opacity', '1')
        .style('left', `${(event as MouseEvent).pageX + 14}px`)
        .style('top', `${(event as MouseEvent).pageY - 18}px`)
        .html(`<div style="font-weight:600">${node.login}</div><div style="color:#8fb5b3">${node.contributions.toLocaleString()} contributions</div><div style="color:#4d7c79">Click to view on GitHub</div>`)

      config.onNodeHover(contributorFromNode(node))
    })
    .on('mouseleave', function handleLeave(_, node) {
      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('transform', `translate(${node.x ?? width / 2},${node.y ?? height / 2}) scale(1)`)

      tooltip.style('opacity', '0')
      config.onNodeHover(null)
    })
    .on('click', (_, node) => {
      config.onNodeClick(contributorFromNode(node))
    })

  return () => {
    window.clearTimeout(settleTimer)
    tooltip.remove()
    simulation.stop()
    d3.select(container).selectAll('*').remove()
  }
}
