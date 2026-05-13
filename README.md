# GOMGraph Demo

> **Code by [Manas Raaj](https://github.com/Manas-5) × [Pablo Sánchez Martín](https://github.com/pablo-sanchez-sony) × [Claude](https://www.anthropic.com/claude) (Anthropic).**
> Built at Sony CSL Paris & Sony AI (Planetary Agenda track).

Interactive visualization of a knowledge graph extracted from **_Manuel pratique de la culture maraîchère de Paris_** by Moreau & Daverne (1845) — a 19th-century French market-gardening manual — using a production LLM pipeline I built during my Sony CSL Paris internship.

**Live demo:** _to be added after Vercel deploy_

**Source pipeline:** [github.com/Manas-5/GOMGraph-LLM-Based-KG-Extraction](https://github.com/Manas-5/GOMGraph-LLM-Based-KG-Extraction)

**Thesis:** [GOMGraph: LLM-Based Knowledge Graph Extraction From Historical Market Gardening Text](https://github.com/Manas-5/Internship_Theses/blob/main/main.pdf)

## What's in the graph

- **1,697 nodes** — entities extracted from the source text (plants, pests, equipment, locations, people, structures, plant parts, inputs)
- **6,294 relations** — typed connections (HasCharacteristic, AssociatedWith, GrownIn, PlantedIn, SeasonalRelatedness, Precedes, Uses, etc.)
- **Custom domain ontology** — 27 edge types and 51 entity-pair constraints, designed for agricultural knowledge representation
- **Extracted via LLaMA 3.1 70B** through a custom pipeline using a forked [Graphiti](https://github.com/getzep/graphiti) framework over [FalkorDB](https://www.falkordb.com/)

## Features

- Force-directed graph layout (`react-force-graph-2d`)
- Node-type filter sidebar (toggle Plant / Pest / Equipment / Location / etc.)
- Live search by entity name
- Click any node to pin its summary in the sidebar
- Hover for relation tooltips (the natural-language fact the LLM extracted)

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Graph viz | `react-force-graph-2d` |
| Data | Static JSON exported from FalkorDB |
| Deployment | Vercel |

The data is served as a static JSON file (~1.3 MB) generated from the original FalkorDB property graph. No backend at runtime; the entire visualization runs in the browser.

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

To regenerate `public/graph.json` from a fresh FalkorDB export, run `gomgraph-demo-data-prep.py` against `nodes_*.tsv` and `edges_*.tsv` from the upstream pipeline.

## License

This demo and the underlying GOMGraph code are part of an internship deliverable at Sony CSL Paris and Sony AI. Please contact the author for reuse terms.
