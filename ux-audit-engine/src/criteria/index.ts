/**
 * Evaluation Criteria Database
 *
 * Structured checklists for each audit category.
 * These are the criteria sent to the LLM for structured evaluation.
 * The key to accuracy: specific, checkable criteria, not open-ended prompts.
 */

import { AuditCategory } from "../types";

export interface EvaluationCriteria {
  category: AuditCategory;
  checklist: string[];
  antiPatterns: string[];
}

const CRITERIA: Record<AuditCategory, EvaluationCriteria> = {
  "Information Architecture": {
    category: "Information Architecture",
    checklist: [
      "Primary navigation is visible and clearly labeled",
      "Navigation follows a conventional pattern (horizontal top nav or hamburger on mobile)",
      "Logo is positioned conventionally (top-left) and links to homepage",
      "Navigation groups are logically organized (no more than 7±2 top-level items)",
      "Current page/section is indicated in the navigation",
      "Dropdown/mega menus are organized and not overwhelming",
      "URL structure is clean and reflects the page hierarchy",
      "Breadcrumbs are present on subpages",
      "Footer navigation provides comprehensive secondary access",
      "Search is available and discoverable (if site has 20+ pages)",
    ],
    antiPatterns: [
      "Split navigation (nav items on both sides of logo)",
      "Hidden primary navigation behind a hamburger on desktop",
      "More than 10 top-level navigation items",
      "Navigation labels that use jargon or internal terminology",
      "Dead-end pages with no way to navigate further",
      "Orphan pages not reachable from main navigation",
    ],
  },

  "Visual Hierarchy": {
    category: "Visual Hierarchy",
    checklist: [
      "Primary CTA is visually prominent and above the fold",
      "Heading hierarchy creates clear information structure (H1 → H2 → H3)",
      "White space creates clear visual groupings between sections",
      "Font sizes create clear hierarchy (3-4 distinct sizes)",
      "Color is used purposefully to guide attention (not decoratively)",
      "Images are sized appropriately and don't dominate text",
      "Key information is visible without scrolling (above the fold)",
      "Consistent visual treatment for similar elements",
      "Sufficient contrast between text and background",
      "Visual flow guides the eye in a logical reading pattern",
    ],
    antiPatterns: [
      "Wall of text with no visual breaks",
      "Everything looks equally important (no hierarchy)",
      "Competing CTAs with similar visual weight",
      "Background images that make text hard to read",
      "Inconsistent spacing between similar elements",
      "Text over busy images without overlay",
    ],
  },

  "Content Strategy": {
    category: "Content Strategy",
    checklist: [
      "Value proposition is clear within 5 seconds of page load",
      "Headline is benefit-oriented (what the user gets, not what the business does)",
      "Body copy reads naturally (written for humans, not search engines)",
      "No placeholder or lorem ipsum text is visible",
      "Call-to-action copy is specific and action-oriented",
      "Content addresses user needs and questions",
      "Tone is consistent throughout the page",
      "No excessive keyword repetition (SEO keyword stuffing)",
      "Social proof is present and authentic",
      "Contact information is easy to find",
    ],
    antiPatterns: [
      "Lorem ipsum or placeholder text visible",
      "SEO-first copy that reads like a keyword list",
      "Generic copy that could apply to any business",
      "No clear value proposition in the hero section",
      "Walls of text with no subheadings or breaks",
      "Conflicting messages in different page sections",
    ],
  },

  "Conversion Flow": {
    category: "Conversion Flow",
    checklist: [
      "Primary CTA is visible above the fold",
      "CTA text is specific and action-oriented (not just 'Submit' or 'Click Here')",
      "The path from landing to conversion is 3 clicks or fewer",
      "Booking/contact form is simple (minimal required fields)",
      "Trust indicators appear near conversion points",
      "Mobile CTA is thumb-friendly (min 44x44px tap target)",
      "No unexpected redirects to third-party sites without context",
      "Form validation provides clear, inline error messages",
      "Progress is shown for multi-step processes",
      "Pricing/rates are transparent and easy to find",
    ],
    antiPatterns: [
      "CTA buried below the fold",
      "Multiple competing CTAs with no clear primary",
      "Form with more than 5-7 fields for initial contact",
      "Redirect to external site with no explanation",
      "Phone number not clickable on mobile",
      "Pricing hidden or requires contacting sales",
    ],
  },

  "Trust Signals": {
    category: "Trust Signals",
    checklist: [
      "Reviews/testimonials are displayed and appear authentic",
      "Star rating or aggregate review score is visible",
      "Review source is identified (Google, Yelp, Trustpilot, etc.)",
      "Contact information (phone, email, address) is easily accessible",
      "Physical location is shown (map or address)",
      "Professional photography is used (not exclusively stock photos)",
      "Certifications, awards, or affiliations are displayed",
      "Privacy policy and terms of service are linked",
      "SSL certificate is valid (HTTPS)",
      "Social media profiles are linked and active",
    ],
    antiPatterns: [
      "Fake or placeholder testimonials (lorem ipsum)",
      "Reviews that appear fabricated or too generic",
      "No contact information visible",
      "Broken trust badges or certification images",
      "Stock photos that feel inauthentic for the business",
      "Negative reviews prominently displayed without context",
    ],
  },

  "Technical/Performance": {
    category: "Technical/Performance",
    checklist: [
      "Page loads in under 3 seconds on broadband",
      "Largest Contentful Paint (LCP) under 2.5 seconds",
      "Cumulative Layout Shift (CLS) under 0.1",
      "Images are properly sized and optimized (WebP/AVIF)",
      "Images have explicit width/height to prevent layout shift",
      "JavaScript is not render-blocking",
      "CSS is not render-blocking for above-fold content",
      "No broken links or images",
      "Proper meta tags (title, description, OG tags)",
      "Mobile-responsive design works across viewports",
    ],
    antiPatterns: [
      "Images served at much larger dimensions than displayed",
      "Unoptimized hero images (> 500KB)",
      "Layout shift as lazy-loaded content appears",
      "Render-blocking scripts in the head",
      "Missing image alt attributes",
      "Base64-encoded images instead of proper src URLs",
    ],
  },

  Accessibility: {
    category: "Accessibility",
    checklist: [
      "All images have meaningful alt text",
      "Color contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large)",
      "Interactive elements are keyboard accessible",
      "Focus indicators are visible on interactive elements",
      "Form fields have associated labels",
      "Page language is declared in the HTML element",
      "ARIA roles are used correctly (not overused)",
      "Skip navigation link is available",
      "Touch targets are at least 44x44px",
      "No content relies solely on color to convey meaning",
    ],
    antiPatterns: [
      "Images with empty alt text or alt='image'",
      "Low contrast text on images or colored backgrounds",
      "Custom controls without keyboard support",
      "ARIA roles that conflict with native semantics",
      "Auto-playing video/audio without controls",
      "Infinite scroll without keyboard alternative",
    ],
  },
};

export function getCriteria(category: AuditCategory): EvaluationCriteria {
  return CRITERIA[category];
}

export function getAllCriteria(): Record<AuditCategory, EvaluationCriteria> {
  return CRITERIA;
}
