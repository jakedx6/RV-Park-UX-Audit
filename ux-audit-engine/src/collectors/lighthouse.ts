/**
 * Lighthouse Collector
 *
 * Runs Google Lighthouse audits and returns structured performance,
 * accessibility, SEO, and best-practices scores + diagnostics.
 */

// Note: lighthouse must be imported dynamically as it's an ESM module
// import lighthouse from "lighthouse";
// import * as chromeLauncher from "chrome-launcher";

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface CoreWebVitals {
  lcp: number | null; // Largest Contentful Paint (ms)
  fid: number | null; // First Input Delay (ms)
  cls: number | null; // Cumulative Layout Shift
  inp: number | null; // Interaction to Next Paint (ms)
  fcp: number | null; // First Contentful Paint (ms)
  ttfb: number | null; // Time to First Byte (ms)
}

export interface LighthouseAuditItem {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
}

export interface LighthouseResult {
  url: string;
  scores: LighthouseScores;
  webVitals: CoreWebVitals;
  diagnostics: LighthouseAuditItem[];
  opportunities: LighthouseAuditItem[];
  timestamp: string;
}

export async function collectLighthouse(
  url: string,
  options: { categories?: string[] } = {}
): Promise<LighthouseResult> {
  // Dynamic imports for ESM modules
  const chromeLauncher = await import("chrome-launcher");
  const lighthouse = (await import("lighthouse")).default;

  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  try {
    const result = await lighthouse(url, {
      logLevel: "error",
      output: "json",
      port: chrome.port,
      onlyCategories: options.categories || [
        "performance",
        "accessibility",
        "best-practices",
        "seo",
      ],
    });

    if (!result?.lhr) {
      throw new Error("Lighthouse returned no results");
    }

    const { lhr } = result;

    const scores: LighthouseScores = {
      performance: (lhr.categories.performance?.score ?? 0) * 100,
      accessibility: (lhr.categories.accessibility?.score ?? 0) * 100,
      bestPractices: (lhr.categories["best-practices"]?.score ?? 0) * 100,
      seo: (lhr.categories.seo?.score ?? 0) * 100,
    };

    const webVitals: CoreWebVitals = {
      lcp: extractMetric(lhr.audits, "largest-contentful-paint"),
      fid: extractMetric(lhr.audits, "max-potential-fid"),
      cls: extractMetric(lhr.audits, "cumulative-layout-shift"),
      inp: extractMetric(lhr.audits, "interaction-to-next-paint"),
      fcp: extractMetric(lhr.audits, "first-contentful-paint"),
      ttfb: extractMetric(lhr.audits, "server-response-time"),
    };

    // Failed audits as diagnostics
    const diagnostics = Object.values(lhr.audits)
      .filter(
        (audit: any) =>
          audit.score !== null && audit.score < 1 && audit.score >= 0
      )
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
      }));

    // Opportunities (suggestions with savings estimates)
    const opportunities = Object.values(lhr.audits)
      .filter(
        (audit: any) => audit.details?.type === "opportunity" && audit.score < 1
      )
      .map((audit: any) => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
      }));

    return {
      url,
      scores,
      webVitals,
      diagnostics,
      opportunities,
      timestamp: new Date().toISOString(),
    };
  } finally {
    await chrome.kill();
  }
}

function extractMetric(audits: any, key: string): number | null {
  const audit = audits[key];
  if (!audit) return null;
  return audit.numericValue ?? null;
}
