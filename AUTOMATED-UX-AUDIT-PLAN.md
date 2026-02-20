# Automated UX Audit Platform — Business & Implementation Plan

## Executive Summary

An AI-powered platform that takes a **URL or set of screenshots** as input and produces a **structured UX audit report** — covering information architecture, visual hierarchy, content strategy, conversion flow, trust signals, technical performance, and accessibility. The system combines programmatic data collection (screenshots, DOM analysis, Lighthouse metrics) with LLM vision analysis to produce audits that previously required expensive human consultants.

**Core insight from our RV park audit work:** Most websites within a vertical share common templates and patterns. A tool trained to recognize these patterns can audit at scale — identifying both universal template-level issues and site-specific deviations — at a fraction of the cost of manual audits.

---

## 1. Market Analysis

### The Problem

- **Manual UX audits cost $5,000–$50,000+** and take 2–6 weeks
- Small and mid-market businesses (SMBs) can't afford them
- Agencies doing audits for clients spend 60–80% of time on repetitive pattern recognition
- Website template marketplaces (WordPress, Squarespace, Wix) mean millions of sites share identical UX problems

### Market Size

- **UX design services market:** ~$5B globally, growing 15% YoY
- **Website accessibility compliance market:** ~$1B, accelerating due to European Accessibility Act (2025) and ADA enforcement
- **SMB website count:** 200M+ active websites globally; ~70% use templates/builders
- **Target addressable market (TAM):** SMBs, agencies, and template developers — conservatively $500M for automated UX tooling

### Competitive Landscape

| Competitor | Approach | Pricing | Limitations |
|---|---|---|---|
| **[Baymard UX-Ray](https://baymard.com/product/ux-ray)** | 700+ guidelines, AI maps UI to research DB | $9,500+/yr | E-commerce only; rule-based, not generative |
| **[Hotjar](https://www.hotjar.com)** / **[Microsoft Clarity](https://clarity.microsoft.com)** | Session replay, heatmaps, rage clicks | Free–$200/mo | Requires traffic data; can't audit pre-launch or competitor sites |
| **[LogRocket Galileo](https://logrocket.com)** | AI summarization of session data | $99+/mo | Needs instrumented site; reactive, not proactive |
| **[WAVE](https://wave.webaim.org)** / axe DevTools | Accessibility-only automated checks | Free–$500/mo | Accessibility only; no UX/design/content analysis |
| **Google Lighthouse** | Performance + accessibility scores | Free | Narrow scope; no visual/content/UX analysis |
| **[O8 AI UX Audit](https://www.o8.agency/free-ai-powered-website-ux-audit)** | AI-powered messaging/UX gap analysis | Custom pricing | Lead-gen tool, not a product; limited depth |
| **Generic AI (ChatGPT/Claude + screenshot)** | Ad-hoc vision prompting | Pay-per-use | No structure; 50–75% accuracy per [Baymard research](https://baymard.com/blog/ai-heuristic-evaluations); no reproducibility |

### Our Differentiation

1. **Full-spectrum UX audit** (7 categories) — not just accessibility or performance
2. **URL-in, report-out** — no instrumentation, traffic data, or setup required
3. **Works on any site** — competitor sites, pre-launch, templates, redesigns
4. **Template-aware** — can audit a template once and apply findings across all sites using it
5. **Structured, actionable output** — priority-scored findings with effort estimates, not vague suggestions
6. **Vertical specialization** — trained evaluation criteria per industry (hospitality, e-commerce, SaaS, etc.)

---

## 2. Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INPUT                              │
│         URL  ───or───  Uploaded Screenshots                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA COLLECTION LAYER                       │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Playwright   │  │  Lighthouse   │  │  DOM Extractor   │  │
│  │  Screenshots  │  │  Metrics      │  │  HTML/CSS/ARIA   │  │
│  │  (viewport +  │  │  (perf, a11y, │  │  (structure,     │  │
│  │   full-page)  │  │   SEO, PWA)   │  │   nav, forms)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  axe-core     │  │  Link/Asset   │  │  Responsive      │  │
│  │  Accessibility│  │  Crawler      │  │  Breakpoint       │  │
│  │  Scan         │  │  (sitemap,    │  │  Captures         │  │
│  │               │  │   broken)     │  │  (mobile/tablet)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  ANALYSIS LAYER                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LLM VISION ANALYSIS (Claude Sonnet/Opus)            │   │
│  │  • Screenshot → Visual hierarchy assessment          │   │
│  │  • Screenshot → Layout & spacing evaluation          │   │
│  │  • Screenshot → Trust signal identification          │   │
│  │  • Screenshot → CTA clarity & conversion flow        │   │
│  │  • Screenshot → Brand consistency                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LLM TEXT ANALYSIS (Claude Haiku/Sonnet)             │   │
│  │  • Copy quality & readability scoring                │   │
│  │  • SEO vs. human-readability balance                 │   │
│  │  • Content strategy assessment                       │   │
│  │  • Placeholder/lorem ipsum detection                 │   │
│  │  • Tone & messaging consistency                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  STRUCTURED DATA ANALYSIS (deterministic)            │   │
│  │  • Lighthouse scores (perf, a11y, SEO, best prax)    │   │
│  │  • axe-core WCAG violations                          │   │
│  │  • Page weight, LCP, CLS, FID metrics                │   │
│  │  • Broken links, missing assets                      │   │
│  │  • Meta tags, schema.org, Open Graph                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  HEURISTIC EVALUATION ENGINE                         │   │
│  │  • Nielsen's 10 usability heuristics                 │   │
│  │  • Industry-specific UX guidelines DB                │   │
│  │  • Pattern matching against known anti-patterns      │   │
│  │  • Template detection & cross-site correlation       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  OUTPUT LAYER                                │
│                                                             │
│  Structured finding objects:                                │
│  {                                                          │
│    category, description, userImpact (1-5),                 │
│    estimatedEffort (1-5), priorityScore (auto),             │
│    evidence: { screenshot, metric, code_snippet },          │
│    recommendation, scope                                    │
│  }                                                          │
│                                                             │
│  Delivery formats:                                          │
│  • Interactive web report (React SPA)                       │
│  • PDF export                                               │
│  • JSON/API for integrations                                │
│  • Slack/email summary                                      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Browser automation** | [Playwright](https://playwright.dev/docs/screenshots) (Node.js) | Cross-browser, full-page screenshots, DOM access, network interception |
| **Performance metrics** | Google Lighthouse (Node API) | Industry standard; perf, a11y, SEO, best practices |
| **Accessibility scanning** | [axe-core](https://github.com/dequelabs/axe-core) | Most comprehensive WCAG checker; used by 25%+ of the internet |
| **Vision analysis** | [Claude API (Vision)](https://platform.claude.com/docs/en/build-with-claude/vision) | Best-in-class vision understanding; structured output; cost-effective |
| **Text analysis** | Claude API (Haiku for bulk, Sonnet for depth) | Fast, cheap for content analysis; excellent structured output |
| **Backend** | Node.js / TypeScript | Playwright ecosystem; async-native |
| **Queue / orchestration** | BullMQ + Redis | Job scheduling, retries, rate limiting |
| **Database** | PostgreSQL + pgvector | Structured findings + embedding similarity for pattern matching |
| **Frontend** | React + Tailwind | Matches existing audit viewer; fast development |
| **Infrastructure** | AWS/GCP (containers) | Playwright needs headful browser; GPU not required |

### Data Collection Pipeline (per URL)

```
1. NAVIGATE & WAIT
   └─ Playwright opens URL in Chromium
   └─ Wait for network idle + DOM stable
   └─ Handle cookie banners, popups (auto-dismiss)

2. CAPTURE
   ├─ Viewport screenshot (1440×900 desktop)
   ├─ Full-page screenshot (scrolled)
   ├─ Mobile viewport (375×812)
   ├─ Tablet viewport (768×1024)
   ├─ DOM snapshot (cleaned HTML)
   ├─ Computed styles for key elements
   ├─ Navigation structure (links, menus)
   └─ All visible text content

3. MEASURE
   ├─ Lighthouse audit (performance, a11y, SEO, PWA)
   ├─ axe-core accessibility scan
   ├─ Page weight breakdown (images, JS, CSS, fonts)
   ├─ Core Web Vitals (LCP, CLS, FID/INP)
   └─ Resource loading waterfall

4. CRAWL (optional — multi-page audit)
   ├─ Follow internal links (depth 1-2)
   ├─ Identify key page types (home, about, pricing, contact)
   └─ Repeat steps 1-3 for each page
```

### LLM Analysis Pipeline

The key insight from [Baymard's research](https://baymard.com/blog/ai-heuristic-evaluations) is that **open-ended LLM analysis achieves only 50–75% accuracy**, but **structured, criteria-driven analysis reaches 95%**. Our approach uses structured evaluation criteria, not open-ended prompts.

```
FOR EACH evaluation category:
  1. Select relevant screenshots + data
  2. Build structured prompt with:
     ├─ Specific evaluation criteria (checklist)
     ├─ Scoring rubric (1-5 scale with examples)
     ├─ Industry-specific benchmarks
     └─ Known anti-patterns to check for
  3. Send to Claude with vision + text
  4. Parse structured JSON response
  5. Cross-validate with deterministic data
     (e.g., if LLM says "good contrast" but axe-core
      found contrast violations → flag discrepancy)
  6. Assign confidence score per finding
```

#### Example Prompt Structure (Visual Hierarchy)

```
Evaluate this website screenshot for visual hierarchy issues.

CHECKLIST (evaluate each):
- [ ] Primary CTA is visually prominent and above the fold
- [ ] Logo is positioned conventionally (top-left)
- [ ] Navigation is clear and follows standard patterns
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] White space usage creates clear content sections
- [ ] Images have proper sizing and don't dominate text
- [ ] Font sizes create clear information hierarchy
- [ ] Color is used purposefully to guide attention

For each issue found, provide:
{
  "criterion": "which checklist item",
  "issue": "specific description",
  "severity": 1-5,
  "location": "where on page",
  "recommendation": "specific fix",
  "effort": 1-5
}

Return ONLY issues found. Do not fabricate issues.
If the site handles a criterion well, omit it.
```

### Cost Per Audit (Estimated)

| Component | Cost | Notes |
|---|---|---|
| Playwright screenshots (6 captures) | ~$0.001 | Compute only |
| Lighthouse audit | ~$0.001 | Compute only |
| axe-core scan | ~$0.001 | Compute only |
| Claude vision analysis (6 images × 7 categories) | ~$0.20 | Using Sonnet; ~42 API calls with images |
| Claude text analysis (content, copy) | ~$0.05 | Haiku for bulk text |
| Infrastructure overhead | ~$0.02 | Queue, storage, DB |
| **Total per single-page audit** | **~$0.28** | |
| **Multi-page audit (5 pages)** | **~$1.20** | |

At these unit economics, even a $29/month plan with 10 audits/month has ~97% gross margin.

---

## 3. The 7 Audit Categories (Automated)

Each category maps to a combination of automated tools and LLM analysis:

| Category | Automated Data Sources | LLM Analysis |
|---|---|---|
| **Information Architecture** | DOM nav structure, sitemap, link hierarchy, URL patterns | Screenshot: navigation clarity, menu organization, page flow |
| **Visual Hierarchy** | DOM heading levels, font sizes, z-index, above-fold content | Screenshot: layout assessment, spacing, emphasis patterns, CTA prominence |
| **Content Strategy** | Text extraction, readability scores (Flesch-Kincaid), keyword density | Text: copy quality, tone, SEO vs. readability balance, placeholder detection |
| **Conversion Flow** | CTA elements, form fields, booking/checkout links, external redirects | Screenshot: CTA visibility, friction points, booking flow clarity |
| **Trust Signals** | Review widgets, testimonials, certifications, contact info, social links | Screenshot: social proof placement, review authenticity, professional appearance |
| **Technical/Performance** | Lighthouse scores, Core Web Vitals, broken links, image optimization | Structured metrics: quantitative scoring, specific recommendations |
| **Accessibility** | axe-core violations, ARIA audit, contrast ratios, alt text coverage | Screenshot: visual accessibility (spacing, readability, target sizes) |

---

## 4. Product Tiers & Business Model

### Pricing Strategy

| Tier | Price | Includes | Target Customer |
|---|---|---|---|
| **Free** | $0 | 1 audit/month, single page, basic report | Freelancers, students, tire-kickers |
| **Starter** | $29/mo | 10 audits/month, up to 5 pages each, full 7-category report | Small business owners |
| **Pro** | $99/mo | 50 audits/month, up to 20 pages, competitor comparison, trend tracking | Agencies, freelance UX designers |
| **Agency** | $299/mo | 200 audits/month, white-label reports, API access, template grouping | Digital agencies, web dev shops |
| **Enterprise** | Custom | Unlimited, custom criteria, integrations, dedicated support | Large orgs, template vendors |

### Revenue Model

- **SaaS subscriptions** (primary — 70% of revenue)
- **API usage fees** for integrations (15%)
- **One-time audit purchases** for non-subscribers ($19–$49 per audit) (10%)
- **Custom vertical training** for enterprise (5%)

### Unit Economics Target

| Metric | Target |
|---|---|
| **COGS per audit** | $0.28–$1.20 |
| **Average selling price per audit** | $2.90–$10.00 |
| **Gross margin** | 85–95% |
| **Target MRR at 12 months** | $50K |
| **Target MRR at 24 months** | $250K |

---

## 5. Implementation Roadmap

### Phase 1: MVP (Months 1–3) — "Single Page Audit"

**Goal:** URL in → structured UX report out for a single page.

| Week | Deliverable |
|---|---|
| 1–2 | Playwright pipeline: navigate, screenshot (desktop + mobile), DOM extract |
| 3–4 | Lighthouse + axe-core integration; structured metrics collection |
| 5–6 | LLM analysis prompts for all 7 categories; structured JSON output |
| 7–8 | Output rendering: interactive React report (based on existing audit viewer) |
| 9–10 | Evaluation & calibration: run against 50+ known sites, compare to manual audits |
| 11–12 | Web app shell: URL input, job queue, report delivery |

**MVP Features:**
- Single URL input
- Desktop + mobile screenshots
- All 7 audit categories
- Priority-scored findings with recommendations
- Interactive web report
- Comparison to manual audit for accuracy measurement

**Key Risk Mitigation:**
- Build accuracy measurement from day 1 (ground truth from manual audits)
- Start with the categories where automation is strongest (Technical/Performance, Accessibility) and iterate on subjective categories (Visual Hierarchy, Content Strategy)

### Phase 2: Multi-Page & Comparison (Months 4–6)

| Feature | Description |
|---|---|
| **Multi-page crawl** | Audit up to 20 pages per site; auto-detect key page types |
| **Competitor comparison** | Side-by-side audit of 2+ sites |
| **Template detection** | Identify shared templates across sites; group findings |
| **Trend tracking** | Re-audit same URL over time; show improvement/regression |
| **PDF export** | Downloadable reports for client delivery |

### Phase 3: Vertical Specialization (Months 7–9)

| Feature | Description |
|---|---|
| **Industry-specific criteria** | Hospitality, e-commerce, SaaS, healthcare, real estate |
| **Benchmark database** | Compare against industry averages |
| **Custom evaluation criteria** | Users define their own checklist items |
| **API access** | RESTful API for CI/CD and tool integrations |

### Phase 4: Platform & Scale (Months 10–12)

| Feature | Description |
|---|---|
| **White-label reports** | Agency branding on outputs |
| **Team workspaces** | Shared audits, assignments, status tracking |
| **Integrations** | Jira, Linear, Notion, Slack, Figma |
| **Scheduled monitoring** | Weekly/monthly automated re-audits |
| **Template marketplace audits** | Partner with ThemeForest, WordPress.org to audit templates pre-publication |

---

## 6. Accuracy Strategy

The [Baymard Institute's research](https://baymard.com/blog/ai-heuristic-evaluations) shows that naive LLM prompting achieves only **50–75% accuracy** for UX evaluation. Our strategy to reach **90%+ accuracy**:

### 6.1 Hybrid Approach

| Finding Type | Method | Expected Accuracy |
|---|---|---|
| **Accessibility violations** | axe-core (deterministic) | 99% for detectable issues |
| **Performance metrics** | Lighthouse (deterministic) | 99% |
| **Broken links/assets** | Crawler (deterministic) | 99% |
| **Content issues** (placeholder text, readability) | LLM text analysis with rules | 95% |
| **Visual hierarchy** | LLM vision + structured criteria | 85–90% |
| **Trust signals** | LLM vision + DOM detection | 85–90% |
| **Conversion flow** | LLM vision + link analysis | 80–85% |

### 6.2 Accuracy Improvement Levers

1. **Structured criteria, not open-ended analysis** — each evaluation uses a specific checklist, not "tell me what's wrong"
2. **Cross-validation** — LLM findings validated against deterministic data where possible
3. **Confidence scoring** — each finding includes a confidence score; low-confidence findings flagged for human review
4. **Feedback loop** — users can mark findings as accurate/inaccurate; this data trains better prompts
5. **Anti-hallucination** — require LLM to cite specific visual evidence (location on page, element description)
6. **Industry-specific training** — vertical-specific criteria reduce false positives

### 6.3 What We Don't Automate (Initially)

Some UX aspects require human judgment and should be positioned as upsell services:

- Information architecture for complex multi-level sites
- Brand strategy alignment
- User journey mapping across multiple sessions
- Emotional design evaluation
- Cultural appropriateness assessment

---

## 7. Go-to-Market Strategy

### Phase 1: Developer & Agency Community (Months 1–6)

- **Free tier** as lead generation
- Launch on Product Hunt, Hacker News, IndieHackers
- Open-source the data collection pipeline (Playwright + Lighthouse + axe-core wrapper)
- Content marketing: "We audited the top 100 WordPress themes" — viral benchmark content
- Partner with web development bootcamps and courses

### Phase 2: SMB Direct (Months 6–12)

- Google Ads targeting "website UX audit," "improve my website," "website review"
- Partnerships with website builders (Squarespace, Wix app marketplace)
- WordPress plugin that triggers an audit on publish
- Referral program: share audit results → free audits

### Phase 3: Agency & Enterprise (Months 12–18)

- White-label capability for agencies
- Salesforce/HubSpot integration for agencies managing client websites
- SOC 2 compliance for enterprise sales
- Template marketplace partnerships (ThemeForest, WordPress.org)

### Content Flywheel

```
Run free audits on popular sites/templates
        ↓
Publish benchmark reports (viral content)
        ↓
Attract organic traffic + backlinks
        ↓
Free users convert to paid
        ↓
Paid users generate more audit data
        ↓
More data improves accuracy
        ↓
Better accuracy → better content → repeat
```

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| **Low accuracy / false positives** | High | Structured criteria + cross-validation + confidence scores + human review tier |
| **LLM API costs spike** | Medium | Use Haiku for bulk work; cache common patterns; batch API for 50% discount |
| **Baymard or Google builds this** | Medium | Move fast; vertical specialization; open-source community; template-aware differentiation |
| **Sites block automated access** | Medium | Respect robots.txt; use residential proxies only for paid plans; allow screenshot upload as fallback |
| **Users don't trust AI audits** | Medium | Publish accuracy benchmarks; offer human review add-on; show evidence for every finding |
| **Scaling browser automation** | Low | Containerized Playwright; serverless browser services (Browserless, Browserbase) |

---

## 9. Team Requirements

### MVP Team (Phase 1)

| Role | Count | Focus |
|---|---|---|
| Full-stack engineer | 1–2 | Playwright pipeline, API, frontend |
| UX researcher / prompt engineer | 1 | Evaluation criteria, prompt design, accuracy calibration |
| **Total** | **2–3** | |

### Growth Team (Phase 2–4)

| Role | Count | Focus |
|---|---|---|
| Backend engineer | 1 | Scale, queue, infrastructure |
| Frontend engineer | 1 | Report UI, dashboard |
| ML/prompt engineer | 1 | Accuracy improvement, vertical training |
| Growth/marketing | 1 | Content, partnerships, PLG |
| **Total** | **6–7** | |

---

## 10. Success Metrics

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Audits completed | 500 | 5,000 | 50,000 |
| Accuracy rate (vs. human audit) | 80% | 87% | 92% |
| Paying customers | 20 | 150 | 800 |
| MRR | $2K | $15K | $60K |
| NPS | 30 | 40 | 50 |

---

## 11. Why Now

1. **LLM vision capabilities have matured** — Claude and GPT-4V can now reliably analyze screenshots for design patterns, not just OCR text
2. **Cost has dropped dramatically** — analyzing a screenshot costs <$0.01; a full audit costs <$1.50 in API fees
3. **Accessibility regulation is accelerating** — European Accessibility Act enforcement creates urgent demand
4. **Template proliferation** — 70%+ of websites use templates, making pattern-based auditing highly scalable
5. **The manual audit market is proven** — agencies charge $5K–$50K; the demand exists, the price is the barrier

---

## 12. Immediate Next Steps

1. **Build a proof-of-concept** using the existing RV park sites as test cases
   - Playwright screenshot pipeline for the 5 known sites
   - Claude API vision analysis with structured prompts per category
   - Compare automated findings to the manual audit in `ux-audit.md`
   - Measure accuracy: what % of manual findings does automation catch?

2. **Design the evaluation criteria database**
   - Codify the 7 categories into structured checklists
   - Define scoring rubrics with concrete examples
   - Build industry-specific criteria starting with hospitality

3. **Prototype the output format**
   - Adapt the existing React audit viewer to accept API-generated findings
   - Add evidence screenshots inline with findings
   - Build comparison view (automated vs. manual)

---

*This plan was generated based on market research conducted February 2026 and the practical experience of auditing 5 RV park websites sharing a common WordPress template.*
