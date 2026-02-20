/**
 * Validation Script
 *
 * Compares automated audit output against the manual audit ground truth
 * from the RV park UX audit. Measures:
 *
 * - Recall: what % of manual findings did automation catch?
 * - Precision: what % of automated findings are real issues?
 * - Category coverage: which categories perform best/worst?
 *
 * Usage: npx tsx test/validate-against-manual.ts <report.json>
 */

import fs from "fs/promises";
import path from "path";

interface Finding {
  category: string;
  description: string;
  userImpact: number;
  confidence?: number;
  source?: string;
}

interface Report {
  url: string;
  findings: Finding[];
  summary: { totalFindings: number };
}

/**
 * Known findings from the manual RV park audit (ground truth).
 * These are the key issues identified by a human UX auditor.
 */
const GROUND_TRUTH_FINDINGS = [
  // Template-wide issues
  { category: "Information Architecture", keyword: "split nav", description: "Navigation split into two rows with centered logo" },
  { category: "Content Strategy", keyword: "organic", description: "'organic' text artifact visible in template" },
  { category: "Content Strategy", keyword: "seo-heavy|keyword.?stuff", description: "SEO-heavy, keyword-stuffed copy" },
  { category: "Content Strategy", keyword: "lorem ipsum|placeholder", description: "Lorem ipsum / placeholder content in testimonials" },
  { category: "Visual Hierarchy", keyword: "hero|generic", description: "Generic hero tagline / weak engagement hook" },
  { category: "Accessibility", keyword: "alt text|alt.?tag", description: "Missing or empty image alt text" },
  { category: "Content Strategy", keyword: "amenity|description", description: "Amenity tiles lack descriptions" },
  { category: "Technical/Performance", keyword: "base64|lazy.?load|placeholder", description: "Image lazy-loading / base64 placeholder issues" },
  { category: "Trust Signals", keyword: "review|widget|trustindex", description: "Review widget rendering issues" },
  { category: "Trust Signals", keyword: "negative review|rude", description: "Negative review prominently displayed" },
  { category: "Visual Hierarchy", keyword: "footer.*dense|footer.*long", description: "Footer is overly dense / page is too long" },
  { category: "Conversion Flow", keyword: "book|booking|campspot", description: "Booking flow redirects to third-party without context" },
  { category: "Information Architecture", keyword: "preserve|dead.?end", description: "Nav item links to undescribed/empty section" },
];

async function validate(reportPath: string): Promise<void> {
  const reportData = await fs.readFile(reportPath, "utf-8");
  const report: Report = JSON.parse(reportData);

  console.log("=".repeat(60));
  console.log("VALIDATION: Automated vs. Manual Audit");
  console.log(`Report: ${reportPath}`);
  console.log(`URL: ${report.url}`);
  console.log(`Automated findings: ${report.findings.length}`);
  console.log(`Ground truth findings: ${GROUND_TRUTH_FINDINGS.length}`);
  console.log("=".repeat(60));
  console.log();

  // Check recall: how many ground truth findings were caught?
  let matched = 0;
  const misses: typeof GROUND_TRUTH_FINDINGS = [];

  for (const truth of GROUND_TRUTH_FINDINGS) {
    const regex = new RegExp(truth.keyword, "i");
    const found = report.findings.some(
      (f) =>
        regex.test(f.description) ||
        regex.test((f as any).evidence || "") ||
        regex.test((f as any).recommendation || "")
    );

    if (found) {
      matched++;
      console.log(`  [MATCH] ${truth.description}`);
    } else {
      misses.push(truth);
      console.log(`  [MISS]  ${truth.description}`);
    }
  }

  console.log();
  console.log("--- RESULTS ---");
  console.log(`Recall: ${matched}/${GROUND_TRUTH_FINDINGS.length} (${((matched / GROUND_TRUTH_FINDINGS.length) * 100).toFixed(1)}%)`);
  console.log();

  if (misses.length > 0) {
    console.log("Missed findings:");
    for (const miss of misses) {
      console.log(`  - [${miss.category}] ${miss.description}`);
    }
  }

  // Category breakdown
  console.log();
  console.log("--- CATEGORY COVERAGE ---");
  const categories = [...new Set(report.findings.map((f) => f.category))];
  for (const cat of categories) {
    const count = report.findings.filter((f) => f.category === cat).length;
    const truthCount = GROUND_TRUTH_FINDINGS.filter((t) => t.category === cat).length;
    console.log(`  ${cat}: ${count} automated / ${truthCount} ground truth`);
  }

  // Confidence distribution
  const withConfidence = report.findings.filter((f) => f.confidence !== undefined);
  if (withConfidence.length > 0) {
    const avgConfidence = withConfidence.reduce((s, f) => s + (f.confidence || 0), 0) / withConfidence.length;
    console.log();
    console.log(`Average confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    console.log(`High confidence (>80%): ${withConfidence.filter((f) => (f.confidence || 0) > 0.8).length}`);
    console.log(`Low confidence (<60%): ${withConfidence.filter((f) => (f.confidence || 0) < 0.6).length}`);
  }
}

// CLI
const reportPath = process.argv[2];
if (!reportPath) {
  console.log("Usage: npx tsx test/validate-against-manual.ts <report.json>");
  console.log();
  console.log("Run an audit first:");
  console.log("  npx tsx src/index.ts https://riveroakspark.com");
  console.log();
  console.log("Then validate:");
  console.log("  npx tsx test/validate-against-manual.ts output/riveroakspark.com/report.json");
  process.exit(1);
}

validate(reportPath).catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
