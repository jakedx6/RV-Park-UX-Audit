/**
 * Data Collection Pipeline
 *
 * Orchestrates all collectors for a given URL and returns a unified
 * collection result ready for the analysis layer.
 */

import { collectScreenshots, ScreenshotResult, ScreenshotCollectorOptions } from "./screenshot";
import { collectDOM, DOMCollectionResult } from "./dom";
import { collectLighthouse, LighthouseResult } from "./lighthouse";
import { collectAccessibility, AccessibilityResult } from "./accessibility";
import path from "path";

export interface CollectionResult {
  url: string;
  screenshots: ScreenshotResult[];
  dom: DOMCollectionResult;
  lighthouse: LighthouseResult;
  accessibility: AccessibilityResult;
  collectedAt: string;
}

export interface CollectionOptions {
  outputDir: string;
  skipLighthouse?: boolean;
  skipAccessibility?: boolean;
  timeout?: number;
}

export async function collectAll(
  url: string,
  options: CollectionOptions
): Promise<CollectionResult> {
  const { outputDir, skipLighthouse = false, skipAccessibility = false, timeout = 30000 } = options;

  console.log(`[collect] Starting data collection for ${url}`);

  // Run screenshot collection and DOM extraction in parallel
  // (Lighthouse and axe-core require separate browser instances)
  const [screenshots, dom] = await Promise.all([
    collectScreenshots(url, {
      outputDir: path.join(outputDir, "screenshots"),
      timeout,
    }),
    collectDOM(url, { timeout }),
  ]);

  console.log(`[collect] Screenshots: ${screenshots.length} captured`);
  console.log(`[collect] DOM: ${dom.headings.length} headings, ${dom.images.length} images, ${dom.links.length} links`);

  // Run Lighthouse and accessibility sequentially (both launch Chrome)
  let lighthouse: LighthouseResult | undefined;
  if (!skipLighthouse) {
    try {
      lighthouse = await collectLighthouse(url);
      console.log(`[collect] Lighthouse: perf=${lighthouse.scores.performance}, a11y=${lighthouse.scores.accessibility}`);
    } catch (err) {
      console.warn(`[collect] Lighthouse failed: ${err}`);
    }
  }

  let accessibility: AccessibilityResult | undefined;
  if (!skipAccessibility) {
    try {
      accessibility = await collectAccessibility(url, { timeout });
      console.log(`[collect] Accessibility: ${accessibility.violationCount} violations (${accessibility.criticalCount} critical)`);
    } catch (err) {
      console.warn(`[collect] Accessibility scan failed: ${err}`);
    }
  }

  return {
    url,
    screenshots,
    dom,
    lighthouse: lighthouse ?? emptyLighthouse(url),
    accessibility: accessibility ?? emptyAccessibility(url),
    collectedAt: new Date().toISOString(),
  };
}

function emptyLighthouse(url: string): LighthouseResult {
  return {
    url,
    scores: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0 },
    webVitals: { lcp: null, fid: null, cls: null, inp: null, fcp: null, ttfb: null },
    diagnostics: [],
    opportunities: [],
    timestamp: new Date().toISOString(),
  };
}

function emptyAccessibility(url: string): AccessibilityResult {
  return {
    url,
    violations: [],
    passes: 0,
    incomplete: 0,
    inapplicable: 0,
    violationCount: 0,
    criticalCount: 0,
    seriousCount: 0,
    timestamp: new Date().toISOString(),
  };
}

export { collectScreenshots } from "./screenshot";
export { collectDOM } from "./dom";
export { collectLighthouse } from "./lighthouse";
export { collectAccessibility } from "./accessibility";
