/**
 * Analysis Pipeline
 *
 * Orchestrates all analyzers across collected data and returns
 * a unified set of findings.
 */

import { CollectionResult } from "../collectors";
import { analyzeScreenshots } from "./vision";
import { analyzeContent } from "./content";
import { AuditFinding, AuditCategory } from "../types";

const VISION_CATEGORIES: AuditCategory[] = [
  "Information Architecture",
  "Visual Hierarchy",
  "Conversion Flow",
  "Trust Signals",
];

export interface AnalysisOptions {
  visionModel?: string;
  contentModel?: string;
  skipCategories?: AuditCategory[];
}

export async function analyzeAll(
  collected: CollectionResult,
  options: AnalysisOptions = {}
): Promise<AuditFinding[]> {
  const {
    visionModel = "claude-sonnet-4-5-20250514",
    contentModel = "claude-haiku-4-5-20251001",
    skipCategories = [],
  } = options;

  const allFindings: AuditFinding[] = [];

  // Get screenshot paths for vision analysis
  const screenshotPaths = collected.screenshots.map((s) => s.path);

  // Run vision analysis for each visual category
  for (const category of VISION_CATEGORIES) {
    if (skipCategories.includes(category)) continue;

    console.log(`[analyze] Running vision analysis: ${category}`);
    try {
      const findings = await analyzeScreenshots({
        model: visionModel,
        category,
        screenshotPaths,
        additionalContext: buildContextForCategory(category, collected),
      });
      allFindings.push(...findings);
      console.log(`[analyze] ${category}: ${findings.length} findings`);
    } catch (err) {
      console.error(`[analyze] ${category} failed: ${err}`);
    }
  }

  // Run content analysis
  if (!skipCategories.includes("Content Strategy")) {
    console.log("[analyze] Running content analysis");
    try {
      const contentFindings = await analyzeContent(
        {
          visibleText: collected.dom.visibleText,
          headings: collected.dom.headings,
          metaTitle: collected.dom.meta.title,
          metaDescription: collected.dom.meta.description,
          url: collected.url,
        },
        { model: contentModel }
      );
      allFindings.push(...contentFindings);
      console.log(`[analyze] Content Strategy: ${contentFindings.length} findings`);
    } catch (err) {
      console.error(`[analyze] Content analysis failed: ${err}`);
    }
  }

  // Convert deterministic accessibility data to findings
  if (!skipCategories.includes("Accessibility")) {
    const a11yFindings = convertAccessibilityToFindings(collected);
    allFindings.push(...a11yFindings);
    console.log(`[analyze] Accessibility: ${a11yFindings.length} findings`);
  }

  // Convert Lighthouse data to findings
  if (!skipCategories.includes("Technical/Performance")) {
    const perfFindings = convertLighthouseToFindings(collected);
    allFindings.push(...perfFindings);
    console.log(`[analyze] Technical/Performance: ${perfFindings.length} findings`);
  }

  // Sort by priority score descending
  allFindings.sort((a, b) => b.priorityScore - a.priorityScore);

  return allFindings;
}

function buildContextForCategory(
  category: AuditCategory,
  collected: CollectionResult
): string {
  switch (category) {
    case "Information Architecture":
      return `Navigation items: ${collected.dom.navigation.map((n) => n.text).join(", ")}
Heading structure: ${collected.dom.headings.map((h) => `H${h.level}: ${h.text}`).join(" → ")}
Total links: ${collected.dom.links.length} (${collected.dom.links.filter((l) => l.isExternal).length} external)`;

    case "Conversion Flow":
      return `Forms found: ${collected.dom.forms.length}
CTAs/buttons: ${collected.dom.links.filter((l) => l.text.toLowerCase().includes("book") || l.text.toLowerCase().includes("reserve") || l.text.toLowerCase().includes("contact")).map((l) => `"${l.text}" → ${l.href}`).join(", ")}
External links: ${collected.dom.links.filter((l) => l.isExternal).map((l) => l.href).slice(0, 10).join(", ")}`;

    case "Trust Signals":
      return `Images found: ${collected.dom.images.length}
Has schema.org data: ${collected.dom.meta.schemaOrg.length > 0}
Has Open Graph tags: ${Object.keys(collected.dom.meta.ogTags).length > 0}`;

    default:
      return "";
  }
}

function convertAccessibilityToFindings(
  collected: CollectionResult
): AuditFinding[] {
  return collected.accessibility.violations.map((v) => {
    const impactMap = { minor: 2, moderate: 3, serious: 4, critical: 5 };
    const userImpact = impactMap[v.impact] || 3;

    return {
      id: `a11y-${v.id}-${Date.now()}`,
      category: "Accessibility" as AuditCategory,
      description: v.description,
      evidence: v.nodes
        .slice(0, 3)
        .map((n) => n.html.slice(0, 100))
        .join("; "),
      location: v.nodes[0]?.target?.join(", ") || "Unknown",
      userImpact,
      estimatedEffort: 2,
      priorityScore: userImpact / 2,
      recommendation: v.nodes[0]?.failureSummary || `Fix ${v.id} violation`,
      confidence: 1.0,
      scope: "Template-wide",
      status: "Not Started",
      source: "axe-core",
      helpUrl: v.helpUrl,
    };
  });
}

function convertLighthouseToFindings(
  collected: CollectionResult
): AuditFinding[] {
  const findings: AuditFinding[] = [];

  // Convert opportunities to findings
  for (const opp of collected.lighthouse.opportunities) {
    if (opp.score !== null && opp.score < 0.5) {
      findings.push({
        id: `perf-${opp.id}-${Date.now()}`,
        category: "Technical/Performance" as AuditCategory,
        description: opp.title,
        evidence: opp.displayValue || `Score: ${((opp.score ?? 0) * 100).toFixed(0)}`,
        location: "Page-wide",
        userImpact: opp.score < 0.25 ? 4 : 3,
        estimatedEffort: 2,
        priorityScore: (opp.score < 0.25 ? 4 : 3) / 2,
        recommendation: opp.description.replace(
          /\[.*?\]\(.*?\)/g,
          (match) => match
        ),
        confidence: 1.0,
        scope: "Template-wide",
        status: "Not Started",
        source: "lighthouse",
      });
    }
  }

  return findings;
}

export { analyzeScreenshots } from "./vision";
export { analyzeContent, runDeterministicChecks } from "./content";
