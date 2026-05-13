"use client";

import { useEffect, useMemo, useState } from "react";
import GraphCanvas from "@/components/GraphCanvas";
import type { GraphData, GraphNode } from "@/lib/types";

// Default-hidden node types — Episodic and bare "Entity" nodes are document chunks /
// fallback buckets that clutter the visualization without adding semantic value.
const DEFAULT_HIDDEN = new Set(["Episodic", "Entity"]);

export default function Home() {
  const [data, setData] = useState<GraphData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    fetch("/graph.json")
      .then((r) => r.json())
      .then((json: GraphData) => {
        setData(json);
        const types = new Set(json.nodes.map((n) => n.type));
        const enabled = new Set<string>();
        for (const t of types) if (!DEFAULT_HIDDEN.has(t)) enabled.add(t);
        setSelectedTypes(enabled);
      });
  }, []);

  const typeCounts = useMemo(() => {
    if (!data) return new Map<string, number>();
    const m = new Map<string, number>();
    for (const n of data.nodes) m.set(n.type, (m.get(n.type) ?? 0) + 1);
    return m;
  }, [data]);

  const sortedTypes = useMemo(
    () => Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]),
    [typeCounts],
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="flex h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold">GOMGraph</h1>
            <p className="text-xs text-neutral-500">
              Knowledge graph extracted from{" "}
              <em>Manuel pratique de la culture maraîchère de Paris</em> (Moreau &amp; Daverne, 1845).
              Built at Sony CSL Paris (Planetary Agenda track).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Manas-5/GOMGraph-LLM-Based-KG-Extraction"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://github.com/Manas-5/Internship_Theses/blob/main/main.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              Thesis
            </a>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-neutral-200 bg-white px-4 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Search</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Plant, Pest, Place..."
              className="w-full rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-600">Node types</label>
              <button
                onClick={() => setSelectedTypes(new Set(typeCounts.keys()))}
                className="text-[10px] text-neutral-500 hover:text-neutral-900"
              >
                show all
              </button>
            </div>
            <ul className="space-y-1">
              {sortedTypes.map(([type, count]) => {
                const active = selectedTypes.has(type);
                return (
                  <li key={type}>
                    <button
                      onClick={() => toggleType(type)}
                      className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs transition ${
                        active
                          ? "bg-neutral-100 text-neutral-900"
                          : "text-neutral-400 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: colorForType(type) }}
                        />
                        {type}
                      </span>
                      <span className="text-neutral-400">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {selectedNode ? (
            <div className="mt-2 rounded border border-neutral-200 bg-neutral-50 p-3 text-xs">
              <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500">
                {selectedNode.type}
              </div>
              <div className="mb-2 text-sm font-semibold text-neutral-900">
                {selectedNode.name}
              </div>
              <div className="leading-snug text-neutral-700">
                {selectedNode.summary || <span className="text-neutral-400">No summary</span>}
              </div>
            </div>
          ) : null}

          <div className="mt-auto pt-4 text-[10px] leading-snug text-neutral-400">
            Code by{" "}
            <a
              href="https://github.com/Manas-5"
              className="underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Manas Raaj
            </a>{" "}
            ×{" "}
            <a
              href="https://github.com/pablo-sanchez-sony"
              className="underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Pablo Sánchez Martín
            </a>{" "}
            ×{" "}
            <a
              href="https://www.anthropic.com/claude"
              className="underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Claude
            </a>
            .<br />
            Supervised at Sony CSL Paris &amp; Sony AI.
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-white">
          {data ? (
            <GraphCanvas
              data={data}
              selectedTypes={selectedTypes}
              searchQuery={searchQuery}
              onNodeSelect={setSelectedNode}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
              Loading graph data...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

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
