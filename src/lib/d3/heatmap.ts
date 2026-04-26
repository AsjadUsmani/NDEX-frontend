import * as d3 from 'd3'
import { heatColor } from './colors'
import type { FileNode } from '../../types/index.ts'

export interface HeatmapConfig {
  width: number
  height: number
  selectedFile: string | null
  onFileClick: (path: string) => void
}

interface HeatmapNodeData {
  name: string
  path: string
  type: 'root' | 'dir' | 'file'
  size: number
  changeCount: number
  children?: HeatmapNodeData[]
}

interface HeatmapCommitInput {
  changedFiles?: string[]
}

const MAX_VISIBLE_FILES = 320

function isDirectory(node: FileNode): boolean {
  return node.type === 'tree' || node.type === 'dir'
}

function buildTree(nodes: FileNode[], changeMap: Map<string, number>): HeatmapNodeData[] {
  return nodes
    .filter(node => node.name && node.path)
    .map(node => {
      if (isDirectory(node)) {
        return {
          name: node.name,
          path: node.path,
          type: 'dir' as const,
          size: Math.max(1, node.size || 1),
          changeCount: 0,
          children: buildTree(node.children || [], changeMap),
        }
      }

      return {
        name: node.name,
        path: node.path,
        type: 'file' as const,
        size: Math.max(1, node.size || 1),
        changeCount: changeMap.get(node.path) ?? 0,
      }
    })
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const flattened: FileNode[] = []
  const visit = (node: FileNode): void => {
    if (node.type === 'blob' || node.type === 'file') {
      flattened.push(node)
      return
    }

    node.children?.forEach(visit)
  }

  nodes.forEach(visit)
  return flattened
}

function filterTreeToPaths(nodes: FileNode[], allowedPaths: Set<string>): FileNode[] {
  return nodes
    .map(node => {
      if (isDirectory(node)) {
        const children = filterTreeToPaths(node.children || [], allowedPaths)
        return children.length > 0 ? { ...node, children } : null
      }

      return allowedPaths.has(node.path) ? node : null
    })
    .filter((node): node is FileNode => Boolean(node))
}

export function renderHeatmap(
  container: HTMLElement,
  files: FileNode[],
  commits: HeatmapCommitInput[],
  config: HeatmapConfig,
): () => void {
  d3.select(container).selectAll('*').remove()

  const width = Math.max(320, config.width)
  const height = Math.max(240, config.height)

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')

  const tooltipId = 'ndex-heatmap-tooltip'
  d3.select(`#${tooltipId}`).remove()
  const tooltip = d3.select(document.body)
    .append('div')
    .attr('id', tooltipId)
    .style('position', 'fixed')
    .style('pointer-events', 'none')
    .style('opacity', '0')
    .style('background', 'rgba(10, 16, 27, 0.96)')
    .style('border', '0.5px solid rgba(0, 161, 155, 0.35)')
    .style('border-radius', '10px')
    .style('padding', '10px 12px')
    .style('font-family', 'var(--font-mono)')
    .style('font-size', '12px')
    .style('color', '#e8f4f3')
    .style('box-shadow', '0 18px 40px rgba(0, 0, 0, 0.35)')
    .style('z-index', '9999')

  const changeMap = new Map<string, number>()
  commits.forEach(commit => {
    const touchedFiles = Array.isArray(commit.changedFiles) ? commit.changedFiles : []
    touchedFiles.forEach(path => {
      changeMap.set(path, (changeMap.get(path) ?? 0) + 1)
    })
  })

  const flattened = flattenFiles(files)
  if (flattened.length === 0) {
    return () => {
      tooltip.remove()
      d3.select(container).selectAll('*').remove()
    }
  }

  const rankedFiles = flattened
    .map(file => ({
      ...file,
      score: changeMap.get(file.path) ?? 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return (b.size ?? 0) - (a.size ?? 0)
    })

  const changedFiles = rankedFiles.filter(file => file.score > 0)
  const visibleFiles = (changedFiles.length > 0 ? changedFiles : rankedFiles).slice(0, MAX_VISIBLE_FILES)
  const visiblePaths = new Set(visibleFiles.map(file => file.path))
  const visibleTree = filterTreeToPaths(files, visiblePaths)

  const rootData: HeatmapNodeData = {
    name: 'Repository files',
    path: '',
    type: 'root',
    size: 0,
    changeCount: 0,
    children: buildTree(visibleTree, changeMap),
  }

  const hierarchy = d3.hierarchy<HeatmapNodeData>(rootData)
    .sum(node => (node.children?.length ? 0 : Math.max(1, node.changeCount || node.size)))
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  const layout = d3.treemap<HeatmapNodeData>()
    .size([width, height])
    .padding(2)
    .round(true)

  const root = layout(hierarchy)
  const leaves = root.leaves()
  const maxChange = d3.max(leaves, leaf => leaf.data.changeCount) ?? 1

  const cells = svg.selectAll<SVGGElement, d3.HierarchyRectangularNode<HeatmapNodeData>>('g')
    .data(leaves)
    .join('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`)
    .style('opacity', 1)

  cells.each(function drawCell(cell) {
    const node = d3.select(this)
    const data = cell.data
    const cellWidth = Math.max(0, cell.x1 - cell.x0)
    const cellHeight = Math.max(0, cell.y1 - cell.y0)
    const intensity = Math.max(data.changeCount / Math.max(1, maxChange), data.size / Math.max(1, root.value ?? 1))
    const isSelected = config.selectedFile === data.path

    node.append('rect')
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', heatColor(intensity))
      .attr('stroke', isSelected ? '#00a19b' : '#08101d')
      .attr('stroke-width', isSelected ? 2 : 1)
      .attr('opacity', data.changeCount === 0 ? 0.7 : 1)
      .style('cursor', 'pointer')
      .on('mouseenter', function handleEnter(event) {
        d3.select(this).attr('stroke', '#00a19b').attr('stroke-width', 2)
        tooltip
          .style('opacity', '1')
          .style('left', `${(event as MouseEvent).clientX + 16}px`)
          .style('top', `${(event as MouseEvent).clientY + 16}px`)
          .html(`
            <div style="font-weight: 700; margin-bottom: 4px">${data.path}</div>
            <div style="color: #8fb5b3">Changes: ${data.changeCount.toLocaleString()}</div>
            <div style="color: #8fb5b3">Size: ${data.size.toLocaleString()} bytes</div>
          `)
      })
      .on('mouseleave', function handleLeave() {
        d3.select(this).attr('stroke', isSelected ? '#00a19b' : '#08101d').attr('stroke-width', isSelected ? 2 : 1)
        tooltip.style('opacity', '0')
      })
      .on('click', () => {
        config.onFileClick(data.path)
      })

    if (cellWidth > 44 && cellHeight > 22) {
      const clipId = `clip-heat-${data.path.replace(/[^a-zA-Z0-9]/g, '-')}`
      node.append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('width', cellWidth)
        .attr('height', cellHeight)
        .attr('rx', 5)
        .attr('ry', 5)

      node.append('text')
        .attr('x', 8)
        .attr('y', 16)
        .attr('clip-path', `url(#${clipId})`)
        .style('font-size', '11px')
        .style('font-family', 'var(--font-mono)')
        .style('font-weight', 600)
        .attr('fill', 'rgba(255,255,255,0.88)')
        .text(data.name)

      node.append('text')
        .attr('x', 8)
        .attr('y', Math.min(34, cellHeight - 8))
        .attr('clip-path', `url(#${clipId})`)
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono)')
        .attr('fill', 'rgba(232, 244, 243, 0.72)')
        .text(`${data.changeCount} change${data.changeCount === 1 ? '' : 's'}`)
    }
  })

  return () => {
    tooltip.remove()
    d3.select(container).selectAll('*').remove()
  }
}
