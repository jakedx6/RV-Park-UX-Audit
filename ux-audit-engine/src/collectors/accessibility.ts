/**
 * Accessibility Collector
 *
 * Runs axe-core accessibility scans via Playwright and returns
 * structured WCAG violation data.
 */

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

export interface AccessibilityViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  description: string;
  helpUrl: string;
  wcagTags: string[];
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

export interface AccessibilityResult {
  url: string;
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  violationCount: number;
  criticalCount: number;
  seriousCount: number;
  timestamp: string;
}

export async function collectAccessibility(
  url: string,
  options: { timeout?: number; tags?: string[] } = {}
): Promise<AccessibilityResult> {
  const { timeout = 30000, tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } = options;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout });

    const axeResults = await new AxeBuilder({ page })
      .withTags(tags)
      .analyze();

    const violations: AccessibilityViolation[] = axeResults.violations.map(
      (v) => ({
        id: v.id,
        impact: v.impact as AccessibilityViolation["impact"],
        description: v.description,
        helpUrl: v.helpUrl,
        wcagTags: v.tags.filter(
          (t) => t.startsWith("wcag") || t.startsWith("best-practice")
        ),
        nodes: v.nodes.map((n) => ({
          html: n.html,
          target: n.target as string[],
          failureSummary: n.failureSummary || "",
        })),
      })
    );

    return {
      url,
      violations,
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
      inapplicable: axeResults.inapplicable.length,
      violationCount: violations.length,
      criticalCount: violations.filter((v) => v.impact === "critical").length,
      seriousCount: violations.filter((v) => v.impact === "serious").length,
      timestamp: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}
