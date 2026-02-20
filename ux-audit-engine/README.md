# UX Audit Engine

AI-powered UX audit tool. Give it a URL, get a structured audit report.

## Quick Start

```bash
npm install
npx playwright install chromium
export ANTHROPIC_API_KEY=sk-ant-...

npx tsx src/index.ts https://example.com
```

## What It Does

1. **Collects** — Screenshots (desktop/mobile/tablet), DOM structure, Lighthouse metrics, axe-core accessibility scan
2. **Analyzes** — Claude vision API evaluates screenshots against structured criteria; deterministic checks for content, performance, and accessibility
3. **Reports** — Priority-scored findings with evidence, recommendations, and confidence scores

Output: `output/<hostname>/report.md` + `report.json`

## Documentation

- [Business & Implementation Plan](docs/BUSINESS-PLAN.md)
- [Ground Truth Data](ground-truth/rv-park-audit/)
- [CLAUDE.md](CLAUDE.md) — Architecture and development guide
