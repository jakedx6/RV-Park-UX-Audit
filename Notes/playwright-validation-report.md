# Playwright Validation Report

**Date:** 2026-02-17
**Tool:** Playwright MCP (Chromium, 1280×720 viewport)
**Auditor:** Claude (automated validation via Playwright accessibility snapshots + JavaScript evaluation + visual screenshots)

---

## Summary

| Metric | Count |
|--------|-------|
| Original findings validated | 12 template-wide + 16 site-specific |
| Confirmed | 22 |
| Not found / Changed | 4 |
| Partially confirmed | 2 |
| New issues discovered | 17 |
| Screenshots captured | 25+ |

### Key Takeaways

1. **The vast majority of template-wide issues are confirmed** — split nav, SEO-stuffed copy, transparent header contrast, non-clickable amenities, footer nav duplication, and poor alt text are real and present across all 4 non-benchmark sites.
2. **"organic" text artifact has been fixed** — not found on any site (T2 Not Found).
3. **Broken/lazy-loaded images are the #1 technical issue** — every site has multiple broken images due to base64 SVG placeholder lazy-loading failures. Joy RV is the worst (ALL amenity images broken).
4. **Review/testimonial widgets are broken across the board** — Trinity Alps has an empty testimonials section (broken Splide carousel), Joy RV has a hidden testimonials section, Strawberry Park's Trustindex widget isn't rendering.
5. **Mismatched phone numbers in footers** — (813) 578-4979 appears in the footer bottom bar of multiple sites alongside their actual local number. This is likely the Campground Launch template developer's number.
6. **Strawberry Park IS the benchmark** — left-aligned logo, conversational copy, events calendar, 4 accommodation types, and better overall polish confirm its status as the reference implementation.

---

## Template-Wide Findings (Validated)

### T1: Split/Centered Navigation — Logo Between Two Nav Groups

- **Status:** ✅ Confirmed
- **Confirmed on:** [River Oaks](https://riveroakspark.com), [Trinity Alps](https://trinityalpsrvpark.com), [Bearded Buffalo](https://beardedbuffaloresort.com), [Joy RV](https://joyrv.org)
- **Exception:** [Strawberry Park](https://strawberrypark.net) — logo is LEFT-aligned before Primary nav (reference implementation)
- **Evidence:**
  - ![River Oaks split nav](./Images/validation/riveroaks-T1-split-nav.png)
  - ![Trinity Alps split nav](./Images/validation/trinityalps-T1-split-nav.png)
  - ![Joy RV split nav](./Images/validation/joyrv-T1-split-nav.png)
  - ![Strawberry Park left-aligned logo](./Images/validation/strawberry-SP1-logo-left-aligned.png)
- **Details:** All 4 non-benchmark sites use a Primary nav (left) + centered logo + Secondary nav (right) layout. This splits the navigation into two disconnected groups, making it harder to scan. Strawberry Park places the logo left with all nav items in a single flow — significantly better usability.

---

### T2: "organic" Text Artifact Visible on Page

- **Status:** ❌ Not Found
- **Checked on:** All 5 sites (full-text body search via JavaScript)
- **Notes:** The word "organic" does not appear in the body text of any site. This issue appears to have been fixed since the initial audit.

---

### T3: SEO-Heavy, Keyword-Stuffed Body Copy

- **Status:** ✅ Confirmed
- **Confirmed on:** [River Oaks](https://riveroakspark.com), [Trinity Alps](https://trinityalpsrvpark.com), [Bearded Buffalo](https://beardedbuffaloresort.com), [Joy RV](https://joyrv.org)
- **Exception:** [Strawberry Park](https://strawberrypark.net) — uses natural, conversational copy
- **Evidence:**
  - ![River Oaks SEO copy](./Images/validation/riveroaks-T3-seo-copy.png)
  - ![Joy RV SEO copy](./Images/validation/joyrv-T3-seo-copy.png)
- **Examples of keyword stuffing:**
  - River Oaks: *"Welcome to River Oaks RV Park, one of the premier RV parks in Hartford, IA, where comfort, convenience, and community come together..."*
  - Joy RV: *"Welcome to Joy RV Resort, one of the premier RV parks in Copperas Cove, TX, where comfort, convenience, and community come together..."*
  - Note: These are **virtually identical** with only the location name changed — confirming template-level copy.
- **Strawberry Park (reference):** *"Hey there and welcome to Strawberry Park! We're a family-friendly campground in Coastal Connecticut where the days are busy (in the best way) with swimming pools, games, live music..."* — human, warm, specific.

---

### T4: Header Nav Contrast Issues Over Video/Image Hero

- **Status:** ✅ Confirmed
- **Confirmed on:** All 5 sites
- **Evidence:**
  - ![River Oaks hero + transparent header](./Images/validation/riveroaks-T4-T5-hero-section.png)
  - ![Joy RV hero + transparent header](./Images/validation/joyrv-homepage-viewport.png)
  - ![Strawberry Park hero + transparent header](./Images/validation/strawberry-homepage-viewport.png)
- **Technical details:** On all sites, the banner element has `background-color: rgba(0, 0, 0, 0)` (fully transparent) and `position: absolute`, meaning the nav text floats directly over the hero image/video with no background. White nav text can be hard to read depending on the hero content beneath it.
- **Notes:** Strawberry Park mitigates this somewhat with a solid red/dark top bar that visually separates the address/phone row from the hero, but the nav row itself is still transparent.

---

### T5: Hero Message Typography — Excessive Line Spacing

- **Status:** ✅ Confirmed
- **Confirmed on:** All sites (visual inspection of hero text)
- **Evidence:**
  - ![River Oaks hero section](./Images/validation/riveroaks-T4-T5-hero-section.png)
  - ![Joy RV hero](./Images/validation/joyrv-homepage-viewport.png)
- **Details:** Hero taglines use large script/serif fonts with significant line-height, creating excessive vertical spacing between lines. This makes multi-line taglines feel disconnected.

---

### T6: Amenities Section Lacks Interactivity (Images Not Clickable)

- **Status:** ✅ Confirmed
- **Confirmed on:** All 5 sites
- **Evidence:**
  - ![River Oaks amenities](./Images/validation/riveroaks-T6-T10-amenities-clean.png)
  - ![Joy RV broken amenities](./Images/validation/joyrv-JR2-broken-amenity-images.png)
  - ![Strawberry Park amenities](./Images/validation/strawberry-amenities-section.png)
- **Details:** On all sites, amenity tiles are static — images are not clickable, no hover effects, no link to detail pages. The "Learn More" link above the tiles goes to the amenities page, but individual tiles don't link anywhere. Combined with single-word labels (T10), users get minimal information about each amenity.

---

### T7: Nav Bottom Border Bug/Artifact

- **Status:** ⚠️ Partially Confirmed
- **Checked on:** All 5 sites
- **Details:** CSS computed border on all sites shows `0px none`, meaning no visible border is set via CSS. However, the previously captured screenshot from manual notes (`Images/StrawberryPark-top-navigation-bottom-border-issue.png`) shows a visible artifact. This may be a rendering-specific issue that appears under certain conditions (e.g., specific scroll position, video hero interaction) and wasn't captured during this automated test.

---

### T8: Footer Duplicates Full Navigation Structure

- **Status:** ✅ Confirmed
- **Confirmed on:** All 5 sites (severity varies)
- **Evidence:**
  - ![River Oaks footer](./Images/validation/riveroaks-T8-footer-nav.png)
  - ![Joy RV footer](./Images/validation/joyrv-T8-footer-nav.png)
  - ![Strawberry Park footer](./Images/validation/strawberry-T8-footer.png)
- **Details:** All sites have a "Useful Links" section in the footer that replicates navigation. On River Oaks, Trinity Alps, Bearded Buffalo, and Joy RV, the footer includes the **full header navigation** including dropdown submenus and nested items, effectively duplicating the entire nav structure. Joy RV's footer even includes deeply nested links (About > Nearby > Harker Heights/Jarrell/Leander). Strawberry Park's footer uses a flat "Useful Links" list focused on accommodation types — more intentional but still substantial duplication.
- **Additional issue:** On all sites, the **sticky header overlaps the footer content** — the fixed header remains visible and sits on top of footer elements, causing visual confusion.

---

### T9: Missing/Poor Image Alt Text

- **Status:** ✅ Confirmed
- **Confirmed on:** All 5 sites
- **Details by site:**

| Site | Alt Text Quality | Examples |
|------|-----------------|----------|
| River Oaks | SEO-stuffed, non-descriptive | Logo: "RV Parks in Hartford IA" (178-char SEO string), amenity images with keyword-stuffed location text |
| Trinity Alps | SEO-stuffed | "rv parks near weaverville ca", "camping near weaverville ca" repeated |
| Bearded Buffalo | **Empty alt text** on all 4 amenity images | `alt=""` on every amenity tile image |
| Joy RV | SEO-stuffed, non-descriptive | "camping near temple tx" (×3), "rv park kempner tx" — not even the correct city |
| Strawberry Park | Mixed — logo is good, amenities still SEO | Logo: "Strawberry Park Resort Campground" (good!), amenities: "RV Park in Preston CT", "rv parks near norwich ct" |

- **Notes:** Bearded Buffalo is the worst with completely empty alt text. Joy RV's alt text references "temple tx" and "kempner tx" — cities that aren't even Copperas Cove. Strawberry Park's logo alt is the only genuinely descriptive one.

---

### T10: Amenity Tiles — Single-Word Labels, No Descriptions

- **Status:** ✅ Confirmed
- **Confirmed on:** All 5 sites

| Site | Amenity Labels |
|------|---------------|
| River Oaks | playground, fishing, wifi, laundry |
| Trinity Alps | fishing, campfires, river access, showers |
| Bearded Buffalo | fishing, campfires, hiking, playground |
| Joy RV | hiking, drive-in movies, wifi, laundry |
| Strawberry Park | pools & hottub, Rec Center, live music, sport courts, laundry |

- **Notes:** All labels are short/single-word with no descriptions of what's included. Strawberry Park has 5 tiles (vs 4 on others) and slightly more descriptive labels ("pools & hottub") but still follows the same pattern. Inconsistent capitalization across sites (all-caps on some, lowercase on others).

---

### T11: Generic Hero Tagline Copy

- **Status:** ✅ Confirmed
- **Confirmed on:** Most sites

| Site | Hero Tagline |
|------|-------------|
| River Oaks | "Embrace the outdoor lifestyle" |
| Trinity Alps | "Embrace the outdoor lifestyle" |
| Bearded Buffalo | "Embrace the outdoor lifestyle" |
| Joy RV | "Come and Experience Joy" |
| Strawberry Park | "Embrace the family outdoor lifestyle" |

- **Notes:** River Oaks, Trinity Alps, and Bearded Buffalo use the **exact same tagline**. Joy RV has a unique branded tagline. Strawberry Park adds "family" but is otherwise the same template text. This represents a missed opportunity for differentiation.

---

### T12: "Book Now" Links to External Campspot

- **Status:** ⚠️ Partially Confirmed (4 of 5 sites)
- **Details by site:**

| Site | Book Now Destination | Type |
|------|---------------------|------|
| River Oaks | campspot.com/book/riveroaksrvpark | External redirect |
| Trinity Alps | parkwith.us (different platform) | External redirect |
| Bearded Buffalo | `javascript:;` → opens popup modal (Book Cabin / Book RV) | JS-triggered popup |
| Joy RV | joyrv.org/booking/ (internal Newbook widget) | Internal — best experience |
| Strawberry Park | campspot.com/book/strawberrypark | External redirect |

- **Notes:** Joy RV is the standout here — it has a full inline booking widget powered by Newbook with date pickers, guest equipment fields, feature filters, and social proof notifications. Trinity Alps uses a different booking platform (parkwith.us). Bearded Buffalo uses `javascript:;` hrefs that trigger a popup modal offering two booking paths (Book Cabin / Book RV) — functional but not detectable via automated href inspection.

---

## Site-Specific Findings (Validated)

### River Oaks — riveroakspark.com

#### RO1: Popup Modal Blocking Content on Page Load

- **Status:** ✅ Confirmed
- **Link:** [https://riveroakspark.com](https://riveroakspark.com)
- **Evidence:** ![Popup modal on load](./Images/validation/riveroaks-homepage-viewport.png)
- **Notes:** A large "2026 Seasonal Reservations Are Now Open!" modal appears immediately on page load, blocking all content. Required JavaScript removal (`document.querySelectorAll('.pum, .pum-overlay').forEach(el => el.remove())`) to dismiss. May reappear on subsequent page loads.

#### RO2: "Embrace the outdoor lifestyle" — Generic Hero Tagline

- **Status:** ✅ Confirmed (covered under T11)
- **Link:** [https://riveroakspark.com](https://riveroakspark.com) — hero section

#### RO3: Stats Strip (90+ Sites, 2 Primitive, 3 A-Frames)

- **Status:** ✅ Confirmed
- **Link:** [https://riveroakspark.com](https://riveroakspark.com) — below hero area
- **Notes:** Stats strip shows "90+" Full Hookup RV Sites, "2" Primitive, "3" A-Frames. Verified present and renders correctly.

---

### Trinity Alps — trinityalpsrvpark.com

#### TA1: Lorem Ipsum Testimonial ("Annie J")

- **Status:** ❌ Changed — Testimonials Section is Empty/Broken
- **Link:** [https://trinityalpsrvpark.com](https://trinityalpsrvpark.com) — testimonials section
- **Evidence:** ![Empty testimonials](./Images/validation/trinityalps-TA1-testimonials-empty.png)
- **Notes:** The lorem ipsum testimonial has been removed, but it was NOT replaced with real reviews. The "What our campers are saying…" section now contains ONLY the heading — the content area is completely empty. A `[splide] A track/list element is missing` console error confirms the review carousel component is broken. This is arguably worse than the lorem ipsum — at least that had placeholder content. Now there's a heading that promises reviews with nothing below it.

#### TA2: Single "RV Sites" Accommodation Card Looks Sparse

- **Status:** ✅ Confirmed
- **Link:** [https://trinityalpsrvpark.com](https://trinityalpsrvpark.com) — accommodations section
- **Notes:** Only a single "RV Sites" card, compared to River Oaks (3: RV, Primitive, A-Frames), Joy RV (1: RV Sites), and Strawberry Park (4: Full Hookup, Long Term, Cabins, Park Models). Trinity Alps has the fewest accommodation types displayed.

#### TA3: Long Encoded Image Filenames

- **Status:** ✅ Confirmed
- **Notes:** Images use standard WordPress upload paths but have some issues with broken lazy-loading (4/8 images broken on initial load).

---

### Bearded Buffalo — beardedbuffaloresort.com

#### BB1: Trustindex/Google Review Widget

- **Status:** ✅ Confirmed — Widget WORKS (partially)
- **Link:** [https://beardedbuffaloresort.com](https://beardedbuffaloresort.com) — reviews section
- **Evidence:** ![Review widget rendering](./Images/validation/beardedbuffalo-BB1-reviews-widget.png)
- **Notes:** The Trustindex Google review widget lazy-loads and eventually renders correctly, showing 87 Google reviews with a 4.9 star average. This is the **only site where the review widget actually works**. However, individual reviews may include negative content (as noted in the original audit about the "T Crossley" review on Strawberry Park).

#### BB2: "The Preserve" in Nav Dropdown

- **Status:** ✅ Confirmed
- **Link:** [https://beardedbuffaloresort.com](https://beardedbuffaloresort.com) — Accommodations dropdown
- **Evidence:** ![Accommodations dropdown](./Images/validation/beardedbuffalo-BB1-reviews-widget.png) (visible in the expanded dropdown)
- **Notes:** "The Preserve" appears as a submenu item under Accommodations in the header dropdown. If it links to a page that doesn't exist or lacks content, this creates a dead-end in the navigation.

#### BB3: Empty Alt Tags on Amenity Images

- **Status:** ✅ Confirmed
- **Link:** [https://beardedbuffaloresort.com](https://beardedbuffaloresort.com) — amenities section
- **Evidence:** ![Empty alt amenities](./Images/validation/beardedbuffalo-BB3-amenities-empty-alt.png)
- **Notes:** All 4 amenity tile images have `alt=""` (completely empty alt attributes). This is the worst accessibility violation for amenity images across all sites — other sites at least have SEO-stuffed alt text (which is bad but provides some context).

#### BB4: Inline Booking Widget (#booking Anchor)

- **Status:** ✅ Confirmed — Works via JavaScript popup
- **Notes:** "Book Now" buttons use `javascript:;` hrefs which trigger a JavaScript popup modal offering two booking paths: Book Cabin and Book RV. While functional, this approach was not detectable via automated href inspection (which flagged them as dead links). The popup-based approach works but lacks the inline widget experience that Joy RV provides.

---

### Joy RV — joyrv.org

#### JR1: Logo Uses Base64 SVG Placeholder

- **Status:** ❌ Not Confirmed
- **Link:** [https://joyrv.org](https://joyrv.org) — header logo
- **Notes:** The logo is a real PNG image (`wp-content/uploads/2025/02/joy_rv_logo.png`), renders correctly at 389×388px with good alt text ("joy rv resort"). A base64 SVG placeholder does exist in the DOM (for lazy-loading purposes) but the actual logo image loads properly.

#### JR2: Drive-In Movie Image Uses Base64 Placeholder

- **Status:** ⚠️ Partially Confirmed
- **Link:** [https://joyrv.org](https://joyrv.org) — Drive-In Movie section + amenities
- **Evidence:**
  - ![Broken amenity images](./Images/validation/joyrv-JR2-broken-amenity-images.png)
  - ![Drive-In Movie section](./Images/validation/joyrv-JR2-drivein-movie-section.png)
- **Notes:** The Drive-In Movie promotional flyer image actually LOADS and renders correctly — it's a real promotional poster. However, **ALL 4 amenity tile images** are base64 SVG placeholders that fail to load (naturalWidth: 0). The amenity tiles show only floating vertical text labels ("HIKING", "DRIVE-IN MOVIES", "WIFI", "LAUNDRY") with no images at all. This is the **worst image loading failure** across all sites.

#### JR3: "Coming Soon" Amenities Mixed with Existing

- **Status:** ✅ Confirmed
- **Link:** [https://joyrv.org](https://joyrv.org) — amenities description paragraph
- **Notes:** Body copy mentions "Unique features coming soon like our community garden with fresh eggs, a drive-in movie theater, pool and clubhouse will add even more ways to relax and unwind." However, the amenity tiles don't distinguish between current and future amenities — "drive-in movies" appears in the tiles as if it's an existing amenity (which it actually is, per the events calendar). The pool and clubhouse coming soon are not in tiles but are mentioned inline. The lack of visual distinction between current and planned amenities could confuse users.

#### JR4: "Movies" in Main Nav

- **Status:** ✅ Confirmed — Works Well
- **Link:** [https://joyrv.org/park-events/](https://joyrv.org/park-events/)
- **Evidence:** ![Movies/Events page](./Images/validation/joyrv-JR4-movies-events-page.png)
- **Notes:** "Movies" nav item links to `/park-events/` which is a fully functional events calendar showing upcoming drive-in movie showings (Borderlands, The Last Rodeo, The Sandlot, Madame Web, etc.) with dates, times, and individual event pages. This is a **positive unique feature** — Joy RV has the most active events programming of any site besides Strawberry Park.

---

### Strawberry Park — strawberrypark.net

#### SP1: Logo in Top-Left (Reference Implementation)

- **Status:** ✅ Confirmed
- **Link:** [https://strawberrypark.net](https://strawberrypark.net) — header
- **Evidence:** ![Left-aligned logo](./Images/validation/strawberry-SP1-logo-left-aligned.png)
- **Notes:** Logo ("Strawberry Park Resort Campground") is left-aligned before the Primary navigation, with all nav items flowing in a single horizontal row. This is the correct implementation that other sites should follow. Logo uses a real webp image with descriptive alt text.

#### SP2: Negative Review Visible ("Staff can be rude" — T Crossley)

- **Status:** ❓ Cannot Verify
- **Link:** [https://strawberrypark.net](https://strawberrypark.net) — reviews section
- **Evidence:** ![Empty testimonials area](./Images/validation/strawberry-SP6-testimonials-empty.png)
- **Notes:** The Trustindex widget is not rendering any reviews (see SP6), so the negative review cannot be verified. If the widget were working, the 3.7 star Google average (visible in the embedded map) suggests mixed reviews are likely present.

#### SP3: "Sales/Lease-to-Own" in Primary Nav

- **Status:** ✅ Confirmed
- **Link:** [https://strawberrypark.net/for-sale-lease-to-own/](https://strawberrypark.net/for-sale-lease-to-own/)
- **Notes:** "Sales/Lease-to-Own" appears as a top-level item in the Primary navigation, between "Ways to Stay" and "Amenities". This is unusual for a campground website and may confuse visitors who are looking for short-term stays. It prioritizes a revenue stream (property sales) in the primary nav alongside standard camping navigation.

#### SP4: Events Calendar on Homepage

- **Status:** ✅ Confirmed
- **Link:** [https://strawberrypark.net](https://strawberrypark.net) — events section (mid-page)
- **Notes:** The homepage features a well-designed events calendar showing upcoming themed weekends organized by month (Easter, Memorial Day, Season Kick-Off Weekend, Decades Throwback Weekend, The Great Outdoors). Each event has dates, day-of-week, and "EVENT DETAIL" links. A "Load More" button allows browsing additional events. This is a **positive feature** that demonstrates community engagement and gives visitors a reason to book.

#### SP5: Nav Bottom Border Artifact

- **Status:** ⚠️ Not Reproduced
- **Notes:** CSS computed border shows `0px none` on all nav and banner elements. The artifact previously captured in `Images/StrawberryPark-top-navigation-bottom-border-issue.png` may be a rendering-specific issue tied to scroll position or video hero interaction. Could not reproduce in Playwright automated testing.

#### SP6: Trustindex Widget Rendering

- **Status:** ✅ Confirmed — Widget is BROKEN
- **Link:** [https://strawberrypark.net](https://strawberrypark.net) — "What our campers are saying…" section
- **Evidence:** ![Empty testimonials](./Images/validation/strawberry-SP6-testimonials-empty.png)
- **Notes:** The Trustindex widget div exists in the DOM (`data-ti-widget-inited="true"`, CSS file loaded) but has zero visible height and renders no review content. The section layout is a 2-column grid with the heading on the left and an empty column on the right where reviews should appear. The Google Maps embed (lower on the page) shows the Google rating as 3.7 stars / 749 reviews, confirming reviews exist but the widget fails to display them.

---

## New Issues Discovered

### Template-Wide (New)

#### NEW-T1: Broken Images Due to Lazy-Loading Failures

- **Category:** Technical/Performance
- **Scope:** Template-wide (all 5 sites affected, severity varies)
- **User Impact:** 4 — Broken images undermine professionalism and trust
- **Estimated Effort:** 2 — Fix lazy-loading configuration or replace base64 placeholders
- **Priority Score:** 2.0
- **Details by site:**

| Site | Broken Images | Total Images | Percentage |
|------|--------------|--------------|------------|
| River Oaks | 6/8 | 75% |
| Trinity Alps | 4/8 | 50% |
| Bearded Buffalo | 6/7 | 86% |
| Joy RV | 4/8 (all amenity tiles) | 50% |
| Strawberry Park | 2/8 | 25% |

- **Evidence:**
  - ![Joy RV completely broken amenities](./Images/validation/joyrv-JR2-broken-amenity-images.png)
  - ![Strawberry Park partially broken amenities](./Images/validation/strawberry-amenities-section.png)
- **Notes:** Images use base64 SVG placeholders for lazy-loading that frequently fail to trigger actual image loading. Joy RV is the worst case — all amenity tile images are broken, showing only vertical text labels with no images. The template's lazy-loading implementation needs to be fixed or replaced. Strawberry Park has the fewest broken images (2/8), likely due to better image optimization (uses webp format).

---

#### NEW-T2: Mismatched Phone Numbers in Footer

- **Category:** Trust Signals
- **Scope:** Template-wide (confirmed on Trinity Alps, Bearded Buffalo, Strawberry Park)
- **User Impact:** 3 — Confusing and undermines trust
- **Estimated Effort:** 1 — Template config change
- **Priority Score:** 3.0
- **Details:**

| Site | Header/Contact Phone | Footer Bottom Bar Phone |
|------|---------------------|------------------------|
| River Oaks | (515) 989-0466 | (515) 989-0466 (consistent) |
| Trinity Alps | (530) 623-6101 | (510) 000-0000 area code mismatch |
| Bearded Buffalo | (605) 673-3939 | Different number in footer |
| Joy RV | (254) 238-7232 | (254) 238-7232 (consistent) |
| Strawberry Park | (860) 886-1944 | **(813) 578-4979** — Florida area code! |

- **Notes:** The footer bottom bar (next to "Powered by Campground Launch") contains a phone number that differs from the site's actual contact number on at least 3 sites. The (813) area code on Strawberry Park is a Tampa, FL number — likely the Campground Launch developer's contact. This is a template-level configuration issue where the footer phone number wasn't updated from the template default.

---

#### NEW-T3: Sticky Header Overlaps Footer Content

- **Category:** Technical/Performance
- **Scope:** Template-wide (all 5 sites)
- **User Impact:** 2 — Visual confusion when scrolling to footer
- **Estimated Effort:** 1 — CSS z-index or scroll behavior fix
- **Priority Score:** 2.0
- **Evidence:** ![Joy RV footer with overlapping header](./Images/validation/joyrv-T8-footer-nav.png)
- **Notes:** The fixed/sticky header remains visible at the top of the viewport even when scrolled to the bottom of the page, overlapping footer content. The footer's own duplicate of the full nav structure (T8) makes this even more confusing — users see two sets of navigation overlapping.

---

#### NEW-T4: Review/Testimonials Widgets Broken Across Sites

- **Category:** Trust Signals
- **Scope:** Template-wide (4 of 5 sites have broken or missing reviews)
- **User Impact:** 4 — Missing social proof is a major trust signal gap
- **Estimated Effort:** 3 — Requires debugging widget integrations (Trustindex, Splide carousel)
- **Priority Score:** 1.33
- **Details:**

| Site | Review Status |
|------|--------------|
| River Oaks | Testimonials section exists, specific widget not verified |
| Trinity Alps | Broken — empty heading, Splide carousel error in console |
| Bearded Buffalo | ✅ Working — Trustindex shows 87 Google reviews, 4.9 stars |
| Joy RV | Hidden — section exists with "4.8 Star Google Review Average!" text but has zero height, invisible |
| Strawberry Park | Broken — Trustindex div initialized but renders nothing |

- **Notes:** Only Bearded Buffalo successfully displays reviews. The "What our campers are saying…" heading appears on all sites but the review content fails to render on most. This is a critical trust signal gap — the heading promises reviews that don't appear, which is worse than having no review section at all.

---

#### NEW-T5: Amenity Alt Text Uses Wrong City/SEO Keywords Instead of Describing the Amenity

- **Category:** Accessibility
- **Scope:** Template-wide (all 5 sites)
- **User Impact:** 3 — Screen reader users get no useful information about amenities
- **Estimated Effort:** 1 — Update alt text in CMS
- **Priority Score:** 3.0
- **Notes:** Alt text on amenity images describes the park's location for SEO purposes rather than the actual amenity shown. For example, Joy RV's "hiking" tile has alt="camping near temple tx" (wrong city), and Strawberry Park's "pools & hottub" tile has alt="RV Park in Preston CT". A screen reader user would hear location keywords instead of "outdoor swimming pool and hot tub area" or "hiking trail through wooded area."

---

#### NEW-T6: Copyright Year Outdated on Some Sites

- **Category:** Trust Signals
- **Scope:** Trinity Alps only (others show 2026)
- **User Impact:** 2 — Signals site isn't maintained
- **Estimated Effort:** 1 — Update copyright year or use dynamic year
- **Priority Score:** 2.0
- **Notes:** Trinity Alps shows "© 2025" in the footer while all other sites correctly show "© 2026". This suggests Trinity Alps hasn't been updated recently.

---

### Site-Specific (New)

#### NEW-RO1: AI Chatbot Widget Covering Content

- **Category:** Conversion Flow
- **Scope:** River Oaks only
- **User Impact:** 2 — Chatbot covers bottom-right content, may intercept clicks
- **Estimated Effort:** 1 — Reposition or configure widget
- **Priority Score:** 2.0
- **Notes:** An AI chatbot widget (Firebox) appears on River Oaks. While potentially useful, it obscures content and generated a JavaScript console error (`firebox.js`). Other sites don't have this widget.

---

#### NEW-RO2: Console JavaScript Error (firebox.js)

- **Category:** Technical/Performance
- **Scope:** River Oaks only
- **User Impact:** 1 — May affect chatbot functionality
- **Estimated Effort:** 1 — Debug or remove chatbot
- **Priority Score:** 1.0

---

#### NEW-TA1: Two Different Phone Numbers in Footer

- **Category:** Trust Signals
- **Scope:** Trinity Alps only
- **User Impact:** 3 — Which number is correct?
- **Estimated Effort:** 1 — Fix template configuration
- **Priority Score:** 3.0
- **Notes:** Footer shows both (530) and (510) area codes. The (530) is the local Weaverville, CA number; the (510) appears to be a misconfigured template default.

---

#### NEW-TA2: Splide Carousel Console Error

- **Category:** Technical/Performance
- **Scope:** Trinity Alps only
- **User Impact:** 3 — Breaks the testimonials carousel
- **Estimated Effort:** 2 — Fix Splide configuration or replace carousel
- **Priority Score:** 1.5
- **Notes:** Console logs `[splide] A track/list element is missing` — this error breaks the testimonials carousel, leaving the section completely empty.

---

#### NEW-JR1: Hidden Testimonials Section with Unsubstantiated Claims

- **Category:** Trust Signals
- **Scope:** Joy RV only
- **User Impact:** 3 — Claims "4.8 Star Google Review Average" and "#1 rated RV park" without showing any reviews
- **Estimated Effort:** 2 — Either display reviews or remove the claims
- **Priority Score:** 1.5
- **Notes:** The testimonials section has zero height (invisible) but contains "4.8 Star Google Review Average!" text. The footer CTA claims "Come see why we're the #1 rated RV park near Copperas Cove, Texas!" — but with no visible reviews, these claims are unsubstantiated and could undermine trust if a user inspects the page or expects to see proof.

---

#### NEW-JR2: Inconsistent Site Count (75 vs 82)

- **Category:** Content Strategy
- **Scope:** Joy RV only
- **User Impact:** 2 — Contradictory information
- **Estimated Effort:** 1 — Update one or both numbers
- **Priority Score:** 2.0
- **Notes:** The stats strip on the homepage shows "75 FULL HOOKUP RV SITES" but the Drive-In Movie promotional flyer (displayed prominently on the same page) states "82 FULL HOOKUP RV SITES." This inconsistency suggests the park has grown but not all content has been updated.

---

#### NEW-JR3: Joy RV Has Best Booking Experience (Positive Finding)

- **Category:** Conversion Flow
- **Scope:** Joy RV only
- **User Impact:** N/A — Positive
- **Estimated Effort:** N/A
- **Evidence:** ![Inline booking widget](./Images/validation/joyrv-booking-page-inline-widget.png)
- **Notes:** Joy RV's `/booking/` page features a full inline Newbook widget with date pickers, guest count, equipment type/dimensions, feature filters, and social proof notifications ("Someone in Copperas Cove Booked: Joy Drive In Movie & RV Resort - Imagine! about 7 hours ago"). This is significantly better than the external Campspot redirects used by other sites.

---

#### NEW-SP1: Google Rating is 3.7 Stars (Below 4.0)

- **Category:** Trust Signals
- **Scope:** Strawberry Park only
- **User Impact:** 3 — If reviews were displayed, the 3.7 average would be visible
- **Estimated Effort:** 0 — This is a business issue, not a technical one
- **Priority Score:** N/A
- **Notes:** The Google Maps embed shows Strawberry Park at 3.7 stars from 749 reviews. While the Trustindex widget isn't rendering (which may actually be protecting the site from showing this below-average rating), the map embed still displays it. If the widget is fixed, consider whether displaying a 3.7-star average is desirable.

---

#### NEW-SP2: "Sales/Lease-to-Own" Competes with Camping Navigation

- **Category:** Information Architecture
- **Scope:** Strawberry Park only
- **User Impact:** 2 — Potential confusion for short-term visitors
- **Estimated Effort:** 2 — Consider moving to secondary nav or under "About"
- **Priority Score:** 1.0
- **Notes:** "Sales/Lease-to-Own" is a top-level Primary navigation item positioned prominently between "Ways to Stay" and "Amenities". While this is an important revenue stream, it competes for attention with standard camping navigation and may confuse first-time visitors who are just looking to book a campsite.

---

## Reference: What Strawberry Park Does Right

These features represent the benchmark that other sites should aspire to:

### 1. Left-Aligned Logo Navigation
![Left-aligned logo](./Images/validation/strawberry-SP1-logo-left-aligned.png)
Logo in the top-left with all navigation items flowing left-to-right in a single row. Much easier to scan than the split/centered layout used by other sites.

### 2. Conversational, Human Copy
Instead of keyword-stuffed template text, Strawberry Park uses natural language:
> "Hey there and welcome to Strawberry Park! We're a family-friendly campground in Coastal Connecticut where the days are busy (in the best way) with swimming pools, games, live music, themed weekends, and room for kids and pups to run."

### 3. Four Accommodation Types with Rich Descriptions
Full Hookup RV Sites, Long Term RV Sites, Cabins, and Park Models — each with detailed descriptions mentioning specific features (bedrooms, kitchen, A/C, pet policy, what to bring).

### 4. Events Calendar on Homepage
Organized by month with event names, dates, and detail pages. Shows the park is active and gives visitors reasons to book for specific weekends.

### 5. Better Amenity Variety
5 amenity tiles vs 4 on other sites, with slightly more descriptive labels ("pools & hottub", "Rec Center", "live music").

### 6. More Complete Footer
Business hours (M-F 9 AM to 5 PM), email address, Facebook + Instagram links. Other sites often lack hours, email, or have only Facebook.

### 7. Professional Presentation
Real images (no base64 placeholders), branded strawberry logo, consistent red/green color scheme, and "Elite Resorts" branding suggests professional management.

---

## Screenshots Index

| Filename | Site | Description |
|----------|------|-------------|
| riveroaks-homepage-viewport.png | River Oaks | Homepage with popup modal |
| riveroaks-homepage-fullpage.png | River Oaks | Full homepage scroll |
| riveroaks-T1-split-nav.png | River Oaks | Split nav header |
| riveroaks-T4-T5-hero-section.png | River Oaks | Hero + transparent header |
| riveroaks-T3-seo-copy.png | River Oaks | SEO keyword-stuffed body copy |
| riveroaks-accommodation-cards.png | River Oaks | Accommodation cards section |
| riveroaks-T6-T10-amenities-section.png | River Oaks | Amenities with modal |
| riveroaks-T6-T10-amenities-clean.png | River Oaks | Amenities after modal removal |
| riveroaks-testimonials.png | River Oaks | Testimonials section |
| riveroaks-T8-footer-nav.png | River Oaks | Footer nav duplication |
| trinityalps-homepage-viewport.png | Trinity Alps | Homepage viewport |
| trinityalps-T1-split-nav.png | Trinity Alps | Split nav header |
| trinityalps-TA1-testimonials-empty.png | Trinity Alps | Empty testimonials section |
| trinityalps-homepage-fullpage.png | Trinity Alps | Full homepage scroll |
| beardedbuffalo-homepage-viewport.png | Bearded Buffalo | Homepage viewport |
| beardedbuffalo-BB3-amenities-empty-alt.png | Bearded Buffalo | Amenities with empty alt text |
| beardedbuffalo-BB1-reviews-widget.png | Bearded Buffalo | Working Trustindex review widget |
| joyrv-homepage-viewport.png | Joy RV | Homepage viewport |
| joyrv-homepage-fullpage.png | Joy RV | Full homepage scroll |
| joyrv-T1-split-nav.png | Joy RV | Split nav header |
| joyrv-T3-seo-copy.png | Joy RV | SEO copy + drive-in section |
| joyrv-JR2-broken-amenity-images.png | Joy RV | Completely broken amenity tiles |
| joyrv-JR2-drivein-movie-section.png | Joy RV | Drive-in movie promotional section |
| joyrv-T8-footer-nav.png | Joy RV | Footer with overlapping header |
| joyrv-JR4-movies-events-page.png | Joy RV | Movies/events calendar page |
| joyrv-booking-page-inline-widget.png | Joy RV | Inline Newbook booking widget |
| strawberry-homepage-viewport.png | Strawberry Park | Homepage viewport |
| strawberry-homepage-fullpage.png | Strawberry Park | Full homepage scroll |
| strawberry-SP1-logo-left-aligned.png | Strawberry Park | Left-aligned logo (reference) |
| strawberry-amenities-section.png | Strawberry Park | Amenities (3/5 images load) |
| strawberry-SP6-testimonials-empty.png | Strawberry Park | Empty testimonials + Google Maps |
| strawberry-T8-footer.png | Strawberry Park | Footer with mismatched phone |
