# CLAUDE.md

## Project Overview

**UX Audit Engine** — an AI-powered tool that takes a URL (or screenshots) as input and produces a structured UX audit report. Combines programmatic data collection (Playwright screenshots, Lighthouse metrics, axe-core accessibility) with LLM vision analysis (Claude API) to automate what previously required expensive human consultants.

**Status:** Proof of concept. Building toward validation against manual audit ground truth.

## Architecture

```
src/
├── collectors/          # Data collection pipeline (Playwright, Lighthouse, axe-core)
│   ├── screenshot.ts    # Multi-viewport screenshot capture
│   ├── dom.ts           # DOM structure extraction (nav, headings, images, forms, meta)
│   ├── lighthouse.ts    # Performance + a11y + SEO scoring
│   ├── accessibility.ts # axe-core WCAG violation scanning
│   └── index.ts         # Orchestrator — runs all collectors in parallel
│
├── analyzers/           # Analysis pipeline (LLM + deterministic)
│   ├── vision.ts        # Claude vision API — screenshot analysis per category
│   ├── content.ts       # Text analysis — readability, keyword stuffing, placeholders
│   └── index.ts         # Orchestrator — runs all analyzers, merges findings
│
├── criteria/            # Evaluation criteria database
│   └── index.ts         # Structured checklists per audit category (7 categories)
│
├── output/              # Report generation
│   └── report.ts        # Findings → summary stats, markdown report, JSON export
│
├── types.ts             # Core type definitions (AuditFinding, AuditReport, etc.)
└── index.ts             # CLI entry point — URL in, report out
```

## Key Design Decisions

- **Structured criteria, not open-ended prompts** — Each LLM evaluation uses a specific checklist (see `src/criteria/`). This is the key accuracy lever per Baymard research.
- **Hybrid analysis** — Deterministic tools (Lighthouse, axe-core) for quantifiable metrics; LLM vision for subjective design assessment. Cross-validate where they overlap.
- **Confidence scoring** — Every finding has a confidence score (0–1). Deterministic = 1.0; LLM = typically 0.7–0.9. Low-confidence findings can be flagged for human review.
- **Priority Score** = `User Impact / Estimated Effort` (higher = better ROI). This is the core metric, same as the RV park audit.

## Running an Audit

```bash
# Install dependencies
npm install
npx playwright install chromium

# Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# Run audit on a URL
npx tsx src/index.ts https://riveroakspark.com

# With options
npx tsx src/index.ts https://example.com --output-dir ./results --skip-lighthouse
```

## Validating Against Ground Truth

The `ground-truth/` folder contains the manual RV park audit. Run the validation script to measure how well automated findings match human findings:

```bash
npx tsx test/validate-against-manual.ts output/riveroakspark.com/report.json
```

## 7 Audit Categories

1. **Information Architecture** — navigation, page hierarchy, findability
2. **Visual Hierarchy** — layout, spacing, typography, CTA prominence
3. **Content Strategy** — copy quality, readability, placeholder detection
4. **Conversion Flow** — CTA clarity, booking flow, friction points
5. **Trust Signals** — reviews, social proof, contact info, credibility
6. **Technical/Performance** — Lighthouse scores, Core Web Vitals, image optimization
7. **Accessibility** — WCAG violations, alt text, contrast, keyboard navigation

## What NOT to Build Yet

- No web UI (CLI only for POC)
- No database or persistence
- No multi-page crawling (single page per audit in POC)
- No user accounts or billing
- No queue/job system

## Testing Strategy

- **Unit tests:** Deterministic checks (content analysis, report generation)
- **Integration tests:** Full pipeline against known test URLs
- **Accuracy measurement:** Compare output to `ground-truth/rv-park-audit/manual-audit.md`
- **Target:** 80%+ recall on ground truth findings by end of POC
