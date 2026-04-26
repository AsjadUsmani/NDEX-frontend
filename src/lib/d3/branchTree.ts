import * as d3 from 'd3'
import type { BranchData, CommitData } from '../../types/index.ts'

export interface BranchTreeConfig {
  width: number
  height: number
  onBranchClick: (branch: BranchData) => void
}

interface BranchNode {
  id: string
  label: string
  branch?: BranchData
  children?: BranchNode[]
}

export function renderBranchTree(
  container: HTMLElement,
  branches: BranchData[],
  commits: CommitData[],
  config: BranchTreeConfig,
): () => void {
  d3.select(container).selectAll('*').remove()

  const width = Math.max(320, config.width)
  const height = Math.max(220, config.height)

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

  const defaultBranch = branches.find(branch => branch.isDefault)
    ?? branches.find(branch => branch.name === 'main' || branch.name === 'master')
    ?? branches[0]

  if (!defaultBranch) {
    return () => {
      tooltip.remove()
      d3.select(container).selectAll('*').remove()
    }
  }

  const featureBranches = branches.filter(branch => branch.name !== defaultBranch.name)

  const treeData: BranchNode = {
    id: 'head',
    label: 'HEAD',
    children: [
      {
        id: defaultBranch.name,
        label: defaultBranch.name,
        branch: defaultBranch,
        children: featureBranches.map(branch => ({
          id: branch.name,
          label: branch.name,
          branch,
        })),
      },
    ],
  }

  const root = d3.hierarchy<BranchNode>(treeData)
  const layout = d3.tree<BranchNode>().nodeSize([40, 200])
  const treeRoot = layout(root)

  const minX = d3.min(treeRoot.descendants(), d => d.x) ?? 0
  const maxX = d3.max(treeRoot.descendants(), d => d.x) ?? 0
  const translateX = 80
  const translateY = (height - (maxX - minX)) / 2 - minX

  const g = svg.append('g').attr('transform', `translate(${translateX},${translateY})`)

  const linkGenerator = d3.linkHorizontal<d3.HierarchyPointLink<BranchNode>, d3.HierarchyPointNode<BranchNode>>()
    .x(d => d.y)
    .y(d => d.x)

  const links = g.selectAll<SVGPathElement, d3.HierarchyPointLink<BranchNode>>('.branch-link')
    .data(treeRoot.links())
    .join('path')
    .attr('class', 'branch-link')
    .attr('d', d => linkGenerator(d) ?? '')
    .attr('fill', 'none')
    .attr('stroke', d => {
      const targetBranch = d.target.data.branch
      if (targetBranch?.isDefault) {
        return '#00a19b'
      }
      return '#e4dd3d'
    })
    .attr('stroke-width', d => (d.target.data.branch?.isDefault ? 2 : 1.5))
    .attr('stroke-dasharray', d => (d.target.data.branch?.isDefault ? '0' : '6,4'))

  links.attr('stroke-dashoffset', 0)

  const commitsByBranch = new Map<string, CommitData[]>()
  branches.forEach(branch => {
    const branchCommits = commits
      .filter(commit => commit.author.date <= branch.lastCommitDate)
      .slice(0, 3)
    commitsByBranch.set(branch.name, branchCommits)
  })

  treeRoot.links().forEach(link => {
    const branch = link.target.data.branch
    if (!branch) {
      return
    }

    const path = g.append('path')
      .attr('d', linkGenerator(link) ?? '')
      .attr('fill', 'none')
      .attr('stroke', 'none')

    const nodeCommits = commitsByBranch.get(branch.name) ?? []
    nodeCommits.slice(0, 3).forEach((_, index) => {
      const totalLength = (path.node() as SVGPathElement).getTotalLength()
      const point = (path.node() as SVGPathElement).getPointAtLength(totalLength * ((index + 1) / 4))

      g.append('circle')
        .attr('cx', point.x)
        .attr('cy', point.y)
        .attr('r', 4)
        .attr('fill', branch.isDefault ? '#00a19b' : '#e4dd3d')
        .attr('opacity', 0.6)
    })

    path.remove()
  })

  const mergeBranches = treeRoot.descendants().filter(node => {
    const name = node.data.branch?.name.toLowerCase() ?? ''
    return name.includes('feature') || name.includes('fix') || name.includes('dev')
  })

  const mainNode = treeRoot.descendants().find(node => node.data.branch?.name === defaultBranch.name)

  if (mainNode) {
    mergeBranches.forEach(node => {
      g.append('path')
        .attr('d', d3.linkHorizontal<{ source: [number, number]; target: [number, number] }, [number, number]>()({
          source: [node.y, node.x],
          target: [mainNode.y, mainNode.x],
        }) ?? '')
        .attr('fill', 'none')
        .attr('stroke', 'rgba(228,221,61,0.3)')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '4,4')
    })
  }

  const nodes = g.selectAll<SVGGElement, d3.HierarchyPointNode<BranchNode>>('.branch-node')
    .data(treeRoot.descendants())
    .join('g')
    .attr('class', 'branch-node')
    .attr('transform', d => `translate(${d.y},${d.x})`)

  nodes.append('circle')
    .attr('r', d => {
      if (!d.data.branch) {
        return 7
      }
      return d.data.branch.isDefault ? 10 : 8
    })
    .attr('fill', d => {
      if (!d.data.branch) {
        return '#4d7c79'
      }
      return d.data.branch.isDefault ? '#00a19b' : '#e4dd3d'
    })
    .style('cursor', d => (d.data.branch ? 'pointer' : 'default'))
    .on('click', (_, d) => {
      if (d.data.branch) {
        config.onBranchClick(d.data.branch)
      }
    })
    .on('mouseenter', function handleEnter(event, d) {
      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', d.data.branch?.isDefault ? 12 : 10)

      if (!d.data.branch) {
        return
      }

      const branch = d.data.branch
      const dateLabel = d3.timeFormat('%b %-d, %Y')(new Date(branch.lastCommitDate))
      tooltip
        .style('opacity', '1')
        .style('left', `${(event as MouseEvent).pageX + 14}px`)
        .style('top', `${(event as MouseEvent).pageY - 18}px`)
        .html(`<div style="font-weight:600;margin-bottom:4px">${branch.name}</div><div style="color:#8fb5b3">${branch.lastCommitMessage}</div><div style="color:#4d7c79">${dateLabel}</div>`)
    })
    .on('mouseleave', function handleLeave(_, d) {
      d3.select(this)
        .transition()
        .duration(300)
        .ease(d3.easeCubicOut)
        .attr('r', d.data.branch?.isDefault ? 10 : d.data.branch ? 8 : 7)

      tooltip.style('opacity', '0')
    })

  nodes.append('text')
    .attr('x', 14)
    .attr('y', 4)
    .style('font-size', '12px')
    .style('font-family', 'IBM Plex Sans, sans-serif')
    .attr('fill', '#8fb5b3')
    .text(d => d.data.label)

  return () => {
    tooltip.remove()
    d3.select(container).selectAll('*').remove()
  }
}
