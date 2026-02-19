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
    researchRefs: ['homepage-cta', 'older-demographics'],
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/riveroakspark-header-navigation.png', caption: 'River Oaks split nav with centered logo' },
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
    researchRefs: ['local-area-content', 'demographics'],
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
    researchRefs: ['homepage-cta', 'demographics'],
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
    researchRefs: ['pricing-transparency', 'trust-signals'],
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
    researchRefs: ['older-demographics'],
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
    researchRefs: ['older-demographics'],
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
    researchRefs: ['homepage-cta'],
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
    researchRefs: ['homepage-cta'],
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
    researchRefs: ['trust-signals'],
    link: 'https://trinityalpsrvpark.com',
    evidence: [
      { src: '/Images/validation/trinityalps-TA1-testimonials-empty.png', caption: 'Empty testimonials section — heading with no content' },
    ],
    referenceImplementation: null,
    notes: 'The empty section creates hidden content that impacts screen readers and SEO while providing nothing to sighted users. Either populate with real reviews or remove the section entirely until content is ready.',
  },
  // ID 13 removed — Logo loads fine on Joy RV, not an issue
  {
    id: 15,
    title: '"Coming soon" amenities not visually distinguished from existing',
    scope: 'Joy RV',
    category: 'Content Strategy',
    description: 'Amenities that are coming soon (community garden, drive-in movie theater, pool, clubhouse) are listed alongside existing amenities without clear visual distinction. A user might not realize the pool doesn\'t exist yet until they arrive.',
    userImpact: 1,
    estimatedEffort: 1,
    status: 'Confirmed',
    researchRefs: ['trust-signals'],
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
    researchRefs: ['older-demographics'],
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
    researchRefs: ['trust-signals'],
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
    researchRefs: ['trust-signals'],
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
    researchRefs: ['homepage-cta'],
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
    researchRefs: ['trust-signals'],
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
    researchRefs: ['local-area-content', 'demographics'],
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
    researchRefs: ['homepage-cta', 'older-demographics'],
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
    researchRefs: ['trust-signals', 'mobile-booking'],
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
    researchRefs: ['older-demographics'],
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
    researchRefs: ['trust-signals'],
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
    researchRefs: ['trust-signals'],
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
    researchRefs: ['trust-signals'],
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
    researchRefs: ['trust-signals'],
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
    researchRefs: ['seasonal-urgency', 'conversion-barriers'],
    link: 'https://riveroakspark.com',
    evidence: [
      { src: '/Images/validation/riveroaks-homepage-viewport.png', caption: 'Popup modal blocking all content on load' },
    ],
    referenceImplementation: null,
    notes: 'Aggressive popup on first visit creates friction. Consider a less intrusive banner or delay the popup.',
  },
  // ID 42 removed — positive-only finding (Joy RV inline Newbook widget); referenced as best example in IDs 50 and 52
  {
    id: 43,
    title: 'Hero text and CTA unreadable over video background',
    scope: 'Template-wide',
    category: 'Accessibility',
    description: 'White hero text and "Book Now" CTA sit directly over the full-viewport video background with no overlay or text shadow. Depending on the video frame, the text can become nearly invisible. The CTA is especially hard to spot. This is one of the most critical usability issues — it affects the first thing every visitor sees.',
    userImpact: 5,
    estimatedEffort: 1,
    status: 'Confirmed',
    researchRefs: ['older-demographics', 'homepage-cta'],
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
    researchRefs: ['older-demographics'],
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
    researchRefs: ['mobile-booking'],
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
    researchRefs: ['homepage-cta', 'older-demographics'],
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
    researchRefs: ['homepage-cta'],
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
    researchRefs: ['homepage-cta', 'demographics'],
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
    researchRefs: ['conversion-barriers', 'mobile-booking'],
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
    researchRefs: ['homepage-cta', 'conversion-barriers'],
    referenceImplementation: 'Joy RV',
    notes: 'Joy RV\'s inline Newbook widget on /booking/ proves the integration is possible. Bring smaller, more interactive versions of this into key pages across the site — not just the homepage. A compact date picker after amenities, a "sites available this weekend" teaser on the accommodations page, or an availability preview on the rates page would all be more engaging than static "Book Now" buttons. Multiple interactive touchpoints increase conversion as visitors explore.',
  },

  // --- Research-backed Recommendations (IDs 51-60) ---
  // Framed as improvement opportunities, each linked to research via researchRefs
  {
    id: 51,
    title: 'Opportunity: Surface rates/pricing directly on site to reduce abandonment',
    scope: 'Template-wide',
    category: 'Conversion Flow',
    description: 'Research shows 55% of travelers abandon bookings over unexpected costs, and RV travelers actively comparison-shop across 3-5 parks. Currently, rate information requires navigating to a separate page or clicking through to an external booking platform. Surfacing clear rate ranges — by site type, with included utilities and seasonal variations — directly on the homepage or accommodations page would significantly reduce friction and abandonment.',
    userImpact: 5,
    estimatedEffort: 2,
    status: null,
    referenceImplementation: null,
    researchRefs: ['pricing-transparency', 'conversion-barriers'],
    notes: 'Display rates by site type (full hookup, partial, pull-through) with amp service (30/50), nightly/weekly/monthly, and what\'s included. Show Good Sam/AAA/military discounts prominently. "Call for rates" is a documented conversion killer. Even a rate range ("From $45/night") is better than nothing.',
  },
  {
    id: 52,
    title: 'Opportunity: Integrated booking platform vs. external Campspot redirect',
    scope: 'All except Joy RV',
    category: 'Conversion Flow',
    description: 'When visitors click "Book Now" on most of these sites, they are redirected to Campspot — an entirely different domain with different branding. Research shows this contextual break causes 19-26% abandonment. Joy RV\'s inline Newbook widget (ID 42) proves integrated booking is possible and delivers a dramatically better experience. An integrated, on-site booking platform would eliminate the redirect abandonment and keep visitors in a consistent branded experience throughout the conversion funnel.',
    userImpact: 4,
    estimatedEffort: 3,
    status: null,
    referenceImplementation: 'Joy RV',
    researchRefs: ['conversion-barriers', 'homepage-cta'],
    notes: 'This is a strong case for investing in an integrated bookings platform. The redirect to Campspot creates a measurable conversion gap. Joy RV\'s Newbook integration shows this is technically feasible within the template. An owned booking platform would also provide direct access to customer data, enable upselling, and eliminate third-party commission.',
  },
  {
    id: 53,
    title: 'Standardize Google review aggregates on all homepages',
    scope: 'Template-wide',
    category: 'Trust Signals',
    description: 'Google reviews are the #1 trusted source for accommodation decisions, and 62% of travelers say real guest reviews are more influential than marketing copy. Some sites (Bearded Buffalo, parts of Strawberry Park) already display review content, but it\'s inconsistent. Standardizing a visible Google review aggregate — star rating, review count, and 2-3 recent positive quotes — on every homepage would strengthen trust signals across all properties.',
    userImpact: 4,
    estimatedEffort: 2,
    status: null,
    referenceImplementation: 'Bearded Buffalo',
    researchRefs: ['trust-signals'],
    notes: 'Bearded Buffalo already shows review content. Strawberry Park has a broken Trustindex widget (ID 19). Joy RV claims "4.8 stars" but hides the actual reviews (ID 38). Trinity Alps has an empty testimonials section (ID 12). A template-level Google Reviews widget would solve multiple existing findings while boosting trust across all sites.',
  },
  {
    id: 54,
    title: 'Opportunity: Dedicated "Things to Do Nearby" local area page',
    scope: 'Template-wide',
    category: 'Content Strategy',
    description: 'Local area content serves three conversion purposes: it answers "is there enough to do?" (decision-making), captures "camping near [attraction]" searches (SEO), and is the primary way parks sharing the same template can differentiate from each other. A dedicated page organized by activity type — with distances, drive times, and seasonal suggestions — would drive both organic traffic and bookings.',
    userImpact: 3,
    estimatedEffort: 3,
    status: null,
    referenceImplementation: null,
    researchRefs: ['local-area-content'],
    notes: 'Organize by activity type: hiking, fishing, water activities, family attractions, dining, cultural sites. Include distance/drive time from the park. Add seasonal content ("What to do nearby in fall") to target off-season search traffic. Cross-promotion partnerships with local attractions create exclusivity signals. This is the biggest differentiation opportunity for template-shared sites.',
  },
  {
    id: 55,
    title: 'Opportunity: Seasonal/urgency messaging to drive advance bookings',
    scope: 'Template-wide',
    category: 'Conversion Flow',
    description: 'Campsite demand has surged 4x since 2019, making scarcity real — not manufactured. Currently, only River Oaks uses any urgency messaging (an aggressive popup, ID 40). There\'s an opportunity to implement tasteful, honest seasonal messaging: dynamic hero content by season, availability indicators, and early-bird incentives that encourage advance planning without resorting to manipulative tactics.',
    userImpact: 3,
    estimatedEffort: 2,
    status: null,
    referenceImplementation: null,
    researchRefs: ['seasonal-urgency'],
    notes: 'Seasonal hero content rotation: off-season ("Plan Your Summer — Book Early for Best Selection"), peak approach ("Summer Weekends Filling Fast"), peak ("Check Availability" with calendar), post-season ("Join the Waitlist for Next Year"). Real-time availability calendar creates natural urgency. Early-bird discounts ("Book before March 15 for 15% off") fill shoulder seasons. Avoid fake countdowns or manufactured scarcity.',
  },
  {
    id: 56,
    title: 'Opportunity: Add actual RV site/pad photos alongside landscape imagery',
    scope: 'Template-wide',
    category: 'Content Strategy',
    description: 'Research shows 78% of travelers make accommodation decisions from photos alone, yet quality photography can potentially double yearly reservations. Current site photos emphasize landscapes and amenity icons but don\'t show what RV travelers most want to see: the actual RV pads — surface condition, hookup placement, site spacing, shade coverage, and leveling. Adding site-level photography would address the most decision-critical visual gap.',
    userImpact: 4,
    estimatedEffort: 3,
    status: null,
    referenceImplementation: null,
    researchRefs: ['photo-content', 'trust-signals'],
    notes: 'Priority photography: individual RV sites (pad surface, hookups, spacing, shade), people enjoying the park, amenities in use (not empty), entry/landmark shots, aerial drone overview, golden-hour shots. 51% of customers respond better to images of real people. Gallery should support full-screen viewing without leaving the page. Technical: WebP format, responsive sizing, lazy loading for mobile performance.',
  },
  {
    id: 57,
    title: 'Opportunity: Display hookup specs (30/50 amp, full/partial) on homepage',
    scope: 'Template-wide',
    category: 'Content Strategy',
    description: 'RV travelers need to match their rig to the site — 30 vs. 50 amp, full hookup vs. partial, sewer availability, and WiFi reliability are non-negotiable decision factors. Currently, this information is buried in booking platforms or accommodation subpages. Surfacing key specs directly in the homepage accommodation cards or a clear comparison table would eliminate a major source of phone calls and reduce decision friction.',
    userImpact: 4,
    estimatedEffort: 2,
    status: null,
    referenceImplementation: null,
    researchRefs: ['pricing-transparency', 'trust-signals'],
    notes: 'Amenity tiles currently show single-word labels (ID 5). Replacing or supplementing these with specific hookup specs would be far more useful for RV travelers making a booking decision. A simple grid: site type, amp service, hookups included, max RV length, price range.',
  },
  {
    id: 58,
    title: 'Opportunity: Streamline contact/inquiry forms to reduce friction',
    scope: 'Template-wide',
    category: 'Conversion Flow',
    description: 'Research shows 26% of travelers abandon bookings over complicated forms, and 39% of mobile users abandon due to form difficulty. Streamlining contact and inquiry forms — fewer required fields, larger inputs, auto-fill support, and native mobile date pickers — would reduce friction for both desktop and mobile users. The optimal flow: dates and basic info first, then details after availability is confirmed.',
    userImpact: 3,
    estimatedEffort: 2,
    status: null,
    referenceImplementation: null,
    researchRefs: ['conversion-barriers', 'mobile-booking'],
    notes: 'Minimize required fields to the absolute minimum. Use native mobile date inputs (not desktop calendar widgets). Support auto-fill for name, email, address. Large input fields with adequate spacing. Specific validation messages ("Please enter a valid phone number") not generic errors. Guest checkout must be available — no forced account creation.',
  },
  {
    id: 59,
    title: 'Opportunity: Feature guest/user-generated photo content for authenticity',
    scope: 'Template-wide',
    category: 'Trust Signals',
    description: '62% of travelers say images posted by real guests are the most influential endorsement — more than professional photography. Featuring user-generated content (UGC) from guest photos, social media, and reviews would boost trust signals while costing nothing to produce. Even low-quality guest photos outperform polished brand photography for authenticity.',
    userImpact: 3,
    estimatedEffort: 3,
    status: null,
    referenceImplementation: null,
    researchRefs: ['photo-content', 'trust-signals'],
    notes: 'Implementation path: create a branded hashtag displayed physically in the park (on signs, check-in cards). Request guest photos post-stay in follow-up emails. Feature the best UGC prominently on the site — a dedicated gallery section or integrated into the reviews area. Instagram feed embed is the lowest-effort starting point.',
  },
  {
    id: 60,
    title: 'Opportunity: Surface cancellation/refund policy before booking step',
    scope: 'Template-wide',
    category: 'Trust Signals',
    description: 'Research identifies "restrictive terms" as one of the biggest dealbreakers for travel bookings. Making the cancellation and refund policy visible and easy to find — before visitors enter the booking flow — reduces hesitation and builds confidence. A clear, simple policy displayed near booking CTAs signals transparency and encourages commitment.',
    userImpact: 4,
    estimatedEffort: 1,
    status: null,
    referenceImplementation: null,
    researchRefs: ['conversion-barriers', 'trust-signals'],
    notes: 'Add a brief cancellation summary near "Book Now" CTAs (e.g., "Free cancellation up to 48 hours before check-in"). Link to full policy. This is a quick win — simple content addition with outsized trust impact. Burying the policy in fine print or requiring visitors to search for it increases abandonment.',
  },
]

// ============================================================================
// RESEARCH DATA
// Research compiled from industry sources on RV park/campground UX & conversions
// Each topic is referenced by findings via researchRefs field
// ============================================================================

const RESEARCH_DATA = [
  {
    id: 'demographics',
    title: 'Visitor Demographics & Booking Behavior',
    insights: [
      { stat: '49', label: 'Median RV owner age', text: 'The RV traveler audience is broader and younger than commonly assumed — not exclusively retirees.' },
      { stat: '22%', label: '18-34 year-old RV owners', text: 'Up from 8.5% in 2018 — a significant generational shift in the RV market.' },
      { stat: '43%', label: 'Have children under 18', text: 'Families are a major segment, not a niche. Site content should speak to family travelers.' },
      { stat: '185', label: 'Pages viewed before booking', text: 'The average traveler views 185 pages of travel content in the 45 days before booking.' },
    ],
    detail: 'The RV traveler audience spans retirees, families, and younger adventure seekers. Primary motivations are relaxation (58%), time in nature (57%), and visiting beautiful locations (53%). The emotional hook for these sites should be escape and nature — not feature spec sheets. First-time campers account for 1 in 3 reservations, meaning many visitors have no prior relationship with the park and must be won entirely from the website.',
    sources: [
      { title: 'CamperFAQs — RV Statistics, Trends & Facts 2024', url: 'https://camperfaqs.com/rv-statistics-trends-facts' },
      { title: 'RVshare — 2024 RV Travel Trend Report', url: 'https://rvshare.com/blog/rv-travel-trends-2024/' },
      { title: 'Expedia Group — Traveler Path to Purchase', url: 'https://partner.expediagroup.com/en-us/resources/blog/traveler-path-to-purchase-amer-insights' },
    ],
  },
  {
    id: 'homepage-cta',
    title: 'Homepage & CTA Best Practices',
    insights: [
      { stat: '<1s', label: 'Time to form opinion', text: 'Users form an opinion about a website in under one second. Visual impression and load speed are conversion factors before content registers.' },
      { stat: '28%', label: 'Bounce rate drop', text: 'The Zetter Hotel saw a 28% drop in bounce rate after placing a booking widget and "Book Direct" offer above the fold.' },
      { stat: '3', label: 'Clicks to booking', text: 'Guests need to find rates, amenities, and booking options in under 3 clicks for optimal conversion.' },
    ],
    detail: 'The highest-converting campground homepages follow an above-the-fold formula: compelling site-specific hero image (not stock), short emotion-led headline, direct booking CTA visible without scrolling, and optionally an inline date picker. CTAs must appear at multiple points in the scroll journey — not just the header. Best-performing CTA text: "Book Now," "Check Availability," "Reserve Your Site." Generic CTAs like "Learn More" dramatically underperform. A sticky header CTA (always visible on scroll) significantly reduces friction.',
    sources: [
      { title: 'Campspot — Design Best Practices for High-Converting Campground Websites', url: 'https://support.campspot.com/design-best-practices-for-a-high-converting-campground-website' },
      { title: 'Spilt Milk — Conversion Rate Optimization for Boutique Hotels 2025', url: 'https://spiltmilkwebdesign.com/conversion-rate-optimization-website-ux-for-boutique-hotels-in-2025/' },
      { title: 'Five Star Content — Hotel Booking Funnel Conversion Guide', url: 'https://www.fivestarcontent.co/blog/improve-hotel-website-conversion-rate' },
    ],
  },
  {
    id: 'conversion-barriers',
    title: 'Conversion Barriers in Hospitality',
    insights: [
      { stat: '55%', label: 'Abandon over hidden fees', text: 'Unexpected fees and unclear pricing are the #1 reason travelers abandon a booking.' },
      { stat: '26%', label: 'Abandon over complex checkout', text: 'Lengthy checkout processes with too much information requested upfront drive abandonment.' },
      { stat: '19%', label: 'Abandon over forced registration', text: 'Requiring account creation before booking is a disproportionate barrier for older demographics.' },
      { stat: '85%', label: 'Mobile abandonment rate', text: 'Mobile abandonment rates in travel reach ~85% when the mobile experience is poor.' },
    ],
    detail: 'When clicking "Book Now" sends visitors to an entirely different domain (like Campspot), abandonment rates spike. The visual and contextual break disrupts confidence. Seamless integration — or at minimum clear branding continuity on the booking platform — is essential. Other key barriers: outdated visuals signaling unreliability, missing contact information, no visible reviews, and poor mobile form design with small tap targets.',
    sources: [
      { title: 'Campground Consulting Group — Why Your Website Matters More Than Ever', url: 'https://campgroundconsultinggroup.com/why-your-campgrounds-website-is-more-important-than-ever-and-how-to-get-it-right/' },
      { title: 'Basecamp — Why 70% of Guests Leave If Your Website Isn\'t Mobile-Friendly', url: 'https://meetatbasecamp.com/why-70-of-guests-leave-if-your-website-isnt-mobile-friendly/' },
      { title: 'OHI — Top 10 Factors Influencing Campground Bookings 2024', url: 'https://ohi.org/ohi-blog/top-10-factors-influencing-campground-bookings-in-2024/' },
    ],
  },
  {
    id: 'trust-signals',
    title: 'Trust Signals for RV Travelers',
    insights: [
      { stat: '#1', label: 'Google reviews = most trusted', text: 'Google reviews are the most trusted source. Embedding a live feed with star ratings is significantly more credible than handpicked testimonials.' },
      { stat: '78%', label: 'Decide from photos alone', text: 'The majority of travelers make their accommodation decision based on photos alone.' },
      { stat: '62%', label: 'Trust guest photos most', text: 'Real guest photos are more influential than professional photography for accommodation trust signals.' },
    ],
    detail: 'The highest-impact trust signals for RV travelers in priority order: recent Google reviews (stars + count visible), photos of actual campsites (not just landscapes), specific hookup/utility information, visible phone number in header, clear cancellation policy, third-party certifications (Good Sam, AAA, ARVC), and user-generated content. The outdoor hospitality industry is especially susceptible to external reviews because camping is experience-based and easily comparable online.',
    sources: [
      { title: 'OHI — Top 10 Factors Influencing Campground Bookings 2024', url: 'https://ohi.org/ohi-blog/top-10-factors-influencing-campground-bookings-in-2024/' },
      { title: 'Good Sam / Campground Solutions — Better Photos = More Reservations', url: 'https://campgroundsolutions.goodsam.com/blog/better-photos/' },
      { title: 'Campspot — 5 Campground Photography Questions Answered', url: 'https://software.campspot.com/blog/5-common-photography-questions-for-campgrounds/' },
    ],
  },
  {
    id: 'mobile-booking',
    title: 'Mobile Booking Patterns',
    insights: [
      { stat: '60%+', label: 'Bookings on mobile', text: 'Over 60% of campground bookings now happen on mobile devices.' },
      { stat: '32%', label: 'Booking increase from mobile redesign', text: 'One documented case study showed a mobile-first redesign produced a 32% increase in organic bookings within 3 months.' },
      { stat: '3s', label: 'Max load time on cellular', text: 'Pages must load under 3 seconds on cellular connections — not just WiFi — or visitors abandon.' },
      { stat: '44px', label: 'Minimum tap target size', text: 'Apple HIG standard for touch targets. Campground sites frequently fail this for booking buttons.' },
    ],
    detail: 'RV travelers are a uniquely mobile audience. Unlike hotel guests who typically book weeks in advance from a desktop, RV travelers frequently book same-day or 1-3 days ahead while on the road — on a phone with a cell connection, often with one hand free. Non-negotiable baseline: page load under 3s on cellular, tap targets 44x44px minimum, phone number as tappable tel: link, address linking to maps app, "Book Now" visible without scrolling on a 375px screen. Date pickers must use native mobile date input, not desktop calendar widgets.',
    sources: [
      { title: 'Basecamp — Why 70% of Guests Leave If Your Website Isn\'t Mobile-Friendly', url: 'https://meetatbasecamp.com/why-70-of-guests-leave-if-your-website-isnt-mobile-friendly/' },
      { title: 'Indio — Essential RV Park Website Design Features', url: 'https://www.getindio.com/website-features-for-rv-parks/' },
      { title: 'Florida RV Park Association — Digital Marketing Strategies for RV Parks', url: 'https://campflorida.org/navigating-the-digital-landscape-online-marketing-strategies-for-rv-parks/' },
    ],
  },
  {
    id: 'seasonal-urgency',
    title: 'Seasonal & Urgency Messaging',
    insights: [
      { stat: '4x', label: 'Harder to book than 2019', text: 'Campsite demand has surged — it\'s now 4x more difficult to book than pre-pandemic. Scarcity is real, not manufactured.' },
      { stat: '15%', label: 'Early bird discount impact', text: '"Book before [date] for 15% off summer rates" encourages advance planning and fills shoulder seasons.' },
    ],
    detail: 'Effective urgency patterns: inventory-specific availability ("Only 3 sites left for Memorial Day"), real-time availability calendars showing taken dates, social proof signals ("X people viewed this park today"), and early bird discounts with deadlines. What NOT to do: manufactured scarcity (RV travelers share bad experiences widely), countdown timers that reset on reload (recognized as fake), aggressive popups. Parks should change hero content by season: off-season ("Plan Your Summer Now"), peak approach ("Summer Weekends Filling Fast"), peak ("Check Dates" with calendar), post-season ("Join the Waitlist").',
    sources: [
      { title: 'WP Booking System — Using Scarcity and Urgency to Drive Bookings', url: 'https://www.wpbookingsystem.com/blog/how-to-use-scarcity-and-urgency-to-drive-more-bookings/' },
      { title: 'Formula — Drive Direct Bookings with Scarcity Tactics', url: 'https://thisisformula.com/3-ways-hotels-can-use-scarcity-and-urgency-tactics-to-drive-direct-revenue-growth/' },
      { title: 'RoverPass — Annual Report: Key Outdoor Hospitality Insights 2025', url: 'https://www.roverpass.com/blog/the-roverpass-annual-report-exclusive-data-shaping-camping-rving-and-glamping/' },
    ],
  },
  {
    id: 'photo-content',
    title: 'Photo & Visual Content',
    insights: [
      { stat: '78%', label: 'Decide from photos', text: 'The vast majority of travelers make their accommodation decision based on photos alone.' },
      { stat: '94%', label: 'More views with quality photos', text: 'Sites with relevant, quality photos receive 94% more views than those without.' },
      { stat: '2x', label: 'Reservations with great photos', text: 'Quality photography can potentially double yearly reservations for a campground.' },
      { stat: '51%', label: 'Respond to images of people', text: 'Customers respond better to images showing actual people enjoying facilities vs. empty spaces.' },
    ],
    detail: 'What to photograph (priority order): individual RV sites showing actual pad surface, hookup placement, spacing, shade, and leveling — this is the most decision-critical visual for RV travelers and most commonly missing. Then: people enjoying the park, amenities in use (not empty), park entry/landmark shots, aerial/drone overview, and golden-hour shots. User-generated content outperforms brand photography for trust. Technical: images large enough to be immersive on desktop but optimized (WebP, responsive sizing) for mobile load time.',
    sources: [
      { title: 'Good Sam / Campground Solutions — Better Photos = More Reservations', url: 'https://campgroundsolutions.goodsam.com/blog/better-photos/' },
      { title: 'Campspot — 5 Campground Photography Questions Answered', url: 'https://software.campspot.com/blog/5-common-photography-questions-for-campgrounds/' },
      { title: 'Knapsack Creative — Campground SEO Guide 2025', url: 'https://knapsackcreative.com/blog-industry/rv-park-seo-strategies' },
    ],
  },
  {
    id: 'pricing-transparency',
    title: 'Pricing Transparency & Rate Display',
    insights: [
      { stat: '55%', label: 'Abandon over hidden costs', text: 'Unexpected fees at checkout are the single largest reason for booking abandonment in hospitality.' },
      { stat: '#1', label: 'Comparison shopping behavior', text: 'RVers are budget-conscious and compare rates across 3-5 parks simultaneously. Opaque pricing = instant bounce.' },
    ],
    detail: 'What to display: rate by site type (full hookup, partial, pull-through, back-in), amp service (30 vs. 50 with price differential), nightly/weekly/monthly rates, what\'s included (water, sewer, electric, WiFi), seasonal rate changes with dates, and discounts (Good Sam, AAA, military, senior, extended stay). Anchor pricing technique: show standard rate alongside discounted rate. "Call for rates" is a conversion killer — adds a step, signals overpricing, and isn\'t accessible to mobile travelers. Surprise fees at checkout are the #1 abandonment cause.',
    sources: [
      { title: 'CRR Hospitality — Dynamic Pricing Strategies for RV Parks', url: 'https://crrhospitality.com/blog/maximizing-profit-with-dynamic-pricing-strategies-for-rv-parks/' },
      { title: 'OHI — Top 10 Factors Influencing Campground Bookings 2024', url: 'https://ohi.org/ohi-blog/top-10-factors-influencing-campground-bookings-in-2024/' },
      { title: 'Campspot — Design Best Practices for High-Converting Campground Websites', url: 'https://support.campspot.com/design-best-practices-for-a-high-converting-campground-website' },
    ],
  },
  {
    id: 'local-area-content',
    title: 'Local Area Content Strategy',
    insights: [
      { stat: '3x', label: 'Purpose for local content', text: 'Local content serves decision-making (is there enough to do?), SEO capture (high-intent search traffic), and differentiation (the one thing that makes each park unique).' },
    ],
    detail: 'A dedicated "Things to Do Near [Park Name]" page — organized by activity type with distances and drive times — captures high-intent search traffic from travelers who have chosen a destination but not a park. This is the primary way parks sharing the same template can differentiate: the park itself may look identical to competitors, but its geographic context is unique. Seasonal content ("What to do near us in fall") targets off-season booking traffic. Cross-promotion partnerships with local attractions create exclusivity signals.',
    sources: [
      { title: 'Knapsack Creative — Campground SEO Guide 2025', url: 'https://knapsackcreative.com/blog-industry/rv-park-seo-strategies' },
      { title: 'Martrek Digital — Top 5 Digital Marketing Strategies for Campgrounds 2025', url: 'https://www.martrekdigital.com/top-5-digital-marketing-strategies-for-campgrounds-in-2025/' },
      { title: 'Florida RV Park Association — Digital Marketing Strategies', url: 'https://campflorida.org/navigating-the-digital-landscape-online-marketing-strategies-for-rv-parks/' },
    ],
  },
  {
    id: 'older-demographics',
    title: 'Accessibility for Older Demographics',
    insights: [
      { stat: '16px', label: 'Minimum body text size', text: '16px minimum (18px preferred). Never use text below 14px for any functional content.' },
      { stat: '4.5:1', label: 'WCAG AA contrast ratio', text: 'Minimum contrast for normal text. Gray-on-white — pervasive in WordPress templates — commonly fails this.' },
      { stat: '44px', label: 'Min tap/click target', text: 'Older users have reduced motor precision. 44x44px minimum for all interactive elements.' },
    ],
    detail: 'A significant portion of the RV audience is 50+. Key requirements: body text 16px+ with 1.5x line height, 60-80 character line length, no ultra-light font weights, WCAG AA contrast everywhere (especially text over photos which almost always fails without a dark overlay). Interaction design: avoid hover-dependent content (mobile/older users don\'t hover), large form inputs with clear labels, standard menu placement. Cognitive load: fewer choices, predictable layouts, specific error messages. Critically, most accessibility improvements for older users are the same as general conversion optimizations.',
    sources: [
      { title: 'WebAIM — Contrast and Color Accessibility', url: 'https://webaim.org/articles/contrast/' },
      { title: 'WCAG 2.1 — Contrast Minimum (W3C)', url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html' },
      { title: 'Inclusive Web — Accessible Typography Font Guidelines', url: 'https://www.inclusiveweb.co/accessibility-resources/accessible-typography-font-guidelines-for-ui-designers' },
    ],
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getPriorityScore = (f) => f.estimatedEffort === 0 ? 0 : (f.userImpact * f.userImpact) / f.estimatedEffort
const isQuickWin = (f) => getPriorityScore(f) >= 9
const isTemplateWide = (f) => f.scope === 'Template-wide' || f.scope.startsWith('All except')

function findingAffectsSite(finding, siteName) {
  if (finding.scope === 'Template-wide') return true
  if (finding.scope.startsWith('All except')) {
    const excluded = finding.scope.replace('All except ', '')
    return excluded !== siteName
  }
  return finding.scope === siteName
}

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

function FindingRow({ finding, isExpanded, onToggle, onNavigate }) {
  const score = getPriorityScore(finding)
  const scoreColor = getPriorityColor(score)
  const isTemplate = isTemplateWide(finding)

  return (
    <div className={`border-b border-gray-200 ${isTemplate ? 'border-l-4 border-l-blue-400' : ''} ${finding.positive ? 'border-l-4 border-l-green-400' : ''}`}>
      <div
        className="flex items-start md:items-center gap-2 md:gap-4 px-3 md:px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        {/* Priority Score */}
        <div className={`flex-shrink-0 w-12 md:w-16 text-center font-mono text-base md:text-lg font-bold ${finding.positive ? 'text-green-500' : scoreColor}`}>
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
        <div className="flex-shrink-0 hidden md:flex items-center gap-3 text-xs text-gray-500">
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
          <div className="ml-0 md:ml-16 space-y-3">
            {/* Positive finding indicator */}
            {finding.positive && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-sm font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Positive Finding
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

            {/* Research references */}
            {finding.researchRefs && finding.researchRefs.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Supporting Research</h4>
                <div className="flex flex-wrap gap-1.5">
                  {finding.researchRefs.map((refId) => {
                    const topic = RESEARCH_DATA.find((r) => r.id === refId)
                    if (!topic) return null
                    return (
                      <button
                        key={refId}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onNavigate) onNavigate('research', refId)
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {topic.title}
                      </button>
                    )
                  })}
                </div>
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
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Best Current Example</h4>
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
                      className="group block w-full sm:max-w-xs"
                    >
                      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white group-hover:border-blue-300 transition-colors">
                        <img
                          src={ev.src}
                          alt={ev.caption}
                          className="w-full h-40 sm:h-48 object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1 leading-tight group-hover:text-blue-600 transition-colors">{ev.caption}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1 text-xs text-gray-500 pt-2 border-t border-gray-200">
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
    <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        {/* Active site filter chip */}
        {filters.site && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white">
            {filters.site === 'Template' ? 'Template-wide' : filters.site}
            <button
              onClick={() => setFilters((f) => ({ ...f, site: null, scope: 'all' }))}
              className="ml-1 hover:bg-blue-700 rounded-full p-0.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Scope toggle (hidden when site filter is active) */}
        {!filters.site && (
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {['all', 'template', 'site-specific'].map((scope) => (
              <button
                key={scope}
                onClick={() => setFilters((f) => ({ ...f, scope }))}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  filters.scope === scope
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {scope === 'all' ? 'All' : scope === 'template' ? 'Template-wide' : 'Site-specific'}
              </button>
            ))}
          </div>
        )}

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
        <div className="sm:ml-auto text-sm text-gray-500">
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
    if (filters.site === 'Template') {
      results = results.filter(isTemplateWide)
    } else if (filters.site) {
      results = results.filter((f) => findingAffectsSite(f, filters.site))
    } else if (filters.scope === 'template') {
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
        <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200">
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
              onNavigate={onNavigate}
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

function InfoPopover({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="ml-1.5 w-4 h-4 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 inline-flex items-center justify-center text-xs font-bold leading-none transition-colors"
        aria-label="How is this calculated?"
      >
        i
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="fixed left-3 right-3 bottom-4 md:absolute md:left-0 md:top-full md:bottom-auto md:right-auto mt-2 z-30 md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-left">
            {children}
          </div>
        </>
      )}
    </span>
  )
}

function DashboardView({ onNavigate, setFilters }) {
  const templateFindings = FINDINGS.filter(isTemplateWide)
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

  // Per-site metrics — count ALL findings affecting each site (template-wide + all-except + site-specific)
  const siteMetrics = SITES.map((site) => {
    const affectingFindings = FINDINGS.filter((f) => findingAffectsSite(f, site.name) && !f.positive)
    const siteOnlyCount = FINDINGS.filter((f) => f.scope === site.name && !f.positive).length
    const topIssue = affectingFindings.length > 0
      ? affectingFindings.reduce((max, f) => getPriorityScore(f) > getPriorityScore(max) ? f : max, affectingFindings[0])
      : null
    return { ...site, totalCount: affectingFindings.length, siteOnlyCount, topIssue }
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
    <div className="space-y-4 md:space-y-6">
      {/* Top metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Health Score */}
        <div className={`rounded-lg border p-4 md:p-6 ${getHealthBg(healthScore)}`}>
          <div className="text-sm font-medium text-gray-500 mb-1 flex items-center">
            Template Health
            <InfoPopover>
              <p className="text-sm font-semibold text-gray-800 mb-1.5">How Template Health is calculated</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                Measures the overall severity of template-wide issues across all {SITES.length} sites. Only findings scoped to "Template-wide" or "All except..." are included.
              </p>
              <div className="text-xs font-mono bg-gray-50 rounded px-2 py-1.5 text-gray-700 mb-2">
                100 &minus; (total impact / max impact) &times; 100
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><strong>Total impact:</strong> sum of User Impact scores ({currentImpact})</li>
                <li><strong>Max impact:</strong> {templateFindings.length} findings &times; 5 = {maxPossibleImpact}</li>
                <li><strong>Result:</strong> 100 &minus; ({currentImpact}/{maxPossibleImpact}) &times; 100 = <strong>{healthScore}%</strong></li>
              </ul>
            </InfoPopover>
          </div>
          <div className={`text-3xl md:text-4xl font-bold font-mono ${getHealthColor(healthScore)}`}>{healthScore}%</div>
          <div className="text-xs text-gray-500 mt-1">{templateFindings.length} template-wide issues</div>
        </div>

        {/* Total findings */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onNavigate('findings')}
        >
          <div className="text-sm font-medium text-gray-500 mb-1">Total Findings</div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-gray-900">{FINDINGS.length}</div>
          <div className="text-xs text-blue-600 mt-1">View all findings &rarr;</div>
        </div>

        {/* Research callout */}
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 md:p-6 cursor-pointer hover:bg-indigo-100 transition-colors"
          onClick={() => onNavigate('research')}
        >
          <div className="text-sm font-medium text-gray-500 mb-1">Research</div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-indigo-600">{RESEARCH_DATA.length}</div>
          <div className="text-xs text-indigo-600 mt-1">{FINDINGS.filter((f) => f.researchRefs && f.researchRefs.length > 0).length} findings backed by research &rarr;</div>
        </div>

        {/* Quick Wins */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 md:p-6 cursor-pointer hover:bg-green-100 transition-colors"
          onClick={() => {
            setFilters((f) => ({ ...f, quickWins: true }))
            onNavigate('findings')
          }}
        >
          <div className="text-sm font-medium text-gray-500 mb-1">Quick Wins</div>
          <div className="text-3xl md:text-4xl font-bold font-mono text-green-600">{quickWins.length}</div>
          <div className="text-xs text-green-600 mt-1">High impact + low effort &rarr;</div>
        </div>

      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Findings by Category</h3>
        <div className="space-y-3">
          {categoryBreakdown.sort((a, b) => b.count - a.count).map((cat) => (
            <div key={cat.name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <div className="w-full sm:w-48 text-sm text-gray-700 truncate">{cat.name}</div>
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
              <div className="w-full sm:w-20 text-xs text-gray-500">{cat.templateCount} template</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins + Site Cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Quick Wins preview */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-4 md:p-6">
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
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Template card */}
            <button
              onClick={() => {
                setFilters((f) => ({ ...f, site: 'Template', scope: 'all', quickWins: false }))
                onNavigate('findings')
              }}
              className="rounded-lg border-2 p-4 border-blue-200 bg-blue-50 text-left hover:border-blue-400 transition-colors flex flex-col justify-start"
            >
              <div className="font-semibold text-gray-900 text-sm mb-2">Template (All Sites)</div>
              <div className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{templateFindings.length}</span> template-wide {templateFindings.length === 1 ? 'issue' : 'issues'}
                {templateFindings.length > 0 && (
                  <div className="mt-1 text-gray-600 truncate">
                    Top: {[...templateFindings].sort((a, b) => getPriorityScore(b) - getPriorityScore(a))[0].title}
                  </div>
                )}
              </div>
            </button>

            {/* Per-site cards */}
            {siteMetrics.map((site) => (
              <button
                key={site.key}
                onClick={() => {
                  setFilters((f) => ({ ...f, site: site.name, scope: 'all', quickWins: false }))
                  onNavigate('findings')
                }}
                className="rounded-lg border-2 p-4 border-gray-200 bg-white text-left hover:border-blue-400 transition-colors flex flex-col justify-start"
              >
                <div className="mb-2">
                  <div className="font-semibold text-gray-900 text-sm">{site.name}</div>
                  <span className="text-xs text-gray-400">{site.domain}</span>
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{site.totalCount}</span> total {site.totalCount === 1 ? 'issue' : 'issues'}
                  <span className="text-gray-400 ml-1">({site.siteOnlyCount} site-specific)</span>
                  {site.topIssue && (
                    <div className="mt-1 text-gray-600 truncate">Top: {site.topIssue.title}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// RESEARCH VIEW
// ============================================================================

const HERO_STATS = [
  { stat: '60%+', label: 'Bookings on mobile', color: 'text-blue-600' },
  { stat: '78%', label: 'Decide from photos alone', color: 'text-amber-600' },
  { stat: '55%', label: 'Abandon over hidden fees', color: 'text-red-600' },
  { stat: '4x', label: 'Harder to book than 2019', color: 'text-emerald-600' },
]

function ResearchTopicCard({ topic, isExpanded, onToggle }) {
  return (
    <div id={`research-${topic.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900">{topic.title}</h3>
          <div className="flex flex-wrap gap-3 mt-2">
            {topic.insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-blue-600">{insight.stat}</span>
                <span className="text-xs text-gray-500">{insight.label}</span>
              </div>
            ))}
          </div>
        </div>
        <svg className={`w-5 h-5 text-gray-400 mt-1 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {/* All stat callouts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4">
            {topic.insights.map((insight, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{insight.stat}</div>
                <div className="text-xs text-gray-500 mt-0.5">{insight.label}</div>
              </div>
            ))}
          </div>

          {/* Key insights list */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Insights</h4>
            <ul className="space-y-2">
              {topic.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {insight.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Detail paragraph */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Summary</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{topic.detail}</p>
          </div>

          {/* Related findings */}
          {(() => {
            const related = FINDINGS.filter((f) => f.researchRefs && f.researchRefs.includes(topic.id))
            if (related.length === 0) return null
            return (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Related Findings</h4>
                <div className="flex flex-wrap gap-1.5">
                  {related.map((f) => (
                    <span key={f.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      #{f.id} {f.title.length > 50 ? f.title.slice(0, 50) + '...' : f.title}
                    </span>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Sources */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sources</h4>
            <ul className="space-y-1">
              {topic.sources.map((source, i) => (
                <li key={i}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    {source.title}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function ResearchView({ scrollToTopic }) {
  const [expandedTopics, setExpandedTopics] = useState(() => {
    if (scrollToTopic) return new Set([scrollToTopic])
    return new Set()
  })

  // Scroll to topic when navigated from a finding
  const scrolledRef = { current: false }
  if (scrollToTopic && !scrolledRef.current) {
    scrolledRef.current = true
    setTimeout(() => {
      const el = document.getElementById(`research-${scrollToTopic}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setExpandedTopics((prev) => new Set([...prev, scrollToTopic]))
      }
    }, 100)
  }

  function toggleTopic(id) {
    setExpandedTopics((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const linkedFindings = FINDINGS.filter((f) => f.researchRefs && f.researchRefs.length > 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Conversion Research</h2>
        <p className="text-sm text-gray-500 mt-1">
          Industry research on RV park visitor behavior, booking patterns, and UX best practices.
          {' '}{linkedFindings.length} findings reference this research.
        </p>
      </div>

      {/* Hero stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {HERO_STATS.map((s, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className={`text-3xl font-bold ${s.color}`}>{s.stat}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Expand/Collapse all */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => {
            if (expandedTopics.size === RESEARCH_DATA.length) {
              setExpandedTopics(new Set())
            } else {
              setExpandedTopics(new Set(RESEARCH_DATA.map((t) => t.id)))
            }
          }}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {expandedTopics.size === RESEARCH_DATA.length ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Topic cards */}
      <div className="space-y-3">
        {RESEARCH_DATA.map((topic) => (
          <ResearchTopicCard
            key={topic.id}
            topic={topic}
            isExpanded={expandedTopics.has(topic.id)}
            onToggle={() => toggleTopic(topic.id)}
          />
        ))}
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
  { key: 'research', label: 'Research' },
]

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [researchScrollTarget, setResearchScrollTarget] = useState(null)
  const [filters, setFilters] = useState({
    scope: 'all',
    category: null,
    status: null,
    quickWins: false,
    site: null,
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'priorityScore',
    direction: 'desc',
  })

  function handleNavigate(view, scrollToTopic) {
    setActiveView(view)
    if (view === 'research' && scrollToTopic) {
      setResearchScrollTarget(scrollToTopic)
    } else {
      setResearchScrollTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <h1 className="text-base md:text-lg font-bold text-gray-900">RV Park UX Audit</h1>
            <span className="hidden sm:inline text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">5 sites &middot; {FINDINGS.length} findings</span>
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
      <main className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
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
        {activeView === 'research' && (
          <ResearchView scrollToTopic={researchScrollTarget} />
        )}
      </main>
    </div>
  )
}
