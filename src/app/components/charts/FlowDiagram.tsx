'use client';

// Generic column-based flow (Sankey-ish) diagram.
//
// This started life as the hard-wired SVG inside TechFlowSankey, which took
// nine specific CountryData props and a fixed eight-node topology. Everything
// topology-specific now lives in the caller: pass columns, nodes and links and
// the component does layout, stacking, hover highlighting and labelling.
//
// Layout rules:
//   - Node height within a column is proportional to its value, with a floor
//     so a small node is still hoverable.
//   - Link thickness is proportional to the link's value as a share of its
//     source node's total outflow, so the ribbons leaving a node exactly fill
//     that node's height. Ribbons are stacked in declaration order at both
//     ends, which is what stops them crossing unnecessarily.

import { useMemo, useState } from 'react';

export interface FlowColumn {
  id: string;
  label: string;
  color: string;
}

export interface FlowNode {
  id: string;
  label: string;
  column: string;
  value: number;
  // Rendered under the label. Callers format their own units.
  valueLabel?: string;
  color?: string;
}

export interface FlowLink {
  source: string;
  target: string;
  value: number;
}

interface Props {
  isDarkMode: boolean;
  columns: FlowColumn[];
  nodes: FlowNode[];
  links: FlowLink[];
  width?: number;
  height?: number;
  nodeWidth?: number;
  // Screen-reader description of the whole flow.
  ariaLabel: string;
}

interface Placed extends FlowNode {
  x: number;
  y: number;
  h: number;
  fill: string;
  columnIndex: number;
}

const TOP_PAD = 34;
const BOTTOM_PAD = 12;
const NODE_GAP = 14;
const MIN_NODE_HEIGHT = 16;
const MIN_LINK_HEIGHT = 2;

export default function FlowDiagram({
  isDarkMode,
  columns,
  nodes,
  links,
  width = 820,
  height = 400,
  nodeWidth = 18,
  ariaLabel,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const placed = useMemo<Placed[]>(() => {
    const sidePad = 90;
    const span = width - sidePad * 2 - nodeWidth;
    const out: Placed[] = [];

    columns.forEach((column, columnIndex) => {
      const members = nodes.filter(n => n.column === column.id);
      if (members.length === 0) return;

      const x = columns.length === 1
        ? sidePad
        : sidePad + (span / (columns.length - 1)) * columnIndex;

      const total = members.reduce((s, n) => s + Math.max(n.value, 0), 0);
      const available = height - TOP_PAD - BOTTOM_PAD - NODE_GAP * (members.length - 1);
      const flexible = Math.max(available - MIN_NODE_HEIGHT * members.length, 0);

      let y = TOP_PAD;
      members.forEach(node => {
        const share = total > 0 ? Math.max(node.value, 0) / total : 1 / members.length;
        const h = MIN_NODE_HEIGHT + flexible * share;
        out.push({
          ...node,
          x,
          y,
          h,
          fill: node.color ?? column.color,
          columnIndex,
        });
        y += h + NODE_GAP;
      });
    });

    return out;
  }, [columns, nodes, width, height, nodeWidth]);

  const byId = useMemo(() => {
    const map = new Map<string, Placed>();
    placed.forEach(p => map.set(p.id, p));
    return map;
  }, [placed]);

  // Ribbons, stacked at both ends. Offsets are tracked per node so a node with
  // three outgoing links has them laid head-to-tail down its right edge.
  const ribbons = useMemo(() => {
    const outTotals = new Map<string, number>();
    const inTotals = new Map<string, number>();
    for (const link of links) {
      outTotals.set(link.source, (outTotals.get(link.source) ?? 0) + Math.max(link.value, 0));
      inTotals.set(link.target, (inTotals.get(link.target) ?? 0) + Math.max(link.value, 0));
    }

    const outCursor = new Map<string, number>();
    const inCursor = new Map<string, number>();

    return links.flatMap((link, index) => {
      const source = byId.get(link.source);
      const target = byId.get(link.target);
      if (!source || !target) return [];

      const outTotal = outTotals.get(link.source) ?? 0;
      const inTotal = inTotals.get(link.target) ?? 0;
      const sourceH = Math.max(outTotal > 0 ? (Math.max(link.value, 0) / outTotal) * source.h : source.h, MIN_LINK_HEIGHT);
      const targetH = Math.max(inTotal > 0 ? (Math.max(link.value, 0) / inTotal) * target.h : target.h, MIN_LINK_HEIGHT);

      const sourceOffset = outCursor.get(link.source) ?? 0;
      const targetOffset = inCursor.get(link.target) ?? 0;
      outCursor.set(link.source, sourceOffset + sourceH);
      inCursor.set(link.target, targetOffset + targetH);

      const x1 = source.x + nodeWidth;
      const x2 = target.x;
      const y1 = source.y + sourceOffset;
      const y2 = target.y + targetOffset;
      const midX = (x1 + x2) / 2;

      const d = [
        `M ${x1} ${y1}`,
        `C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
        `L ${x2} ${y2 + targetH}`,
        `C ${midX} ${y2 + targetH}, ${midX} ${y1 + sourceH}, ${x1} ${y1 + sourceH}`,
        'Z',
      ].join(' ');

      return [{ key: `${link.source}-${link.target}-${index}`, d, source: link.source, target: link.target, fill: source.fill }];
    });
  }, [links, byId, nodeWidth]);

  const labelColor = isDarkMode ? '#E5E7EB' : '#374151';
  const valueColor = isDarkMode ? '#9CA3AF' : '#6B7280';

  if (placed.length === 0) {
    return (
      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No flow data available for this selection.
      </p>
    );
  }

  const lastColumn = columns.length - 1;

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="mx-auto" role="img" aria-label={ariaLabel}>
        {ribbons.map(r => {
          const related = hovered === r.source || hovered === r.target;
          return (
            <path
              key={r.key}
              d={r.d}
              fill={r.fill}
              fillOpacity={hovered ? (related ? 0.55 : 0.08) : 0.22}
              className="transition-all duration-200"
            />
          );
        })}

        {placed.map(node => {
          const isFirst = node.columnIndex === 0;
          const isLast = node.columnIndex === lastColumn;
          const anchorX = isFirst
            ? node.x - 6
            : isLast
              ? node.x + nodeWidth + 6
              : node.x + nodeWidth / 2;
          const anchor = isFirst ? 'end' : isLast ? 'start' : 'middle';
          const dimmed = hovered !== null && hovered !== node.id;

          return (
            <g
              key={node.id}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.id)}
              onBlur={() => setHovered(null)}
              tabIndex={0}
              className="cursor-pointer focus:outline-none"
            >
              <title>{node.valueLabel ? `${node.label}: ${node.valueLabel}` : node.label}</title>
              <rect
                x={node.x}
                y={node.y}
                width={nodeWidth}
                height={node.h}
                fill={node.fill}
                fillOpacity={dimmed ? 0.4 : 1}
                rx={4}
                className="transition-all duration-200"
              />
              <text
                x={anchorX}
                y={node.y + node.h / 2 - (node.valueLabel ? 6 : 0)}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill={labelColor}
                fontSize={11}
                fontWeight={hovered === node.id ? 700 : 400}
              >
                {node.label}
              </text>
              {node.valueLabel && (
                <text
                  x={anchorX}
                  y={node.y + node.h / 2 + 8}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  fill={valueColor}
                  fontSize={10}
                >
                  {node.valueLabel}
                </text>
              )}
            </g>
          );
        })}

        {columns.map((column, i) => {
          const x = columns.length === 1
            ? 90
            : 90 + ((width - 180 - nodeWidth) / (columns.length - 1)) * i;
          const anchor = i === 0 ? 'start' : i === lastColumn ? 'end' : 'middle';
          const tx = i === 0 ? x : i === lastColumn ? x + nodeWidth : x + nodeWidth / 2;
          return (
            <text
              key={column.id}
              x={tx}
              y={18}
              fill={column.color}
              fontSize={11}
              fontWeight={700}
              textAnchor={anchor}
              letterSpacing={1}
            >
              {column.label.toUpperCase()}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
