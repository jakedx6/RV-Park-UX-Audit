/**
 * UX Audit Engine — Main Entry Point
 *
 * Usage:
 *   npx tsx src/index.ts <url> [--output-dir ./output] [--skip-lighthouse] [--skip-a11y]
 *
 * Runs the full audit pipeline:
 *   1. Collect data (screenshots, DOM, Lighthouse, axe-core)
 *   2. Analyze (LLM vision, content analysis, deterministic checks)
 *   3. Generate report (markdown + JSON)
 */

import { collectAll } from "./collectors";
import { analyzeAll } from "./analyzers";
import { generateReport, reportToMarkdown, reportToJSON } from "./output/report";
import fs from "fs/promises";
import path from "path";

interface AuditOptions {
  url: string;
  outputDir: string;
  skipLighthouse: boolean;
  skipAccessibility: boolean;
}

async function runAudit(options: AuditOptions): Promise<void> {
  const { url, outputDir, skipLighthouse, skipAccessibility } = options;

  console.log("=".repeat(60));
  console.log(`UX AUDIT ENGINE`);
  console.log(`Target: ${url}`);
  console.log(`Output: ${outputDir}`);
  console.log("=".repeat(60));
  console.log();

  // Step 1: Collect data
  console.log("[1/3] Collecting data...");
  const collected = await collectAll(url, {
    outputDir,
    skipLighthouse,
    skipAccessibility,
    timeout: 30000,
  });
  console.log(`[1/3] Collection complete.`);
  console.log();

  // Step 2: Analyze
  console.log("[2/3] Analyzing...");
  const findings = await analyzeAll(collected);
  console.log(`[2/3] Analysis complete. ${findings.length} findings.`);
  console.log();

  // Step 3: Generate report
  console.log("[3/3] Generating report...");
  const report = generateReport(url, findings);

  // Write outputs
  await fs.mkdir(outputDir, { recursive: true });

  const markdownPath = path.join(outputDir, "report.md");
  await fs.writeFile(markdownPath, reportToMarkdown(report));
  console.log(`  Markdown report: ${markdownPath}`);

  const jsonPath = path.join(outputDir, "report.json");
  await fs.writeFile(jsonPath, reportToJSON(report));
  console.log(`  JSON report: ${jsonPath}`);

  // Save raw collection data
  const collectionPath = path.join(outputDir, "collection.json");
  await fs.writeFile(collectionPath, JSON.stringify(collected, null, 2));
  console.log(`  Collection data: ${collectionPath}`);

  console.log();
  console.log("=".repeat(60));
  console.log("AUDIT COMPLETE");
  console.log(`  Total findings: ${report.summary.totalFindings}`);
  console.log(`  Critical: ${report.summary.criticalFindings}`);
  console.log(`  Quick wins: ${report.summary.quickWins}`);
  console.log(`  Health score: ${report.summary.overallHealthScore}/100`);
  console.log("=".repeat(60));
}

// CLI argument parsing
function parseArgs(): AuditOptions {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
UX Audit Engine — AI-powered website UX analysis

Usage:
  npx tsx src/index.ts <url> [options]

Options:
  --output-dir <dir>   Output directory (default: ./output/<hostname>)
  --skip-lighthouse    Skip Lighthouse performance audit
  --skip-a11y          Skip axe-core accessibility scan
  --help               Show this help message

Examples:
  npx tsx src/index.ts https://riveroakspark.com
  npx tsx src/index.ts https://example.com --output-dir ./results
  npx tsx src/index.ts https://example.com --skip-lighthouse
`);
    process.exit(0);
  }

  const url = args[0];
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error("Error: URL must start with http:// or https://");
    process.exit(1);
  }

  const outputDirIdx = args.indexOf("--output-dir");
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const outputDir =
    outputDirIdx !== -1 && args[outputDirIdx + 1]
      ? args[outputDirIdx + 1]
      : path.join("output", hostname);

  return {
    url,
    outputDir,
    skipLighthouse: args.includes("--skip-lighthouse"),
    skipAccessibility: args.includes("--skip-a11y"),
  };
}

const options = parseArgs();
runAudit(options).catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
