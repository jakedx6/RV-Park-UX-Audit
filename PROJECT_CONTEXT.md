# RV Park UX Audit — Project Context

## Goal

Build a React-based single-page application that serves as an interactive UX audit review tool for 5 RV park websites. The site should make it easy to review findings, prioritize fixes, and identify quick high-impact wins across all properties.

## Background

I'm conducting UX audits on a set of RV park/campground websites that share a common template/platform. Some issues are site-specific, others are systemic across the template. The sites are:

1. **River Oaks RV Park** — riveroakspark.com (Hartford, IA)
2. **Trinity Alps RV Park** — trinityalpsrvpark.com (Weaverville, CA)
3. **Bearded Buffalo Resort** — beardedbuffaloresort.com (Custer, SD)
4. **Joy RV Resort** — joyrv.org (Copperas Cove, TX)
5. **Strawberry Park Resort Campground** — strawberrypark.net (Preston, CT)

These sites share a WordPress template, and after reviewing them **the vast majority of UX issues are template-level** — they appear identically (or nearly so) on all 5 sites. Site-specific issues exist but are the exception, not the rule. This means the report should be structured **template-first**: findings default to "Template-wide" scope, with site-specific deviations called out only where they meaningfully differ.

Strawberry Park is the most polished and serves as a benchmark for what the others should aspire to. The audit covers information architecture, content strategy, visual hierarchy, conversion flow, and trust signals.

## Project Structure

```
/
├── notes/                    # My ongoing audit notes (markdown files I write as I review)
│   └── ...                   # I'll add files here as I go
├── ux-audit.md               # Initial comprehensive audit findings (already provided)
├── src/                      # React app source
└── ...
```

### The `/notes` folder

I will be writing assessment notes in `/notes` as markdown files as I work through the audit. The app should be able to ingest and display these notes alongside the structured findings. Notes may be per-site, per-category, or general observations. The app should handle whatever note files it finds in that folder gracefully.

## App Requirements

### Core Features

**1. Template Health Dashboard**
- Lead with template-wide metrics: total findings, category breakdown, overall "template health" score
- Show per-site cards below for the minority of site-specific findings and to highlight which sites deviate from the template baseline (better or worse)
- Quick way to answer: "How healthy is the shared template?" and "Which sites have unique problems?"

**2. Findings List with Scoring**

Each finding/issue should have:

- **Scope:** Defaults to "Template-wide" (all sites). Only specify individual sites when a finding is genuinely site-specific. Use "All except [site]" when one site handles something better than the rest (e.g., Strawberry Park).
- **Category:** One of the audit dimensions:
  - Information Architecture
  - Visual Hierarchy
  - Content Strategy
  - Conversion Flow
  - Trust Signals
  - Technical/Performance
  - Accessibility
- **Description:** What the issue is
- **User Impact Rating:** How much this affects the end user's experience (1–5 scale)
  - 1 = Minor/cosmetic annoyance
  - 2 = Noticeable friction, user can work around it
  - 3 = Meaningful negative impact on user experience
  - 4 = Significant barrier to understanding or completing tasks
  - 5 = Critical — breaks trust, blocks conversion, or makes site unusable
- **Estimated Effort:** How hard it is to fix (1–5 scale)
  - 1 = Quick fix (< 1 hour, copy change or config tweak)
  - 2 = Small task (a few hours, single component or page edit)
  - 3 = Moderate effort (half day to full day, may require design decisions)
  - 4 = Significant work (multi-day, involves template/structural changes)
  - 5 = Major project (requires redesign, new features, or platform changes)
- **Priority Score:** Calculated automatically — `User Impact / Estimated Effort`. Higher = better ROI. This is the primary sort for finding quick wins.
- **Status:** Not Started / In Progress / Resolved / Won't Fix
- **Notes:** Any additional context or my assessment notes

**3. Sorting & Filtering**
- Sort by: Priority Score (default, descending), User Impact, Effort, Category, Scope
- Filter by: Scope (Template-wide / Site-specific), Category, Status, Impact level, Effort level
- A "Quick Wins" view that pre-filters to high impact (4-5) + low effort (1-2)
- Template-wide findings should be visually prominent since they represent the highest-leverage fixes

**4. Template vs. Site-Specific View**
- Since most findings are template-wide, the default view should present them as such — no need to redundantly list all 5 sites on every row
- Provide a toggle or filter to surface the minority of site-specific findings
- For template-wide findings, optionally note which site handles it best (usually Strawberry Park) as a "reference implementation"
- Template-level fixes are the highest leverage — fixing the template once improves all properties

**5. Notes Integration**
- Display my markdown notes from `/notes` alongside or within the relevant context
- Notes should render as formatted markdown

### Design Direction

- Clean, professional, minimal — this is an internal working tool, not a marketing site
- Light theme, good contrast, readable typography
- Use a data-table/list approach for findings — think spreadsheet-meets-dashboard
- Cards for site overviews
- Responsive but desktop-primary (this is a working tool I'll use at my desk)
- No heavy frameworks needed — Tailwind utility classes are fine, keep it in a single .jsx file

### Technical Notes

- Single-file React app (.jsx) using Tailwind for styling
- All data should be structured in a JS object/array at the top of the file so I can easily edit findings
- Seed the initial data from the findings in `ux-audit.md` — translate the audit findings into the structured format described above
- The scoring system and priority calculation should be baked in
- Interactive sorting and filtering via React state — no backend needed
- The app should feel immediately useful as a working tool on first load

### What NOT to Build

- No backend, database, or API
- No authentication
- No editing UI for now — I'll edit the data directly in the source
- No export functionality (can add later if needed)
- Don't overcomplicate — this is a working tool, not a product

## Audit Categories Explained

For context on what each category covers:

- **Information Architecture:** Navigation structure, page hierarchy, findability, menu organization, URL structure
- **Visual Hierarchy:** Layout, spacing, typography, emphasis patterns, logo placement, hero effectiveness
- **Content Strategy:** Copy quality, tone, SEO vs human readability, placeholder content, messaging clarity
- **Conversion Flow:** CTA placement, booking flow, call-to-action clarity, friction in the path to booking
- **Trust Signals:** Reviews/testimonials, social proof, credentials, contact info visibility, professionalism
- **Technical/Performance:** Image loading, lazy-load issues, broken elements, code quality, page speed
- **Accessibility:** Alt text, keyboard navigation, screen reader compatibility, contrast, ARIA labels

## Key Insights to Keep in Mind

1. **Template-first framing:** Since ~90% of issues are template-wide, the report should not redundantly tag every finding with all 5 sites. Default to "Template-wide" and only call out site-specific scope when it genuinely differs. This keeps the data clean and the report focused.

2. **Priority Score is king:** The most valuable output is the **Priority Score** — it surfaces findings where a small effort yields a big UX improvement. Always make it easy to answer: "What should we fix first?"

3. **Template fixes = max leverage:** A single template fix improves all 5 properties at once. The report should make this leverage obvious — template-wide findings at a given priority score are inherently more valuable than site-specific ones at the same score.
