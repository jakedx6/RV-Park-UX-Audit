/**
 * DOM Collector
 *
 * Extracts structured data from a page's DOM:
 * - Navigation structure (links, menus)
 * - Heading hierarchy
 * - Visible text content
 * - Form elements
 * - Image inventory (with alt text)
 * - Meta tags and structured data
 */

import { chromium } from "playwright";

export interface NavItem {
  text: string;
  href: string;
  children?: NavItem[];
}

export interface HeadingNode {
  level: number;
  text: string;
}

export interface ImageInfo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  isLazyLoaded: boolean;
}

export interface FormInfo {
  action: string;
  method: string;
  fields: { name: string; type: string; label?: string; required: boolean }[];
}

export interface MetaInfo {
  title: string;
  description: string;
  ogTags: Record<string, string>;
  schemaOrg: object[];
}

export interface DOMCollectionResult {
  url: string;
  navigation: NavItem[];
  headings: HeadingNode[];
  visibleText: string;
  images: ImageInfo[];
  forms: FormInfo[];
  meta: MetaInfo;
  links: { href: string; text: string; isExternal: boolean }[];
  timestamp: string;
}

export async function collectDOM(
  url: string,
  options: { timeout?: number } = {}
): Promise<DOMCollectionResult> {
  const { timeout = 30000 } = options;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout });

    const result = await page.evaluate((pageUrl: string) => {
      // Navigation
      const navElements = document.querySelectorAll("nav a, header a");
      const navigation: NavItem[] = Array.from(navElements).map((a) => ({
        text: (a as HTMLAnchorElement).textContent?.trim() || "",
        href: (a as HTMLAnchorElement).href,
      }));

      // Headings
      const headingElements = document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6"
      );
      const headings: HeadingNode[] = Array.from(headingElements).map((h) => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim() || "",
      }));

      // Visible text
      const bodyText = document.body?.innerText || "";

      // Images
      const imgElements = document.querySelectorAll("img");
      const images: ImageInfo[] = Array.from(imgElements).map((img) => ({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth || undefined,
        height: img.naturalHeight || undefined,
        isLazyLoaded: img.loading === "lazy" || !!img.dataset.src,
      }));

      // Forms
      const formElements = document.querySelectorAll("form");
      const forms: FormInfo[] = Array.from(formElements).map((form) => ({
        action: form.action,
        method: form.method,
        fields: Array.from(
          form.querySelectorAll("input, select, textarea")
        ).map((field) => {
          const input = field as HTMLInputElement;
          const label = document.querySelector(`label[for="${input.id}"]`);
          return {
            name: input.name,
            type: input.type || field.tagName.toLowerCase(),
            label: label?.textContent?.trim(),
            required: input.required,
          };
        }),
      }));

      // Meta tags
      const metaTitle = document.title;
      const metaDesc =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";
      const ogTags: Record<string, string> = {};
      document
        .querySelectorAll('meta[property^="og:"]')
        .forEach((tag) => {
          const prop = tag.getAttribute("property") || "";
          ogTags[prop] = tag.getAttribute("content") || "";
        });

      // Schema.org
      const schemaScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      const schemaOrg: object[] = [];
      schemaScripts.forEach((script) => {
        try {
          schemaOrg.push(JSON.parse(script.textContent || ""));
        } catch {
          // Skip malformed JSON-LD
        }
      });

      // All links
      const allLinks = document.querySelectorAll("a[href]");
      const hostname = new URL(pageUrl).hostname;
      const links = Array.from(allLinks).map((a) => {
        const anchor = a as HTMLAnchorElement;
        let isExternal = false;
        try {
          isExternal = new URL(anchor.href).hostname !== hostname;
        } catch {
          // relative URL — internal
        }
        return {
          href: anchor.href,
          text: anchor.textContent?.trim() || "",
          isExternal,
        };
      });

      return {
        url: pageUrl,
        navigation,
        headings,
        visibleText: bodyText.slice(0, 50000), // Cap at 50K chars
        images,
        forms,
        meta: {
          title: metaTitle,
          description: metaDesc,
          ogTags,
          schemaOrg,
        },
        links,
        timestamp: new Date().toISOString(),
      };
    }, url);

    return result as DOMCollectionResult;
  } finally {
    await browser.close();
  }
}
