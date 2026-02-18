# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive React SPA for reviewing UX audit findings across 5 RV park websites that share a common WordPress template. **The vast majority of issues are template-level** — they appear on all sites. The report is structured template-first: findings default to "Template-wide" scope, with site-specific deviations called out only where they meaningfully differ.

**Target sites:** River Oaks (riveroakspark.com), Trinity Alps (trinityalpsrvpark.com), Bearded Buffalo (beardedbuffaloresort.com), Joy RV (joyrv.org), Strawberry Park (strawberrypark.net). Strawberry Park is the newest site and is generally more polished, but each site has areas where it handles things better than the others.

## Architecture & Technical Decisions

- **Single-file React app** (`.jsx`) with Tailwind CSS — no component library, no heavy frameworks
- **All audit data lives as a JS array** at the top of the main file for easy direct editing
- **Client-side only** — no backend, no database, no API, no auth
- **Priority Score** = `User Impact / Estimated Effort` (higher = better ROI) — this is the core metric
- **Statuses:** Not Started / In Progress / Resolved / Won't Fix
- **7 audit categories:** Information Architecture, Visual Hierarchy, Content Strategy, Conversion Flow, Trust Signals, Technical/Performance, Accessibility
- **Impact and Effort** rated on 1–5 scales

## Data Model: Template-First Scope

- Findings default to **"Template-wide"** scope (affects all 5 sites)
- Site-specific findings are the exception — only tagged when a finding genuinely applies to one or a few sites
- Use **"All except [site]"** when one site handles something better than the others
- Template-wide fixes are inherently higher leverage since fixing the template once improves all properties

## Key Views

1. **Template Health Dashboard** — lead with template-wide metrics (total findings, category breakdown, template health score); per-site cards below for site-specific deviations
2. **Findings List** — sortable/filterable data table (default sort: Priority Score descending); template-wide findings visually prominent
3. **Quick Wins filter** — high impact (4-5) + low effort (1-2)
4. **Template vs. Site-Specific toggle** — filter between template-wide and site-specific findings
5. **Notes Integration** — renders markdown files from `/notes` folder alongside findings

## What NOT to Build

- No editing UI — data is edited directly in source
- No export functionality
- No backend or persistence — data resets on refresh
- Desktop-primary; responsive but not mobile-first

## Project Files

- `PROJECT_CONTEXT.md` — full requirements and design direction
- `Initial-AI-Assesment/ux-audit.md` — comprehensive audit findings to seed the initial data
- `Notes/` — per-site markdown assessment notes (e.g., `riveroakspark-notes.md`); notes reference related screenshots and include specific UX observations with recommendations
- `Images/` — screenshots referenced from notes (e.g., `riveroakspark-header-navigation.png`); notes link to these as `./Images/filename.png`

## Data Seeding

Initial findings data should be extracted from `Initial-AI-Assesment/ux-audit.md`. Each finding becomes a structured object with: scope (defaults to "Template-wide"), category, description, userImpact (1-5), estimatedEffort (1-5), auto-calculated priorityScore, status, and notes. Only set scope to specific site(s) when the issue genuinely doesn't apply to all sites.
