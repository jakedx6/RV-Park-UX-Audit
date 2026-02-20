/**
 * Screenshot Collector
 *
 * Uses Playwright to capture screenshots of a target URL at multiple viewports.
 * Produces desktop, mobile, tablet, and full-page captures.
 */

import { chromium, Browser, Page } from "playwright";
import path from "path";
import fs from "fs/promises";

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  fullPage: boolean;
}

export interface ScreenshotResult {
  viewport: string;
  path: string;
  width: number;
  height: number;
  fullPage: boolean;
  timestamp: string;
}

export interface ScreenshotCollectorOptions {
  outputDir: string;
  viewports?: ViewportConfig[];
  waitForNetworkIdle?: boolean;
  timeout?: number;
}

const DEFAULT_VIEWPORTS: ViewportConfig[] = [
  { name: "desktop", width: 1440, height: 900, fullPage: false },
  { name: "desktop-full", width: 1440, height: 900, fullPage: true },
  { name: "mobile", width: 375, height: 812, fullPage: false },
  { name: "tablet", width: 768, height: 1024, fullPage: false },
];

export async function collectScreenshots(
  url: string,
  options: ScreenshotCollectorOptions
): Promise<ScreenshotResult[]> {
  const {
    outputDir,
    viewports = DEFAULT_VIEWPORTS,
    waitForNetworkIdle = true,
    timeout = 30000,
  } = options;

  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results: ScreenshotResult[] = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent:
          viewport.name === "mobile"
            ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
            : undefined,
      });

      const page = await context.newPage();

      await page.goto(url, {
        waitUntil: waitForNetworkIdle ? "networkidle" : "domcontentloaded",
        timeout,
      });

      // Dismiss common cookie banners / popups
      await dismissOverlays(page);

      // Small delay for any animations to settle
      await page.waitForTimeout(1000);

      const filename = `${viewport.name}.png`;
      const filepath = path.join(outputDir, filename);

      await page.screenshot({
        path: filepath,
        fullPage: viewport.fullPage,
      });

      results.push({
        viewport: viewport.name,
        path: filepath,
        width: viewport.width,
        height: viewport.height,
        fullPage: viewport.fullPage,
        timestamp: new Date().toISOString(),
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  return results;
}

/**
 * Attempt to dismiss common cookie banners and modal overlays.
 * Uses a best-effort approach with common selectors.
 */
async function dismissOverlays(page: Page): Promise<void> {
  const dismissSelectors = [
    // Common cookie consent buttons
    '[id*="cookie"] button',
    '[class*="cookie"] button',
    '[id*="consent"] button',
    '[class*="consent"] button',
    'button[aria-label*="accept"]',
    'button[aria-label*="Accept"]',
    'button[aria-label*="close"]',
    'button[aria-label*="Close"]',
    // Generic dismiss patterns
    ".modal-close",
    ".popup-close",
    '[data-dismiss="modal"]',
  ];

  for (const selector of dismissSelectors) {
    try {
      const element = await page.$(selector);
      if (element && (await element.isVisible())) {
        await element.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // Ignore — element not found or not clickable
    }
  }
}
