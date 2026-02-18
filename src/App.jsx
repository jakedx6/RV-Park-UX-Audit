import { useState, useMemo } from 'react'

// ============================================================================
// CONSTANTS
// ============================================================================

const SITES = [
  { key: 'riveroaks', name: 'River Oaks', domain: 'riveroakspark.com', location: 'Hartford, IA' },
  { key: 'trinityalps', name: 'Trinity Alps', domain: 'trinityalpsrvpark.com', location: 'Weaverville, CA' },
  { key: 'beardedbuffalo', name: 'Bearded Buffalo', domain: 'beardedbuffaloresort.com', location: 'Custer, SD' },
  { key: 'joyrv', name: 'Joy RV', domain: 'joyrv.org', location: 'Copperas Cove, TX' },
  { key: 'strawberrypark', name: 'Strawberry Park', domain: 'strawberrypark.net', location: 'Preston, CT' },
]

const CATEGORIES = [
  'Information Architecture',
  'Visual Hierarchy',
  'Content Strategy',
  'Conversion Flow',
  'Trust Signals',
  'Technical/Performance',
  'Accessibility',
]

const STATUSES = [
  'Confirmed',
  'Partially Confirmed',
  'Changed',
  'Not Found',
]


// ============================================================================
// FINDINGS DATA
// Seeded from Initial-AI-Assesment/ux-audit.md + Notes/notes.md
// Validated via Playwright automation (see Notes/playwright-validation-report.md)
// Priority Score = userImpact² / estimatedEffort (impact-weighted, computed at render time)
// ============================================================================

const FINDINGS = [
  // --- Template-wide / All except Strawberry Park ---
  {
    id: 1,
    title: 'Split/centered navigation pattern',
    scope: 'All except Strawberry Park',
    category: 'Information Architecture',
    description: 'Logo is centered between two navigation groups instead of anchoring the top-left. This is an unconventional pattern that causes confusion — users expect a single nav bar with the logo at the left. The split layout makes navigation harder to scan.',
    userImpact: 4,
    estimatedEffort: 3,
    status: 'Confirmed',
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/validation/riveroaks-T1-split-nav.png', caption: 'River Oaks split nav with centered logo' },
      { src: '/Images/validation/strawberry-SP1-logo-left-aligned.png', caption: 'Strawberry Park left-aligned logo (reference)' },
    ],
    referenceImplementation: 'Strawberry Park',
    notes: 'Strawberry Park has the logo top-left with a single nav bar — use as the reference. This is a template-level structural change that would improve all 4 affected sites at once.',
  },
  // ID 2 removed — "organic" text artifacts not found on any site
  {
    id: 3,
    title: 'SEO-heavy keyword-stuffed body copy',
    scope: 'All except Strawberry Park',
    category: 'Content Strategy',
    description: 'Body copy reads like it was written for search engines rather than people. Keyword phrases like "RV parks near [city]" and "full hookup RV sites" are repeated excessively in close proximity, hurting readability and making the copy feel spammy.',
    userImpact: 4,
    estimatedEffort: 3,
    status: 'Confirmed',
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/validation/riveroaks-T3-seo-copy.png', caption: 'River Oaks keyword-stuffed body copy' },
    ],
    referenceImplementation: 'Strawberry Park',
    notes: 'River Oaks and Joy RV use virtually identical template copy with only city names swapped. Strawberry Park\'s copy has genuine personality ("Hey there and welcome!") and reads naturally. SEO keywords can live in meta tags, title tags, headers, and alt text without dominating every paragraph.',
  },
  {
    id: 4,
    title: 'Generic hero copy lacks emotional hook',
    scope: 'All except Joy RV',
    category: 'Content Strategy',
    description: 'Hero section taglines are generic ("Embrace the outdoor lifestyle") rather than specific and compelling. The seasonal reservation callouts below the hero are often more compelling than the hero itself.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    referenceImplementation: 'Strawberry Park',
    notes: 'River Oaks, Trinity Alps, and Bearded Buffalo all use the exact same tagline "Embrace the outdoor lifestyle". Joy RV uses "Come and Experience Joy" (unique/branded). Strawberry Park adds "family" but is otherwise the same template text.',
  },
  {
    id: 5,
    title: 'Amenities shown as single-word labels without descriptions',
    scope: 'Template-wide',
    category: 'Content Strategy',
    description: 'Amenity tiles show only an image and a single word (hiking, fishing, wifi, laundry). Users can\'t learn anything meaningful from just the word "wifi" — they need to know speeds, coverage, whether it\'s free, etc.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    referenceImplementation: null,
    notes: 'Per-site amenity labels: River Oaks: playground, fishing, wifi, laundry. Trinity Alps: fishing, campfires, river access, showers. Bearded Buffalo: fishing, campfires, hiking, playground. Joy RV: hiking, drive-in movies, wifi, laundry. Strawberry Park: pools & hottub, Rec Center, live music, sport courts, laundry (5 tiles, most variety).',
  },
  {
    id: 6,
    title: 'Dense footer duplicates full navigation structure',
    scope: 'Template-wide',
    category: 'Information Architecture',
    description: 'Footer contains a full duplication of the navigation structure, making pages quite long. While acceptable for SEO, it adds unnecessary length without clear user benefit.',
    userImpact: 2,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://joyrv.org',
    evidence: [
      { src: '/Images/validation/joyrv-T8-footer-nav.png', caption: 'Joy RV footer with deeply nested navigation + sticky header overlap' },
    ],
    referenceImplementation: null,
    notes: 'Joy RV has the worst case with deeply nested links (About > Nearby > Harker Heights/Jarrell/Leander). The sticky header overlap compounds the issue — users see two sets of navigation at once.',
  },
  {
    id: 7,
    title: 'Missing or partial image alt text across sites',
    scope: 'Template-wide',
    category: 'Accessibility',
    description: 'Image alt tags are empty or missing on multiple sites, particularly on amenity images. This is bad for both accessibility (screen readers) and SEO.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    referenceImplementation: null,
    notes: 'Per-site breakdown — River Oaks: logo alt is a 178-char SEO string; Bearded Buffalo: completely empty alt="" on all 4 amenity images (worst); Joy RV: alt="camping near temple tx" for hiking tile (wrong city); Strawberry Park: logo alt is good but amenities still SEO-stuffed.',
  },
  {
    id: 8,
    title: 'Header navigation contrast issues with video hero background',
    scope: 'Template-wide',
    category: 'Visual Hierarchy',
    description: 'Navigation text has major contrast issues against the video hero background. Text becomes difficult or impossible to read depending on the video frame, creating a significant usability barrier.',
    userImpact: 4,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/validation/riveroaks-T4-T5-hero-section.png', caption: 'Transparent header over hero — contrast issues' },
    ],
    referenceImplementation: null,
    notes: 'Technical: banner has background-color: rgba(0,0,0,0) and position: absolute on ALL sites. Strawberry Park mitigates with a solid red top bar, but nav row is still transparent.',
  },
  {
    id: 9,
    title: 'Hero message typography — excessive line spacing',
    scope: 'Template-wide',
    category: 'Visual Hierarchy',
    description: 'The hero message text has too much spacing between lines, causing the typography to feel disjointed. The headline rows don\'t feel grouped together as a single message.',
    userImpact: 3,
    estimatedEffort: 1,
    status: 'Confirmed',
    evidence: [
      { src: '/Images/validation/joyrv-homepage-viewport.png', caption: 'Joy RV hero showing excessive line spacing' },
    ],
    referenceImplementation: null,
    notes: 'Tighten the line-height/leading on hero headline text so the rows feel grouped together as a cohesive message. Simple CSS change.',
  },
  {
    id: 10,
    title: 'Amenities section images not clickable/interactive',
    scope: 'Template-wide',
    category: 'Conversion Flow',
    description: 'The "Our Amenities" section has visually captivating images, but they are not clickable. The only action is a small "Learn More" link above them. Users naturally want to click the larger, more visually prominent images to learn more about each amenity.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://riveroakspark.com',
    referenceImplementation: null,
    notes: 'Make each amenity tile clickable — either linking to the amenities page or expanding to show more detail. The images are the most visually prominent element in the section but do nothing when clicked.',
  },
  {
    id: 11,
    title: 'Navigation bottom border styling bug',
    scope: 'Strawberry Park',
    category: 'Visual Hierarchy',
    description: 'A bottom border under the top navigation shows up inconsistently or looks off on certain pages. This appears to be a CSS bug in the template.',
    userImpact: 2,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://strawberrypark.net',
    referenceImplementation: null,
    notes: 'CSS computed border shows 0px none in Playwright testing but is clearly visible in manual browsing. May be scroll-triggered or a rendering edge case.',
    evidence: [
      { src: '/Images/validation/strawberry-nav-border-issue.png', caption: 'Strawberry Park — inconsistent bottom border visible under navigation' },
    ],
  },

  // --- Site-Specific Findings ---
  {
    id: 12,
    title: 'Hidden empty testimonials section — SEO and screen reader impact',
    scope: 'Trinity Alps',
    category: 'Accessibility',
    description: 'The testimonials section renders a "What our campers are saying\u2026" heading with a completely empty content area. Sighted users see a blank gap, but screen readers will announce the heading with no content to follow. Search engines will also index a section that promises reviews but delivers nothing, potentially hurting SEO trust signals.',
    userImpact: 2,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://trinityalpsrvpark.com',
    evidence: [
      { src: '/Images/validation/trinityalps-TA1-testimonials-empty.png', caption: 'Empty testimonials section — heading with no content' },
    ],
    referenceImplementation: null,
    notes: 'The empty section creates hidden content that impacts screen readers and SEO while providing nothing to sighted users. Either populate with real reviews or remove the section entirely until content is ready.',
  },
  // ID 13 removed — Logo loads fine on Joy RV, not an issue
  {
    id: 14,
    title: 'All amenity tile images broken — base64 lazy-load failure',
    scope: 'Joy RV',
    category: 'Technical/Performance',
    description: 'All 4 amenity tile images on Joy RV are base64 SVG placeholders that fail to load (naturalWidth: 0). The amenity section shows only floating vertical text labels ("HIKING", "DRIVE-IN MOVIES", "WIFI", "LAUNDRY") with no images. The Drive-In Movie promotional flyer image loads correctly — only the amenity tiles are broken.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://joyrv.org',
    evidence: [
      { src: '/Images/validation/joyrv-JR2-broken-amenity-images.png', caption: 'All amenity images broken — only text labels visible' },
    ],
    referenceImplementation: null,
    notes: 'Same lazy-loading issue as other sites but 100% failure rate on Joy RV amenity tiles. The promotional flyer image loads fine, suggesting the issue is specific to the amenity tile component.',
  },
  {
    id: 15,
    title: '"Coming soon" amenities not visually distinguished from existing',
    scope: 'Joy RV',
    category: 'Content Strategy',
    description: 'Amenities that are coming soon (community garden, drive-in movie theater, pool, clubhouse) are listed alongside existing amenities without clear visual distinction. A user might not realize the pool doesn\'t exist yet until they arrive.',
    userImpact: 1,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://joyrv.org/amenities/',
    referenceImplementation: null,
    notes: 'Add a "Coming Soon" badge or visual treatment to clearly separate planned vs. available amenities. Trivial fix with high impact on managing visitor expectations.',
    evidence: [
      { src: '/Images/validation/joyrv-amenities-coming-soon-list.png', caption: 'All amenities use identical green checkmarks — "coming soon" items not visually distinguished' },
    ],
  },
  {
    id: 18,
    title: 'Empty alt tags on all amenity images',
    scope: 'Bearded Buffalo',
    category: 'Accessibility',
    description: 'Multiple amenity images have completely empty alt attributes (just ![](url)), providing no information to screen readers and missing SEO value.',
    userImpact: 3,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://beardedbuffaloresort.com',
    evidence: [
      { src: '/Images/validation/beardedbuffalo-BB3-amenities-empty-alt.png', caption: 'All 4 amenity images with empty alt text' },
    ],
    referenceImplementation: null,
    notes: 'Worst offender among all sites for alt text. Each image needs a descriptive alt attribute.',
  },
  {
    id: 19,
    title: 'Trustindex widget broken — initialized but invisible',
    scope: 'Strawberry Park',
    category: 'Trust Signals',
    description: 'The Trustindex widget div exists (data-ti-widget-inited="true", CSS file loaded) but renders at zero height with no visible content. The "What our campers are saying\u2026" heading is followed by a completely empty column where reviews should appear.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://strawberrypark.net',
    evidence: [
      { src: '/Images/validation/strawberry-SP6-testimonials-empty.png', caption: 'Trustindex widget invisible — Google Maps shows 3.7 stars' },
    ],
    referenceImplementation: null,
    notes: 'Google Maps embed shows 3.7 stars from 749 reviews. The broken widget may inadvertently protect the site from displaying this below-average rating.',
  },
  {
    id: 20,
    title: 'Negative review shown in limited review display',
    scope: 'Strawberry Park',
    category: 'Trust Signals',
    description: 'Of only three reviews displayed, one is negative ("Staff can be rude. I dont let that ruin my time." from T Crossley). Despite being rated 5 stars, the comment reads negatively and is one of only three reviews shown to visitors.',
    userImpact: 3,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://strawberrypark.net',
    referenceImplementation: null,
    notes: 'The T Crossley review is 5 stars but the comment is negative in tone. With only 3 reviews visible, this has outsized impact on first impressions. Recommend replacing with a positive-comment review from the 748 available Google reviews.',
    evidence: [
      { src: '/Images/validation/strawberry-negative-review.png', caption: 'T Crossley 5-star review with negative comment "Staff can be rude"' },
    ],
  },
  {
    id: 22,
    title: '"Sales/Lease-to-Own" in primary nav could confuse casual visitors',
    scope: 'Strawberry Park',
    category: 'Information Architecture',
    description: 'Having "Sales/Lease-to-Own" as a primary nav item is appropriate for the park\'s scale but could confuse casual visitors who just want to book a weekend stay.',
    userImpact: 2,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://strawberrypark.net/for-sale-lease-to-own/',
    referenceImplementation: null,
    notes: 'Consider moving to a secondary nav tier or under an "About" or "More" menu.',
  },
  {
    id: 23,
    title: '.org domain unusual for commercial RV resort',
    scope: 'Joy RV',
    category: 'Trust Signals',
    description: 'The .org domain is unusual for a commercial RV resort. Most users associate .org with nonprofits, which could subtly undermine perceived legitimacy.',
    userImpact: 2,
    estimatedEffort: 5,
    status: null,
    referenceImplementation: null,
    notes: 'Low priority — domain migration is a major project. Worth discussing but not urgent.',
  },
  {
    id: 25,
    title: 'Single "RV Sites" accommodation card looks sparse',
    scope: 'Trinity Alps',
    category: 'Visual Hierarchy',
    description: 'With only one accommodation type (full hookup RV), the accommodation cards section — designed for multiple options — shows a single lonely card that emphasizes how limited the offerings are.',
    userImpact: 2,
    estimatedEffort: 3,
    status: null,
    referenceImplementation: null,
    notes: 'Could combine with other content or use a different layout for single-accommodation parks.',
  },
  {
    id: 27,
    title: 'SEO keyword repetition in body copy',
    scope: 'Bearded Buffalo',
    category: 'Content Strategy',
    description: 'Body copy contains SEO keyword repetition, though slightly less aggressive than River Oaks and Trinity Alps. Still noticeable and hurts readability.',
    userImpact: 3,
    estimatedEffort: 3,
    status: null,
    referenceImplementation: 'Strawberry Park',
    notes: 'Same template-wide copy issue but at a moderate level. Strawberry Park\'s natural tone is the reference.',
  },
  {
    id: 28,
    title: 'Dense nav with nested dropdowns',
    scope: 'Strawberry Park',
    category: 'Information Architecture',
    description: 'While the nav structure is better than the other sites (logo is left-aligned), it\'s still quite dense with nested dropdowns. "Ways to Stay" is a better label than "Accommodations" though.',
    userImpact: 2,
    estimatedEffort: 3,
    status: null,
    referenceImplementation: null,
    notes: 'Minor issue for Strawberry Park specifically. The nav works but could be simplified.',
  },

  // --- New findings from Playwright validation (IDs 29-42) ---
  {
    id: 30,
    title: 'Mismatched phone numbers in footer',
    scope: 'Template-wide',
    category: 'Trust Signals',
    description: 'The footer bottom bar (next to "Powered by Campground Launch") contains a phone number different from the site\'s actual contact number. Strawberry Park shows (813) 578-4979 (a Tampa, FL number — likely the Campground Launch developer\'s number).',
    userImpact: 3,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://strawberrypark.net',
    evidence: [
      { src: '/Images/validation/strawberry-T8-footer.png', caption: 'Footer showing (813) area code mismatch' },
    ],
    referenceImplementation: null,
    notes: 'Confirmed on Trinity Alps, Bearded Buffalo, and Strawberry Park. River Oaks and Joy RV have consistent phone numbers. This is a template-level config issue where the footer phone wasn\'t updated from the developer default.',
  },
  {
    id: 31,
    title: 'Sticky header overlaps footer content',
    scope: 'Template-wide',
    category: 'Technical/Performance',
    description: 'The fixed/sticky header remains visible at the top of the viewport when scrolled to the bottom, overlapping footer content. Combined with the footer nav duplication, users see two sets of navigation at once.',
    userImpact: 2,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://joyrv.org',
    evidence: [
      { src: '/Images/validation/joyrv-T8-footer-nav.png', caption: 'Joy RV — sticky header overlapping footer' },
    ],
    referenceImplementation: null,
    notes: 'Simple CSS fix — either remove sticky behavior at footer scroll position or add z-index management.',
  },
  {
    id: 33,
    title: 'Amenity alt text uses SEO keywords instead of describing amenity',
    scope: 'Template-wide',
    category: 'Accessibility',
    description: 'Alt text on amenity images describes the park\'s SEO location target rather than the actual amenity. Joy RV\'s "hiking" tile has alt="camping near temple tx" (wrong city). Screen reader users hear location keywords instead of amenity descriptions.',
    userImpact: 3,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://joyrv.org',
    evidence: null,
    referenceImplementation: null,
    notes: 'Bearded Buffalo has completely empty alt text (covered in finding ID 18). This finding addresses the SEO-keyword misuse specifically on sites that DO have alt text but fill it with irrelevant location keywords.',
  },
  {
    id: 34,
    title: 'Copyright year outdated (2025)',
    scope: 'Trinity Alps',
    category: 'Trust Signals',
    description: 'Footer shows "\u00a9 2025" while all other sites correctly display "\u00a9 2026". Signals the site may not be actively maintained.',
    userImpact: 2,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://trinityalpsrvpark.com',
    evidence: null,
    referenceImplementation: null,
    notes: 'Use a dynamic year (e.g., JavaScript new Date().getFullYear()) to prevent this from happening again.',
  },
  {
    id: 37,
    title: 'Splide carousel error breaks testimonials',
    scope: 'Trinity Alps',
    category: 'Technical/Performance',
    description: 'Console logs "[splide] A track/list element is missing". This breaks the testimonials carousel entirely, leaving the section empty.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://trinityalpsrvpark.com',
    evidence: [
      { src: '/Images/validation/trinityalps-TA1-testimonials-empty.png', caption: 'Empty testimonials section from Splide error' },
    ],
    referenceImplementation: null,
    notes: 'Root cause of the empty testimonials section on Trinity Alps. Fix the Splide carousel configuration or replace with a working component.',
  },
  {
    id: 38,
    title: 'Hidden testimonials with unsubstantiated "#1 rated" claim',
    scope: 'Joy RV',
    category: 'Trust Signals',
    description: 'The testimonials section has zero height (invisible) but contains "4.8 Star Google Review Average!" text. The footer claims "#1 rated RV park near Copperas Cove" with no visible reviews to back it up.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://joyrv.org',
    evidence: null,
    referenceImplementation: null,
    notes: 'Either display the reviews to support the claims, or remove the unsubstantiated claims. Making bold claims without proof can undermine trust.',
  },
  {
    id: 39,
    title: 'Inconsistent site count (75 vs 82 full hookup sites)',
    scope: 'Joy RV',
    category: 'Content Strategy',
    description: 'The stats strip shows "75 FULL HOOKUP RV SITES" but the Drive-In Movie flyer on the same page states "82 FULL HOOKUP RV SITES". Contradictory figures suggest content hasn\'t been kept in sync.',
    userImpact: 2,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://joyrv.org',
    evidence: null,
    referenceImplementation: null,
    notes: 'Update both to the correct current number. Small detail but contradictions erode trust.',
  },
  {
    id: 40,
    title: 'Popup modal blocks content on page load',
    scope: 'River Oaks',
    category: 'Conversion Flow',
    description: 'A large "2026 Seasonal Reservations Are Now Open!" modal appears immediately on page load, blocking all content. Requires dismissal before users can interact with the site.',
    userImpact: 3,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/validation/riveroaks-homepage-viewport.png', caption: 'Popup modal blocking all content on load' },
    ],
    referenceImplementation: null,
    notes: 'Aggressive popup on first visit creates friction. Consider a less intrusive banner or delay the popup.',
  },
  {
    id: 42,
    title: 'Best booking experience — inline Newbook widget',
    scope: 'Joy RV',
    category: 'Conversion Flow',
    description: 'Joy RV\'s /booking/ page features a full inline Newbook widget with date pickers, guest count, equipment type/dimensions, feature filters, and social proof notifications. This is the best booking UX across all 5 sites.',
    userImpact: 0,
    estimatedEffort: 0,
    positive: true,
    status: 'Confirmed',
    link: 'https://joyrv.org/booking/',
    evidence: [
      { src: '/Images/validation/joyrv-booking-page-inline-widget.png', caption: 'Inline Newbook booking widget with social proof' },
    ],
    referenceImplementation: null,
    notes: 'Positive finding. Significantly better than external Campspot redirects on other sites. Consider this a reference implementation for booking UX across the portfolio.',
  },
  {
    id: 43,
    title: 'Hero text and CTA unreadable over video background',
    scope: 'Template-wide',
    category: 'Accessibility',
    description: 'White hero text and "Book Now" CTA sit directly over the full-viewport video background with no overlay or text shadow. Depending on the video frame, the text can become nearly invisible. The CTA is especially hard to spot. This is one of the most critical usability issues — it affects the first thing every visitor sees.',
    userImpact: 5,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/validation/riveroaks-hero-white-text.png', caption: 'River Oaks hero — white text over video with no contrast treatment' },
    ],
    referenceImplementation: null,
    notes: 'Add a semi-transparent dark gradient overlay behind the hero text area, or add text-shadow to ensure readability regardless of video frame. Simple CSS fix with massive impact on first impressions. Strawberry Park partially mitigates this with its red top bar but the hero text still lacks treatment.',
  },
  {
    id: 44,
    title: 'White text over content images lacks consistent contrast treatment',
    scope: 'Template-wide',
    category: 'Accessibility',
    description: 'Amenity tiles and other content sections place white text directly over photographs. Joy RV has no overlay at all. Strawberry Park has a dark overlay but it still fails when the description text is long or the background image is busy — the overlay alone isn\'t enough. River Oaks handles this best with a stronger gradient.',
    userImpact: 4,
    estimatedEffort: 1,
    status: 'Confirmed',
    link: 'https://joyrv.org/amenities/',
    evidence: [
      { src: '/Images/validation/joyrv-amenities-contrast-issues.png', caption: 'Joy RV amenity tiles — white text with no overlay, very hard to read' },
      { src: '/Images/validation/strawberry-amenities-contrast-issues.png', caption: 'Strawberry Park — dark overlay present but not enough for long text on busy backgrounds' },
    ],
    referenceImplementation: null,
    notes: 'A dark overlay alone isn\'t sufficient — Strawberry Park proves this. When text is long or the background image is busy, the overlay doesn\'t provide enough contrast. Consider a solid or near-solid dark background behind the text area rather than relying on a transparent overlay over the full image. River Oaks has the strongest treatment currently but even it could improve.',
  },
  {
    id: 45,
    title: 'Mobile hero layout — CTA cut off, nav oversized, headline pushed down',
    scope: 'Template-wide',
    category: 'Visual Hierarchy',
    description: 'On mobile, the 100vh video hero creates major layout problems. The navigation takes up excessive vertical space, pushing the headline toward the bottom of the viewport. The "Book Now" CTA is nearly cut off below the fold. There is no indication that more content exists below the hero, so users may not scroll.',
    userImpact: 5,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/validation/riveroaks-mobile-hero.png', caption: 'Mobile view — oversized nav, headline pushed down, CTA nearly cut off' },
    ],
    referenceImplementation: null,
    notes: 'Create a mobile-optimized layout with a more vertically compact nav, hero section that keeps the CTA and headline clearly in focus, and a scroll indicator showing content below the fold. The full 100vh video hero works on desktop but fails on mobile.',
  },
  {
    id: 46,
    title: 'Navigation relies on dropdown menus that hide key options',
    scope: 'Template-wide',
    category: 'Information Architecture',
    description: 'Primary navigation uses dropdown menus for Accommodations, About, and other sections. Dropdown menus should be avoided where possible — they hide options behind extra clicks, require more cognitive effort to scan, and slow users down. Key pages like accommodation types get buried in submenus that visitors may never open.',
    userImpact: 4,
    estimatedEffort: 4,
    status: 'Confirmed',
    referenceImplementation: null,
    notes: 'Where possible, flatten the navigation so key pages are directly visible. If dropdowns are unavoidable due to the number of pages, ensure the most important items (Accommodations, Rates, Book Now) are always top-level and visible without hovering or clicking.',
  },
  {
    id: 47,
    title: 'Logos with text too small to read in centered nav layout',
    scope: 'Template-wide',
    category: 'Visual Hierarchy',
    description: 'The centered logo area in the split navigation constrains logos to a small circular space. Logos that contain text (most of the sites) become unreadable at this size. This is a common challenge with shared templates where logos vary in ratio and complexity. Bearded Buffalo\'s icon-only logo works best in this space because it doesn\'t rely on text.',
    userImpact: 3,
    estimatedEffort: 3,
    status: 'Confirmed',
    link: 'https://beardedbuffaloresort.com',
    referenceImplementation: 'Bearded Buffalo',
    notes: 'Use a more standard left-aligned logo placement with enough horizontal space to handle logos that contain text. The centered circular layout only works for simple icon logos like Bearded Buffalo\'s. This ties into the broader split nav issue (ID 1) — a left-aligned nav with the logo at standard size would solve both problems.',
  },
  {
    id: 48,
    title: 'Wall of text below hero — unlikely anyone will read it',
    scope: 'Trinity Alps',
    category: 'Content Strategy',
    description: 'Immediately below the hero, Trinity Alps presents dense paragraphs of SEO-heavy body copy with no visual breaks, images, or scannable structure. Headings like "The Top Campground Near Weaverville, CA" and "Modern amenities for your California adventure" lead into long blocks of text that most visitors will skip entirely.',
    userImpact: 3,
    estimatedEffort: 3,
    status: 'Confirmed',
    link: 'https://trinityalpsrvpark.com',
    referenceImplementation: null,
    notes: 'Replace with more scannable, engaging content that speaks to "why Trinity Alps" in small text chunks with supporting visuals. Use short benefit-driven sections with icons or images instead of paragraph-heavy SEO copy. Visitors want to quickly understand what makes this park special, not read an essay.',
  },
  {
    id: 49,
    title: 'Booking page filters push site listings below the fold',
    scope: 'Joy RV',
    category: 'Conversion Flow',
    description: 'The inline Newbook booking widget stacks date pickers, guest equipment fields, and a large features checkbox grid vertically, pushing the actual site listings nearly below the fold. Users have to scroll past filters before seeing any available sites.',
    userImpact: 3,
    estimatedEffort: 2,
    status: 'Confirmed',
    link: 'https://joyrv.org/booking/',
    evidence: [
      { src: '/Images/validation/joyrv-booking-filters-size.png', caption: 'Booking filters take up most of the viewport — listings pushed below fold' },
    ],
    referenceImplementation: null,
    notes: 'Use collapsible filter sections (especially Features) or move filters to a left sidebar to reduce vertical height. The date/guest row is fine but the Equipment and Features sections could default to collapsed, letting users see results immediately.',
  },
  {
    id: 50,
    title: 'Add interactive booking/availability widgets as CTAs across the site',
    scope: 'Template-wide',
    category: 'Conversion Flow',
    description: 'While "Book Now" buttons appear in multiple places across the sites, they all link to a static booking page or external redirect. There is an opportunity to replace some of these with more interactive, conversion-driving widgets — such as a "pick your dates" availability checker, a list of sites available this week, or inline booking prompts. These should be placed throughout the site as users explore (homepage, amenities, accommodations, rates) to guide them toward conversion at the moment of interest.',
    userImpact: 4,
    estimatedEffort: 3,
    status: 'Confirmed',
    referenceImplementation: 'Joy RV',
    notes: 'Joy RV\'s inline Newbook widget on /booking/ proves the integration is possible. Bring smaller, more interactive versions of this into key pages across the site — not just the homepage. A compact date picker after amenities, a "sites available this weekend" teaser on the accommodations page, or an availability preview on the rates page would all be more engaging than static "Book Now" buttons. Multiple interactive touchpoints increase conversion as visitors explore.',
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPriorityScore = (f) => f.estimatedEffort === 0 ? 0 : (f.userImpact * f.userImpact) / f.estimatedEffort
const isQuickWin = (f) => getPriorityScore(f) >= 9
const isTemplateWide = (f) => f.scope === 'Template-wide' || f.scope.startsWith('All except')

const SCOPE_COLORS = {
  'template-wide': 'bg-blue-100 text-blue-800',
  'all-except': 'bg-purple-100 text-purple-800',
  'site-specific': 'bg-orange-100 text-orange-800',
}


const CATEGORY_COLORS = {
  'Information Architecture': 'bg-indigo-100 text-indigo-700',
  'Visual Hierarchy': 'bg-violet-100 text-violet-700',
  'Content Strategy': 'bg-amber-100 text-amber-700',
  'Conversion Flow': 'bg-emerald-100 text-emerald-700',
  'Trust Signals': 'bg-rose-100 text-rose-700',
  'Technical/Performance': 'bg-cyan-100 text-cyan-700',
  'Accessibility': 'bg-teal-100 text-teal-700',
}

const STATUS_COLORS = {
  'Confirmed': 'bg-green-100 text-green-800',
  'Partially Confirmed': 'bg-yellow-100 text-yellow-800',
  'Changed': 'bg-orange-100 text-orange-800',
  'Not Found': 'bg-red-100 text-red-800',
}

function getScopeType(scope) {
  if (scope === 'Template-wide') return 'template-wide'
  if (scope.startsWith('All except')) return 'all-except'
  return 'site-specific'
}

function getPriorityColor(score) {
  if (score >= 12) return 'text-green-600'
  if (score >= 6) return 'text-yellow-600'
  if (score >= 3) return 'text-orange-500'
  return 'text-gray-400'
}

function getPriorityBg(score) {
  if (score >= 12) return 'bg-green-50 border-green-200'
  if (score >= 6) return 'bg-yellow-50 border-yellow-200'
  if (score >= 3) return 'bg-orange-50 border-orange-200'
  return 'bg-gray-50 border-gray-200'
}

// ============================================================================
// BADGE COMPONENTS
// ============================================================================

function ScopeBadge({ scope }) {
  const type = getScopeType(scope)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${SCOPE_COLORS[type]}`}>
      {scope}
    </span>
  )
}

function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
      {category}
    </span>
  )
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}


// ============================================================================
// FINDINGS LIST VIEW
// ============================================================================

function FindingRow({ finding, isExpanded, onToggle }) {
  const score = getPriorityScore(finding)
  const scoreColor = getPriorityColor(score)
  const isTemplate = isTemplateWide(finding)

  return (
    <div className={`border-b border-gray-200 ${isTemplate ? 'border-l-4 border-l-blue-400' : ''} ${finding.positive ? 'border-l-4 border-l-green-400' : ''}`}>
      <div
        className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        {/* Priority Score */}
        <div className={`flex-shrink-0 w-16 text-center font-mono text-lg font-bold ${finding.positive ? 'text-green-500' : scoreColor}`}>
          {finding.positive ? '+' : score.toFixed(2)}
        </div>

        {/* Title + badges */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900 truncate">
            {finding.positive && <span className="text-green-600 mr-1">[Positive]</span>}
            {finding.title}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <ScopeBadge scope={finding.scope} />
            <CategoryBadge category={finding.category} />
          </div>
        </div>

        {/* Impact / Effort */}
        <div className="flex-shrink-0 flex items-center gap-3 text-xs text-gray-500">
          <div className="text-center">
            <div className="font-semibold text-sm text-gray-700">{finding.userImpact}</div>
            <div>Impact</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-sm text-gray-700">{finding.estimatedEffort}</div>
            <div>Effort</div>
          </div>
        </div>

        {/* Expand chevron */}
        <div className="flex-shrink-0 text-gray-400">
          <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
          <div className="ml-16 space-y-3">
            {/* Positive finding indicator */}
            {finding.positive && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Positive Finding — Reference Implementation
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{finding.description}</p>
            </div>

            {/* Link to site */}
            {finding.link && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">View on Site</h4>
                <a
                  href={finding.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  {finding.link.replace('https://', '')}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {finding.notes && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{finding.notes}</p>
              </div>
            )}
            {finding.referenceImplementation && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Reference Implementation</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {finding.referenceImplementation}
                </span>
              </div>
            )}

            {/* Evidence screenshots */}
            {finding.evidence && finding.evidence.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Evidence</h4>
                <div className="flex flex-wrap gap-3">
                  {finding.evidence.map((ev, idx) => (
                    <a
                      key={idx}
                      href={ev.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block max-w-xs"
                    >
                      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white group-hover:border-blue-300 transition-colors">
                        <img
                          src={ev.src}
                          alt={ev.caption}
                          className="w-full h-48 object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-tight group-hover:text-blue-600 transition-colors">{ev.caption}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-6 text-xs text-gray-500 pt-2 border-t border-gray-200">
              <span>Priority Score: <strong className={`font-mono ${finding.positive ? 'text-green-500' : scoreColor}`}>{finding.positive ? 'N/A' : score.toFixed(2)}</strong></span>
              <span>Impact: <strong>{finding.userImpact}/5</strong></span>
              <span>Effort: <strong>{finding.estimatedEffort}/5</strong></span>
              {isQuickWin(finding) && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Quick Win</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterBar({ filters, setFilters, findingsCount, totalCount }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Scope toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {['all', 'template', 'site-specific'].map((scope) => (
            <button
              key={scope}
              onClick={() => setFilters((f) => ({ ...f, scope }))}
              className={`px-3 py-1.5 font-medium transition-colors ${
                filters.scope === scope
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {scope === 'all' ? 'All' : scope === 'template' ? 'Template-wide' : 'Site-specific'}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || null }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value || null }))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value="unvalidated">Unvalidated</option>
        </select>

        {/* Quick Wins toggle */}
        <button
          onClick={() => setFilters((f) => ({ ...f, quickWins: !f.quickWins }))}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            filters.quickWins
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Quick Wins
        </button>

        {/* Count */}
        <div className="ml-auto text-sm text-gray-500">
          Showing <strong>{findingsCount}</strong> of {totalCount} findings
        </div>
      </div>
    </div>
  )
}

function SortHeader({ label, sortKey, sortConfig, onSort, className = '' }) {
  const isActive = sortConfig.key === sortKey
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 transition-colors ${className}`}
    >
      {label}
      {isActive && (
        <svg className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      )}
    </button>
  )
}

function FindingsListView({ filters, setFilters, sortConfig, setSortConfig, onNavigate }) {
  const [expandedId, setExpandedId] = useState(null)

  const filtered = useMemo(() => {
    let results = [...FINDINGS]

    if (filters.quickWins) {
      results = results.filter(isQuickWin)
    }
    if (filters.scope === 'template') {
      results = results.filter(isTemplateWide)
    } else if (filters.scope === 'site-specific') {
      results = results.filter((f) => !isTemplateWide(f))
    }
    if (filters.category) {
      results = results.filter((f) => f.category === filters.category)
    }
    if (filters.status) {
      if (filters.status === 'unvalidated') {
        results = results.filter((f) => !f.status)
      } else {
        results = results.filter((f) => f.status === filters.status)
      }
    }
    results.sort((a, b) => {
      let aVal, bVal
      if (sortConfig.key === 'priorityScore') {
        aVal = getPriorityScore(a)
        bVal = getPriorityScore(b)
      } else if (sortConfig.key === 'userImpact' || sortConfig.key === 'estimatedEffort') {
        aVal = a[sortConfig.key]
        bVal = b[sortConfig.key]
      } else {
        aVal = a[sortConfig.key] || ''
        bVal = b[sortConfig.key] || ''
      }
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
    })

    return results
  }, [filters, sortConfig])

  function handleSort(key) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  return (
    <div>
      <FilterBar filters={filters} setFilters={setFilters} findingsCount={filtered.length} totalCount={FINDINGS.length} />

      {/* Sort headers */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="w-16">
            <SortHeader label="Priority" sortKey="priorityScore" sortConfig={sortConfig} onSort={handleSort} />
          </div>
          <div className="flex-1">
            <SortHeader label="Finding" sortKey="title" sortConfig={sortConfig} onSort={handleSort} />
          </div>
          <div className="flex gap-3">
            <SortHeader label="Impact" sortKey="userImpact" sortConfig={sortConfig} onSort={handleSort} />
            <SortHeader label="Effort" sortKey="estimatedEffort" sortConfig={sortConfig} onSort={handleSort} />
          </div>
          <div className="w-5"></div>
        </div>

        {/* Findings rows */}
        {filtered.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <p className="text-lg font-medium">No findings match your filters</p>
            <p className="text-sm mt-1">Try adjusting your filter criteria</p>
          </div>
        ) : (
          filtered.map((finding) => (
            <FindingRow
              key={finding.id}
              finding={finding}
              isExpanded={expandedId === finding.id}
              onToggle={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ============================================================================
// DASHBOARD VIEW
// ============================================================================

function DashboardView({ onNavigate, setFilters }) {
  const templateFindings = FINDINGS.filter(isTemplateWide)
  const siteSpecificFindings = FINDINGS.filter((f) => !isTemplateWide(f))
  const quickWins = FINDINGS.filter(isQuickWin)
  // Template health score: 100 - (sum of template impacts / max possible) * 100
  const maxPossibleImpact = templateFindings.length * 5
  const currentImpact = templateFindings.reduce((sum, f) => sum + f.userImpact, 0)
  const healthScore = maxPossibleImpact > 0 ? Math.round(100 - (currentImpact / maxPossibleImpact) * 100) : 100

  // Category breakdown
  const categoryBreakdown = CATEGORIES.map((cat) => ({
    name: cat,
    count: FINDINGS.filter((f) => f.category === cat).length,
    templateCount: templateFindings.filter((f) => f.category === cat).length,
  }))
  const maxCategoryCount = Math.max(...categoryBreakdown.map((c) => c.count), 1)

  // Top quick wins sorted by priority
  const topQuickWins = [...quickWins].sort((a, b) => getPriorityScore(b) - getPriorityScore(a)).slice(0, 5)

  // Per-site metrics
  const siteMetrics = SITES.map((site) => {
    const siteFindings = siteSpecificFindings.filter((f) => f.scope === site.name)
    const refCount = FINDINGS.filter((f) => f.referenceImplementation === site.name).length
    const highestImpact = siteFindings.length > 0 ? siteFindings.reduce((max, f) => f.userImpact > max.userImpact ? f : max, siteFindings[0]) : null
    return { ...site, findingCount: siteFindings.length, refCount, highestImpact }
  })

  // Validation stats
  const confirmedCount = FINDINGS.filter((f) => f.status === 'Confirmed').length
  const partialCount = FINDINGS.filter((f) => f.status === 'Partially Confirmed').length
  const changedCount = FINDINGS.filter((f) => f.status === 'Changed').length
  const unvalidatedCount = FINDINGS.filter((f) => !f.status).length

  function getHealthColor(score) {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  function getHealthBg(score) {
    if (score >= 70) return 'bg-green-50 border-green-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Top metrics row */}
      <div className="grid grid-cols-4 gap-4">
        {/* Health Score */}
        <div className={`rounded-lg border p-6 ${getHealthBg(healthScore)}`}>
          <div className="text-sm font-medium text-gray-500 mb-1">Template Health</div>
          <div className={`text-4xl font-bold font-mono ${getHealthColor(healthScore)}`}>{healthScore}%</div>
          <div className="text-xs text-gray-500 mt-1">{templateFindings.length} template-wide issues</div>
        </div>

        {/* Total findings */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Findings</div>
          <div className="text-4xl font-bold font-mono text-gray-900">{FINDINGS.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {templateFindings.length} template-wide, {siteSpecificFindings.length} site-specific
          </div>
        </div>

        {/* Validation status */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Validated</div>
          <div className="text-4xl font-bold font-mono text-green-600">{confirmedCount + partialCount + changedCount}</div>
          <div className="text-xs text-gray-500 mt-1">
            {confirmedCount} confirmed, {partialCount + changedCount} partial/changed, {unvalidatedCount} pending
          </div>
        </div>

        {/* Quick Wins */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => {
            setFilters((f) => ({ ...f, quickWins: true }))
            onNavigate('findings')
          }}
        >
          <div className="text-sm font-medium text-gray-500 mb-1">Quick Wins</div>
          <div className="text-4xl font-bold font-mono text-green-600">{quickWins.length}</div>
          <div className="text-xs text-green-600 mt-1">High impact + low effort &rarr;</div>
        </div>

      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Findings by Category</h3>
        <div className="space-y-3">
          {categoryBreakdown.sort((a, b) => b.count - a.count).map((cat) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className="w-48 text-sm text-gray-700 truncate">{cat.name}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${(cat.count / maxCategoryCount) * 100}%`, minWidth: cat.count > 0 ? '2rem' : '0' }}
                  >
                    {cat.count > 0 && <span className="text-xs text-white font-medium">{cat.count}</span>}
                  </div>
                </div>
              </div>
              <div className="w-20 text-xs text-gray-500">{cat.templateCount} template</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins + Site Cards row */}
      <div className="grid grid-cols-3 gap-6">
        {/* Quick Wins preview */}
        <div className="col-span-1 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Quick Wins</h3>
            <button
              onClick={() => {
                setFilters((f) => ({ ...f, quickWins: true }))
                onNavigate('findings')
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All &rarr;
            </button>
          </div>
          <div className="space-y-3">
            {topQuickWins.map((f) => (
              <div key={f.id} className="flex items-start gap-3">
                <span className={`font-mono text-sm font-bold ${getPriorityColor(getPriorityScore(f))}`}>
                  {getPriorityScore(f).toFixed(1)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 leading-tight">{f.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{f.scope}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-site cards */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Per-Site Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            {siteMetrics.map((site) => (
              <div key={site.key} className={`rounded-lg border p-4 ${site.key === 'strawberrypark' ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{site.name}</div>
                    <a
                      href={`https://${site.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {site.domain}
                    </a>
                  </div>
                  {site.key === 'strawberrypark' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-200 text-green-800">Benchmark</span>
                  )}
                  {site.refCount > 0 && site.key !== 'strawberrypark' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Ref x{site.refCount}</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {site.findingCount > 0 ? (
                    <>
                      <span className="font-semibold text-gray-700">{site.findingCount}</span> site-specific {site.findingCount === 1 ? 'issue' : 'issues'}
                      {site.highestImpact && (
                        <div className="mt-1 text-gray-600 truncate">Top: {site.highestImpact.title}</div>
                      )}
                    </>
                  ) : (
                    <span className="text-green-600">No site-specific issues</span>
                  )}
                  {site.refCount > 0 && (
                    <div className="mt-1 text-green-600">Reference for {site.refCount} {site.refCount === 1 ? 'finding' : 'findings'}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// APP SHELL
// ============================================================================

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'findings', label: 'Findings' },
]

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [filters, setFilters] = useState({
    scope: 'all',
    category: null,
    status: null,
    quickWins: false,
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'priorityScore',
    direction: 'desc',
  })

  function handleNavigate(view) {
    setActiveView(view)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">RV Park UX Audit</h1>
            <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">5 sites &middot; {FINDINGS.length} findings</span>
          </div>
          <nav className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === item.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeView === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} setFilters={setFilters} />
        )}
        {activeView === 'findings' && (
          <FindingsListView
            filters={filters}
            setFilters={setFilters}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            onNavigate={handleNavigate}
          />
        )}
      </main>
    </div>
  )
}
