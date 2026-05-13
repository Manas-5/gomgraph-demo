"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphData, GraphLink, GraphNode } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
      Loading graph engine...
    </div>
  ),
});

// Stable palette per node type. Order is deterministic so colors don't shuffle.
const TYPE_COLORS: Record<string, string> = {
  Plant: "#22c55e",
  PlantPart: "#65a30d",
  Pest: "#ef4444",
  Equipment: "#3b82f6",
  Structure: "#6366f1",
  Input: "#f59e0b",
  Location: "#a855f7",
  People: "#ec4899",
  Episodic: "#94a3b8",
  Entity: "#64748b",
};

function colorForType(type: string): string {
  return TYPE_COLORS[type] ?? "#64748b";
}

type Props = {
  data: GraphData;
  selectedTypes: Set<string>;
  searchQuery: string;
  onNodeSelect: (node: GraphNode | null) => void;
};

export default function GraphCanvas({
  data,
  selectedTypes,
  searchQuery,
  onNodeSelect,
}: Props) {
  // We deep-copy to avoid react-force-graph mutating the data in place across renders.
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const allowedNodeIds = new Set<string>();
    const nodes = data.nodes
      .filter((n) => selectedTypes.has(n.type))
      .filter((n) => (q ? n.name.toLowerCase().includes(q) : true));
    for (const n of nodes) allowedNodeIds.add(n.id);
    const links = data.links.filter(
      (l) => allowedNodeIds.has(l.source as string) && allowedNodeIds.has(l.target as string),
    );
    return {
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l })),
    };
  }, [data, selectedTypes, searchQuery]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const nodeCanvasObject = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      if (node.x === undefined || node.y === undefined) return;
      const fontSize = 11 / globalScale;
      const color = colorForType(node.type);

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4 / Math.sqrt(globalScale), 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // Label — only show on closer zoom levels for readability
      if (globalScale > 1.2) {
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = "#1f2937";
        const truncated = node.name.length > 28 ? `${node.name.slice(0, 28)}...` : node.name;
        ctx.fillText(truncated, node.x, node.y + 6 / Math.sqrt(globalScale));
      }
    },
    [],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <ForceGraph2D
        graphData={filteredData}
        width={dimensions.width}
        height={dimensions.height}
        nodeId="id"
        nodeLabel={(node: GraphNode) =>
          `<div style="max-width:320px;padding:6px 8px;font:12px sans-serif">
             <div style="font-weight:600;margin-bottom:4px">${escapeHtml(node.name)}</div>
             <div style="color:#6b7280;font-size:11px;margin-bottom:6px">${escapeHtml(node.type)}</div>
             <div style="color:#374151;font-size:11px;line-height:1.4">${escapeHtml(node.summary?.slice(0, 220) || "")}${(node.summary?.length || 0) > 220 ? "..." : ""}</div>
           </div>`
        }
        linkLabel={(link: GraphLink) =>
          `<div style="max-width:320px;padding:6px 8px;font:12px sans-serif">
             <div style="font-weight:600;margin-bottom:4px">${escapeHtml(link.name)}</div>
             <div style="color:#374151;font-size:11px;line-height:1.4">${escapeHtml(link.fact || "")}</div>
           </div>`
        }
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={0.92}
        linkColor={() => "rgba(120,120,120,0.25)"}
        linkWidth={0.7}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node, color, ctx) => {
          const n = node as GraphNode & { x?: number; y?: number };
          if (n.x === undefined || n.y === undefined) return;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 8, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeClick={(node) => onNodeSelect(node as GraphNode)}
        onBackgroundClick={() => onNodeSelect(null)}
        cooldownTicks={120}
      />
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
