# NP Wardrobe — UI/UX Design Specification

**Document status:** Design-system and screen specification derived from approved project documents and Stitch reference  
**Version:** 1.0  
**Date:** 14 November 2026  
**Product:** NP Wardrobe responsive ecommerce website and administration system  
**Primary visual reference:** `stitch_np_wardrobe_luxury_ecommerce_experience(1).zip`  
**Related documents:** `PROJECT_OVERVIEW.md`, `PRD.md`, `TRD.md`, `APP_FLOW.md`  
**Primary market:** Nepal  
**Primary currency:** NPR (`रु.`)

---

## 1. Purpose and design authority

This document defines how NP Wardrobe should look, feel and communicate across customer, owner and staff experiences. It translates the eight-page mobile Stitch reference, its `DESIGN.md`, the approved PRD/TRD and the 50-question APP_FLOW discovery into a reusable visual system and screen-level UI specification.

It is the primary visual handoff for designers and AI coding agents. It defines:

- Brand expression, visual hierarchy, color and typography rules.
- Responsive layout rules for mobile, tablet and desktop.
- Shared design tokens and component behaviour.
- Customer storefront screen layouts and interactive states.
- Customer account and authentication surfaces.
- Admin and staff dashboard visual language and responsive patterns.
- Forms, tables, drawers, modals, notifications, feedback and error states.
- Accessibility, localization, privacy and implementation handoff requirements.

It does **not** replace `APP_FLOW.md`, which defines navigation and state transitions, or `TRD.md`, which defines technical architecture and security. When those documents define a required state or permission, the UI must expose it accurately and must not use visual styling as a substitute for backend authorization.

### 1.1 Source precedence

If references conflict, use this order:

1. **PRD.md:** Approved product scope, business rules, priorities and market requirements.
2. **TRD.md:** Approved technical/security constraints.
3. **APP_FLOW.md:** Approved 50-question interaction decisions, routes, screen states and workflows.
4. **Stitch ZIP `DESIGN.md`:** Exact visual design system and component descriptions.
5. **Eight Stitch `screen.png` and `code.html` pairs:** Screen composition, labels and prototype-level interactions.
6. **Proposals in this document:** Visual details added to complete missing screens; do not create new commercial promises or unapproved business policies.

### 1.2 Evidence labels

| Label | Meaning |
|---|---|
| **[STITCH]** | Directly observed in an uploaded screenshot, HTML page or `DESIGN.md`. |
| **[APPROVED]** | Selected in the 50-question APP_FLOW interview or prior approved discovery. |
| **[PRD/TRD]** | Required by the approved product or technical document. |
| **[DESIGN PROPOSAL]** | A visual specification for a screen not present in the ZIP, based on the approved flows. |
| **[CONFIG]** | Business-supplied content, value, policy or integration configuration; must not be invented. |
| **[PHASE 2]** | Approved future capability; do not block Phase 1 launch. |
| **[OPEN DESIGN DECISION]** | A conflict in the supplied source files requiring final owner sign-off. |

### 1.3 Core design principles

1. **Preserve + improve:** Keep the eight original mobile screens as the foundation and improve navigation, accessibility, responsive behaviour and missing states. [APPROVED]
2. **Premium editorial boutique:** Give product photography and collection imagery visual priority; use generous whitespace, calm surfaces, fine borders and restrained accents.
3. **Mobile-first:** The main shopper experience is designed for mobile first. The PRD estimates approximately 90% of visitors will use phones; desktop must still be complete and polished.
4. **Commerce clarity:** Price, selected size/colour, availability, delivery charge, payment state and next action must be easy to understand.
5. **Trust over decoration:** Avoid promotional claims, delivery promises, review counts, stock urgency or payment badges unless supported by real data/configuration.
6. **Accessible interaction:** Visible focus, sufficient contrast, keyboard support, readable labels, minimum touch size and meaningful status text are mandatory.
7. **No deceptive success:** A button click, toast, WhatsApp launch, payment proof upload or request submission must not be styled/labeled as a completed order, paid payment or approved request unless the system state confirms it.
8. **Consistent language:** The same state, action and status must use the same label and visual treatment across customer and admin screens.
9. **Progressive disclosure:** Use drawers, accordions, steps and contextual explanations to keep complex tasks understandable without hiding critical information.
10. **Operational and customer views differ:** The admin UI can be denser and desktop-oriented, but must retain the brand’s typography, calm palette and clear hierarchy.

---

## 2. Stitch archive audit and visual reference map

The uploaded archive contains eight screen folders. Each has `screen.png` and `code.html`; the root design folder contains `DESIGN.md`.

| Stitch source folder | Screenshot / HTML | Visual patterns to preserve |
|---|---|---|
| `np_wardrobe_homepage/` | `screen.png`, `code.html` | Announcement strip, logo/header, editorial hero, style/category shortcuts, new-arrival product cards, campaign card, brand promise, reviews, social/editorial gallery, WhatsApp order area, newsletter/footer and five-tab bottom navigation. |
| `np_wardrobe_category_collections/` | `screen.png`, `code.html` | Editorial category hero, category chips, large image cards, paired smaller collection cards, accessory feature, seasonal campaign panel, stylist CTA, service assurance tiles and bottom navigation. |
| `np_wardrobe_shop_all_products/` | `screen.png`, `code.html` | Product count, category chips, search field, filter and sort controls, grid/list toggle, applied filter chips, 2-column product cards, load-more control, trust/service tiles, footer and bottom navigation. |
| `np_wardrobe_product_details/` | `screen.png`, `code.html` | Large swipe gallery, gallery count, share/wishlist controls, stock notice, fabric/brand metadata, product name, current/compare-at price, discount, colour swatches, size chips, size-guide link, quantity stepper, sticky purchase bar, WhatsApp consultation, accordions, review summary/cards and related products. |
| `np_wardrobe_shopping_bag_checkout/` | `screen.png`, `code.html` | Back header, three-stage progress strip (Review / Delivery / Payment), item rows, remove/quantity controls, coupon field, totals, delivery form, payment method cards, eSewa QR/merchant display, WhatsApp submit CTA and trust blocks. The screenshot shows all content on one scrollable page; the approved production flow is staged. |
| `np_wardrobe_size_guide/` | `screen.png`, `code.html` | Editorial title, inches/cm segmented control, horizontally scrollable size matrix, fit advice cards, step-by-step measurement guidance and WhatsApp stylist help. |
| `np_wardrobe_faq_shipping/` | `screen.png`, `code.html` | Help hero, FAQ search, category chips, service assurance cards, accordion questions, editorial help image, WhatsApp support and contact details. |
| `np_wardrobe_about_us/` | `screen.png`, `code.html` | Brand philosophy hero, origin story, value pillars, editorial image cards, founder/atelier letter, studio details, stylist/appointment CTAs and bottom navigation. |

### 2.1 Prototype behaviour versus production behaviour

The HTML pages are visual prototypes. They are not the source of truth for persisted commerce, payment or identity state.

Observed examples:

- Homepage favourite icons toggle CSS/icon state; they do not establish persistent account/guest wishlist storage.
- Homepage Add to Bag updates a visible badge/label in the prototype; it does not demonstrate a durable server-backed cart or variant validation.
- The Shop page includes a filter drawer, sort controls, layout toggle and product actions. Some visual states are driven by prototype JavaScript; production must use actual catalogue queries and preserve filters as defined in APP_FLOW.
- The Product Details page includes functions for gallery navigation, colour/size selection, quantity adjustment, wishlist and size modal. The prototype’s colour selection is not proof of variant-specific image/price/stock relationships.
- The Checkout prototype contains a `handleWhatsAppOrder()` path and sample totals/merchant values. Production must persist order and reserve stock before handoff.
- The FAQ has search/category/accordion JavaScript, which can inform the production interaction pattern.
- The Size Guide has a working unit-switch pattern in the prototype; published measurements still require owner verification.
- The About page’s fitting-session button triggers a temporary “request received” toast. Production must only show a success state after an actual booking/request has been recorded by a real workflow.

All production controls must implement the approved APP_FLOW and TRD rules; a prototype visual action is not sufficient.

---

## 3. Brand expression and art direction

### 3.1 Brand personality

NP Wardrobe should feel:

- Elegant and feminine without appearing overly ornate.
- Premium and calm rather than loud or discount-led.
- Editorial, tactile and fashion-focused.
- Modern, clear and accessible to women aged 18–45.
- Local and trustworthy for customers shopping across Nepal.

### 3.2 Visual language

Preserve the Stitch atmosphere:

- Warm cream canvas rather than sterile white.
- Soft blush panels for subtle grouping.
- Rose-toned accents for brand identity and selected states.
- A restrained crimson accent for high-priority conversion or alert emphasis, subject to token reconciliation.
- Dark cocoa/near-black text rather than pure black where the source design allows.
- Hairline borders rather than heavy outlines.
- Low, ambient elevation rather than dramatic shadows.
- Large, editorial fashion photography and 3:4 product images.
- Small uppercase labels with letter spacing for category names, meta labels and section overlines.
- Comfortable whitespace and a clear distinction between editorial content and transactional controls.

Do not copy H&M or other brand logos, photography, typography lockups or proprietary layouts. The reference is limited to the broad clean-shopping principle.

### 3.3 Imagery direction

- Use owner-provided, accurate product photography as the production source of truth.
- Product cards should show the garment clearly and consistently; avoid decorative cropping that hides key fit or shape details.
- Use the same product’s actual variant imagery when a colour is selected.
- Editorial hero and collection imagery may be more atmospheric, but product-detail imagery must remain accurate to the purchasable garment.
- Temporary photos must be clearly treated as placeholders in development/staging and replaced before production.
- Do not use fake review photos, fake social proof or imagery that implies an unavailable product/colour is in stock.
- Provide meaningful alt text for informative images; mark decorative imagery appropriately.

---

## 4. Design tokens and source reconciliation

### 4.1 Important source conflicts [OPEN DESIGN DECISION]

Two internal differences in the supplied sources must be resolved before the final visual design is locked:

**Typography conflict**
- `PRD.md` and the project brief specify **Cormorant Garamond** for headings and **DM Sans** for body/UI.
- The Stitch `DESIGN.md` typography tokens and descriptive text specify **EB Garamond** for display/headline text and **DM Sans** for body/UI.
- The screenshots visually reflect a high-contrast editorial serif but cannot prove the exact font file loaded in every browser.

**Colour conflict**
- The machine-readable YAML block in Stitch `DESIGN.md` sets `primary: #8a4853`, `primary-container: #a6606b`, `tertiary: #b5192c`, `on-surface: #201a1a`, `secondary-container: #eddfdd`, and also defines `surface-cream: #FBF7F0`, `text-muted: #746A66`, `border-subtle: #E9DED8`, and `whatsapp-green: #25D366`.
- The prose later in the same file describes Rose Gold as `#B76E79`, Soft Blush as `#F2E4E2`, Crimson as `#C92A38`, and Dark Cocoa as `#292323`.
- These are close in intent but not identical values. The YAML and prose must not be blended arbitrarily into one undocumented palette.

**Interim implementation rule:** Keep the design tokens centralized in one theme file and retain a clear mapping to the source values. For exact recreation of the supplied HTML, begin with the YAML token values. The prose values may be represented as proposed brand-alias tokens, but the owner must approve one canonical semantic palette and one heading font before a final brand/design freeze. Do not scatter both sets of values across components.

### 4.2 Source YAML colour inventory

The following are source values from the Stitch `DESIGN.md` token block, not newly invented palette values:

| Token | Source value | Intended use |
|---|---:|---|
| `surface` | `#fff8f7` | Main warm page surface in the token set |
| `surface-dim` | `#e3d7d7` | Dimmed surface layer |
| `surface-bright` | `#fff8f7` | Bright surface |
| `surface-container-lowest` | `#ffffff` | Pure white card/modal surface |
| `surface-container-low` | `#fdf1f0` | Low-contrast surface layer |
| `surface-container` | `#f7ebeb` | Blush surface grouping |
| `surface-container-high` | `#f1e5e5` | Elevated tonal surface |
| `surface-container-highest` | `#ece0df` | Stronger tonal surface |
| `on-surface` | `#201a1a` | Primary text in source token set |
| `on-surface-variant` | `#524345` | Secondary text |
| `inverse-surface` | `#352f2f` | Inverse surface |
| `inverse-on-surface` | `#faeeed` | Inverse text |
| `outline` | `#857374` | Outline |
| `outline-variant` | `#d7c1c3` | Subtle outline variant |
| `surface-tint` | `#8c4b55` | Surface tint |
| `primary` | `#8a4853` | Primary source token |
| `on-primary` | `#ffffff` | Text/icon on primary |
| `primary-container` | `#a6606b` | Primary container |
| `on-primary-container` | `#fffbff` | Text on primary container |
| `inverse-primary` | `#ffb2bc` | Inverse primary |
| `secondary` | `#665c5b` | Secondary token |
| `on-secondary` | `#ffffff` | Text on secondary |
| `secondary-container` | `#eddfdd` | Secondary container |
| `on-secondary-container` | `#6c6261` | Text on secondary container |
| `tertiary` | `#b5192c` | Tertiary/source brand accent |
| `on-tertiary` | `#ffffff` | Text on tertiary |
| `tertiary-container` | `#d83641` | Tertiary container |
| `on-tertiary-container` | `#fffbff` | Text on tertiary container |
| `error` | `#ba1a1a` | Error state |
| `on-error` | `#ffffff` | Text on error |
| `error-container` | `#ffdad6` | Error background |
| `on-error-container` | `#93000a` | Text on error background |
| `primary-fixed` | `#ffd9dd` | Fixed primary tint |
| `primary-fixed-dim` | `#ffb2bc` | Dim fixed primary tint |
| `on-primary-fixed` | `#3a0915` | Text on fixed primary |
| `on-primary-fixed-variant` | `#70343e` | Text on fixed primary variant |
| `secondary-fixed` | `#eddfdd` | Fixed secondary tint |
| `secondary-fixed-dim` | `#d1c4c2` | Dim fixed secondary tint |
| `on-secondary-fixed` | `#211a19` | Text on fixed secondary |
| `on-secondary-fixed-variant` | `#4e4544` | Text on fixed secondary variant |
| `tertiary-fixed` | `#ffdad8` | Fixed tertiary tint |
| `tertiary-fixed-dim` | `#ffb3b1` | Dim fixed tertiary tint |
| `on-tertiary-fixed` | `#410007` | Text on fixed tertiary |
| `on-tertiary-fixed-variant` | `#92001c` | Text on fixed tertiary variant |
| `background` | `#fff8f7` | App background |
| `on-background` | `#201a1a` | Text on background |
| `surface-variant` | `#ece0df` | Surface variant |
| `surface-cream` | `#FBF7F0` | Cream canvas |
| `surface-pure` | `#FFFFFF` | Pure white |
| `text-muted` | `#746A66` | Muted text |
| `border-subtle` | `#E9DED8` | Hairline border |
| `whatsapp-green` | `#25D366` | WhatsApp action only |

### 4.3 Prose brand aliases requiring owner confirmation

| Alias described in DESIGN.md prose | Value | Proposed role |
|---|---:|---|
| Rose Gold | `#B76E79` | Brand highlight, selected accents and delicate decoration |
| Soft Blush | `#F2E4E2` | Soft chips, badges and secondary surface panels |
| Crimson Logo Red | `#C92A38` | High-priority CTA, sale and urgent states, if approved |
| Dark Cocoa | `#292323` | Warm dark text/high contrast |
| Surface Cream | `#FBF7F0` | Main warm canvas |
| Pure White | `#FFFFFF` | Product/media and dialog surfaces |
| Border Subtle | `#E9DED8` | Hairline borders |
| Muted Text | `#746A66` | Secondary copy |
| WhatsApp Green | `#25D366` | WhatsApp-specific action |

### 4.4 Semantic colour rules

Regardless of the final canonical hex values:

- Primary brand action: one clearly defined primary token; do not alternate rose/crimson between equivalent actions.
- Secondary action: transparent/neutral surface with one-pixel border.
- Destructive action: use the error token and a clear text label; never use the brand crimson by default if it could be confused with a sale/active state.
- Success: restrained, accessible green or semantic success token; do not use WhatsApp green for every success message.
- Warning: amber/yellow semantic style with text, icon and label.
- Informational: neutral/blue semantic style as supported by the component system.
- Disabled: muted background/text and non-interactive semantics; do not communicate disabled state by opacity alone if text becomes unreadable.
- WhatsApp: use the dedicated green only for WhatsApp entry/action, not general primary checkout actions.
- Stock/price urgency: show only if backed by current system data and approved merchandising policy.

### 4.5 Typography scale from the source design

`DM Sans` is consistent between PRD and Stitch for UI/body text. The heading family needs owner resolution between Cormorant Garamond (PRD) and EB Garamond (Stitch). Until resolution, use a semantic `--font-editorial` token so components do not hard-code the family.

| Source style token | Font family in Stitch | Size | Weight | Line height | Letter spacing |
|---|---|---:|---:|---:|---:|
| `display` | EB Garamond | `3.5rem` | 400 | `4rem` | `-0.02em` |
| `display-mobile` | EB Garamond | `2.5rem` | 400 | `3rem` | `-0.01em` |
| `headline-lg` | EB Garamond | `2.5rem` | 400 | `3rem` | `-0.01em` |
| `headline-lg-mobile` | EB Garamond | `1.875rem` | 400 | `2.25rem` | `0` |
| `headline-md` | EB Garamond | `1.75rem` | 500 | `2.25rem` | `0` |
| `headline-sm` | EB Garamond | `1.25rem` | 500 | `1.75rem` | `0.01em` |
| `title-lg` | DM Sans | `1.125rem` | 600 | `1.625rem` | `0.01em` |
| `title-md` | DM Sans | `1rem` | 500 | `1.5rem` | `0.01em` |
| `body-lg` | DM Sans | `1.0625rem` | 400 | `1.75rem` | `0` |
| `body-md` | DM Sans | `0.9375rem` | 400 | `1.5rem` | `0` |
| `body-sm` | DM Sans | `0.8125rem` | 400 | `1.25rem` | `0.01em` |
| `label-md` | DM Sans | `0.8125rem` | 600 | `1rem` | `0.08em` |
| `label-sm` | DM Sans | `0.6875rem` | 600 | `0.875rem` | `0.1em` |
| `currency` | DM Sans | `1rem` | 700 | `1.25rem` | `0.02em` |

**Usage rules:**
- Editorial display/headline styles are reserved for hero headlines, category/collection titles and product names.
- DM Sans is used for paragraphs, controls, prices, forms, labels, admin tables and functional data.
- Avoid using all-uppercase text for long paragraphs.
- Use letter-spaced uppercase labels for short overlines, not important warnings or lengthy instructions.
- Currency must remain highly legible and should not be rendered in the editorial serif.
- Limit font weights to those available in the loaded font files; avoid synthetic heavy styles.

---

## 5. Layout grid, spacing and page structure

### 5.1 Breakpoints and grid architecture

Use the supplied Stitch layout model as the starting point:

| Viewport | Grid | Gutters / margins | Page behaviour |
|---|---|---|---|
| Mobile `<768px` | 4-column | 16px grid gutters and 16px page margin | 2-column product grid; compact shell; bottom navigation on primary browsing pages |
| Tablet `768–1199px` | 8-column | 20px gutters and 2rem side margins | More breathing room; two/three-column editorial layout as content allows; no forced desktop sidebar on narrow tablet |
| Desktop `1200px+` | 12-column | 24px gutters; centered content max width 1360px; 3.5rem outer margin | Full navigation, broad editorial layout, multi-column product grid and desktop admin shell |

Breakpoint values may be adjusted by a few pixels to suit actual content, but the mobile/tablet/desktop intent and 4/8/12 column model should remain.

### 5.2 Spacing scale

Use the source scale as the shared rhythm:

| Token | Value |
|---|---:|
| `space-xs` | `0.25rem` / 4px |
| `space-sm` | `0.5rem` / 8px |
| `space-md` | `1rem` / 16px |
| `space-lg` | `1.5rem` / 24px |
| `space-xl` | `2.5rem` / 40px |
| `space-2xl` | `4rem` / 64px |
| `gutter` | `1rem` / 16px |
| `gutter-desktop` | `1.5rem` / 24px |
| `margin` | `1rem` / 16px |
| `margin-tablet` | `2rem` / 32px |
| `margin-desktop` | `3.5rem` / 56px |

Use `space-xl` as a common mobile editorial section interval and `space-2xl` on desktop where the page needs more breathing room. Dense admin data screens may use tighter vertical spacing while retaining the shared rhythm.

### 5.3 Content width and alignment

- Storefront content is centered within the 1360px desktop maximum.
- Text measure for long editorial copy should remain comfortably readable; do not stretch paragraphs across the full desktop canvas.
- Product imagery may use wider editorial spans than body text.
- On mobile, maintain 16px minimum page gutters except for intentional full-bleed imagery or edge-to-edge galleries.
- Keep price, quantity and primary purchase action visually grouped.
- Use consistent left alignment for titles, descriptions, input labels and data tables.

### 5.4 Grid use

- Mobile product catalogue: 2 columns by default.
- Mobile alternate catalogue layout: 1-column editorial list, user-selectable and remembered.
- Tablet catalogue: 2–3 columns depending on card readability and image aspect ratio.
- Desktop catalogue: 3–4 columns depending on available width; never shrink card controls below usable size.
- Related products: 2 columns mobile, larger grid at desktop.
- Category/editorial cards: asymmetric grids are acceptable where the source screen uses large hero imagery plus paired smaller cards.
- Admin dashboard: card grid with role-aware widgets; data tables remain readable and can switch to card/list presentation on mobile.

---

## 6. Shapes, borders, elevation and motion

### 6.1 Corner radius

Source radii from `DESIGN.md`:

| Token | Value |
|---|---:|
| `rounded-sm` | `0.125rem` / 2px |
| `rounded` | `0.25rem` / 4px |
| `rounded-md` | `0.375rem` / 6px |
| `rounded-lg` | `0.5rem` / 8px |
| `rounded-xl` | `0.75rem` / 12px |
| `rounded-full` | `9999px` |

Use small/soft radii for form fields, buttons, category chips and compact cards. Product media can be square-edged or use a very small radius to maintain editorial framing. Pill radius is reserved for status tags, compact chips or the floating WhatsApp control—not every card or button.

### 6.2 Borders

- Default divider/card border: 1px hairline using the approved subtle border token.
- Avoid multiple borders around the same card.
- Use a stronger border only for keyboard focus, selected option, error or clear component separation.
- Selected size/colour chips need a visible border/fill difference, not colour alone.

### 6.3 Elevation

The Stitch reference favors tonal layers and subtle ambient shadows.

Source Level 1 shadow:

```css
box-shadow: 0 4px 20px -2px rgba(41, 35, 35, 0.06),
            0 2px 6px -1px rgba(41, 35, 35, 0.03);
```

Use this sparingly for floating sticky actions, drawers, Quick View panels, dialogs and selected overlays. Do not give ordinary product cards heavy card shadows.

### 6.4 Motion

- Use short, purposeful transitions for drawer/sheet opening, accordion expansion, image changes and toast appearance.
- Product image hover on pointer devices may use the source's subtle 1.03x zoom and micro-fade to reveal a secondary image.
- Mobile must not rely on hover to reveal essential controls.
- Respect `prefers-reduced-motion` and provide immediate state changes when motion is reduced.
- Avoid autoplay carousels that move important information without user control.
- Motion must never delay checkout submission, status updates or validation feedback.

---

## 7. Shared component design system

The shared component library should be built from shadcn/ui primitives, styled with Tailwind tokens and wrapped in NP Wardrobe components. Use consistent names, states and sizing across the storefront and admin portal.

### 7.1 Buttons

| Variant | Visual treatment | Use |
|---|---|---|
| Primary / Boutique CTA | Solid approved primary conversion token, clear contrast, DM Sans semibold, uppercase or title case according to label length | Add to Bag, Continue to Delivery, Place Order, Save Changes, Publish |
| Secondary | Transparent/cream surface with one-pixel cocoa or rose-toned border | View Details, Continue Shopping, Back, Preview |
| Tertiary / Text | No filled background; underlined or clear text treatment where useful | View All, Edit, Learn More, Remove Filter |
| WhatsApp | Dedicated WhatsApp green with white icon/text | Chat with Stylist, WhatsApp Support, contextual product enquiry |
| Destructive | Semantic error fill or text treatment with explicit label | Remove, Cancel Request where applicable, Deactivate |
| Icon-only | Accessible icon target with visible focus and tooltip/label | Search, menu, close, favourite, share, quantity controls |

**Sizing:** Minimum 44px high on mobile and 48px on desktop for primary touch actions, as specified in the source. Icon-only touch targets should be at least 44×44px where practical.

**States:** Default, hover, pressed, keyboard focus, loading, disabled, success/completed. Loading buttons retain their label context (e.g. “Submitting order…”) and prevent duplicate action. Do not display an indefinite spinner without explanatory text.

### 7.2 Inputs, selects and text areas

- Use a 1px subtle border or a documented bottom-border style, with clear label above the field.
- Focus ring uses the approved focus token and must be visible against cream and white surfaces.
- Placeholder text is not a substitute for a label.
- Required fields show a consistent indicator and are described to assistive technology.
- Error text appears directly below the associated control and is programmatically linked.
- Success is not shown merely because a field has text; validation is tied to a real rule.
- Input text and values must remain readable at mobile sizes and with zoom.
- Use proper input types for email, phone and numeric values; validate on server as well.

### 7.3 Checkbox, radio and segmented controls

- Use radio controls for mutually exclusive choices such as payment method and a single default selection.
- Use checkboxes for multiple filters, terms acceptance and optional preferences.
- Use segmented controls for view mode and Inches/CM selection.
- Active controls need icon/shape and text/fill differences, not just a subtle tint.
- Payment choices must show the selected state clearly and expose the choice to screen readers.

### 7.4 Chips, badges and status tags

- Category chips: compact rectangular outline; selected state uses a clear fill and contrasting text.
- Filter chips: removable close icon with accessible label (e.g. “Remove size M filter”).
- Product badges: New, Bestseller, Sale or Limited only when backed by product data/configuration.
- Status tags: consistent semantic mapping for Pending, Confirmed, Processing, Shipped, Delivered, Cancelled; separate payment/request statuses from order status.
- Do not use the same color and label for Paid and Delivered; these are different state dimensions.
- Use text labels with status icons where helpful; never rely only on color.

### 7.5 Product card

**Source composition:** 3:4 product image, clean vertical card, small top-left product badge, wishlist heart, title, fabric/subtitle, size/fit information and NPR price.

**Required states:** Default, wishlist active, new/sale/bestseller badge, out of stock, partially available variants, image loading, image failure, price updated, and quick-add requiring variant selection.

**Actions:**
- Image/title → Product Details.
- Wishlist heart → persistent guest/account wishlist toggle.
- Quick View or Quick Add → open variant-aware Quick View; do not silently choose a size.
- Chat → product enquiry with product context; not an order and no stock reservation.

**Pointer behaviour:** On desktop, subtle alternate-image preview may appear on hover; it must not move the card layout. On mobile, show visible actions without hover.

### 7.6 Product image gallery

- Main image uses an editorial crop consistent with the source screenshots.
- Gallery counter and active thumbnail remain synchronized.
- Mobile swipe and desktop arrow/thumbnail navigation.
- Full-screen viewing and zoom where supported.
- Share action uses native share where possible, with Copy Link fallback.
- Loading/failed image uses a branded neutral placeholder and retry where appropriate.
- Gallery thumbnails need selected-state border/indicator.
- Product colour selection updates the appropriate gallery set.

### 7.7 Size/colour selectors

- Size options use compact square/rectangular chips as in the source.
- Selected option uses a strong fill/border and accessible `aria-pressed`/selection semantics.
- Out-of-stock options are disabled with a visible unavailable treatment (e.g. strike-through plus “Unavailable” text/tooltip).
- Colour swatches include a readable name; colour alone is not sufficient.
- Changing colour updates valid size choices, variant images, price, SKU and stock.
- If the previously selected size does not exist for the new colour, clear the size and prompt the shopper to select another.
- Low-stock copy is shown only from current inventory rules, not from static prototype copy.

### 7.8 Quantity stepper

- Minus and plus buttons have accessible labels.
- Minimum is one for a cart/purchase line; removal is a separate action.
- Maximum is derived from available inventory and configured purchase cap.
- At minimum/maximum, button is visibly disabled.
- Cart quantity changes recalculate line and cart totals; server revalidation remains authoritative.
- A stock conflict returns an inline explanation and prompts correction.

### 7.9 Drawers and bottom sheets

- Left navigation drawer enters from left and locks background scroll.
- Shop filter drawer/bottom sheet uses staged values, result count, Reset All, Apply Filters and close behaviour.
- Quick View uses a mobile bottom sheet or full-height panel as specified by the design; desktop may use a centered dialog/side panel.
- Added-to-Bag uses a compact confirmation panel; it must not cover the main navigation or sticky purchase action.
- All overlays have close button, Escape support on keyboard devices, accessible title and focus management.
- Closing an unapplied filter drawer discards staged filters; closing a confirmed cart panel does not undo the saved cart addition.

### 7.10 Dialogs and confirmations

Use dialogs for destructive or consequential actions: remove cart line, delete address, cancel request, deactivate staff, publish policy, reject payment, approve refund or inventory adjustment. Include a concise description, primary confirm action and safe cancel/back action. Do not use a confirmation dialog for every trivial navigation.

### 7.11 Toasts and inline feedback

- Toasts confirm small non-destructive events (saved to wishlist, copied, preference updated).
- Toast must not be the only record of order/payment/request success; show a durable result screen/status.
- Errors with required user action appear inline or in a persistent alert region, not as a fleeting toast only.
- A toast’s text must describe the actual persisted state (“Added to bag”) only after state succeeds.

### 7.12 Accordions

Use for FAQ, product details, fit/care/shipping sections and admin help. Provide clear open/closed indicator, click/tap target, keyboard operation and `aria-expanded`. Keep content readable when expanded. Avoid nested accordions unless the hierarchy is essential.

### 7.13 Tables and admin data grids

- Use clear column headings, sortable state where supported and visible filter context.
- Keep critical identifiers/status near the start of the row.
- Do not use color-only status indicators.
- Use responsive table-to-card/list transformation on small screens where horizontal scrolling would harm usability.
- Bulk actions show selected count and require an explicit confirmation for consequential operations.
- Empty table state includes an explanation and allowed next action.

### 7.14 Charts and dashboard widgets

- Each chart has a title, date range and accessible summary/table alternative.
- Avoid chart color as the only way to distinguish series.
- Show units (NPR, order count, percentage) and indicate whether data is estimated or verified.
- Empty, loading and failed widget states are independent so one chart failure does not blank the entire dashboard.
- Do not imply profit is exact until product costs and expenses are configured.

---

## 8. Customer application visual specification

This section describes the layout of every customer-facing screen in `APP_FLOW.md`. Routes and state transitions are defined in that document; this section focuses on visual hierarchy, responsive arrangement and component states.

### 8.1 Global customer shell

**Mobile header [STITCH]:**
- Top announcement strip at the top when an active, verified message exists.
- Main header with menu icon, NP Wardrobe wordmark, search, wishlist, bag and profile controls.
- Header remains compact; icons have consistent 44px touch areas where possible.
- Wordmark should remain visually central/clear without squeezing or overlapping icons.

**Bottom navigation [STITCH + APPROVED]:**
- Five equally weighted tabs: Home, Shop, Curated, Saved, Bag.
- Icon above short label; active tab receives the approved accent and clear visual cue.
- Bag and Saved may show small count badges, but badge values must be derived from actual state.
- Fixed bottom navigation respects device safe-area inset.
- It is not shown on focused multi-step checkout if it competes with progress/back navigation; checkout follows the Stitch page’s reduced header pattern.
- Product Details uses a sticky purchase bar; bottom navigation is suppressed/replaced there as in the source screenshot.

**Desktop header:**
- Logo/wordmark on left, primary category links across the main navigation, utility actions on right (search, saved, bag, account).
- No mobile bottom navigation on desktop.
- Search may open an overlay/expanded search field.
- Customer account entry remains clearly separate from admin access.

**Floating WhatsApp control:**
- Green pill/floating action with chat icon and the approved number or concise support label.
- Fixed placement must account for safe areas, viewport width, sticky cart/purchase bar, bottom navigation and keyboard.
- Reduce to icon-only on narrow mobile if text would obscure content, but preserve accessible name.
- Hide/reposition on checkout and payment screens where overlap or accidental external navigation is a risk.

### 8.2 C-01 Homepage — Stitch reference

**Reference:** `np_wardrobe_homepage/screen.png` and `code.html`.

**Visual order:**
1. Announcement strip.
2. Mobile header.
3. Full-width editorial hero with large fashion photograph, small category/campaign eyebrow, headline and primary CTA.
4. Secondary CTA or category shortcut.
5. “Explore By Style” section with visual category cards/chips.
6. “New Arrivals” product grid.
7. Promotional/seasonal feature card.
8. “Why Shop NP Wardrobe” service/brand promise tiles.
9. Customer review/social proof section.
10. `#NPWardrobe` editorial/social gallery.
11. WhatsApp concierge block.
12. Newsletter section, only when mailing list/consent is configured.
13. Footer groups: Collections, Client Care, accepted payment options and copyright.
14. Five-tab bottom navigation and floating WhatsApp action.

**Layout rules:**
- Hero photography dominates the top screen; text overlay must remain readable.
- On mobile, hero text and CTA sit within safe contrast area over the image or in a defined solid overlay.
- Category images should have consistent crop ratios and short, clear labels.
- Product cards use 2-column mobile grid and the shared 3:4 media rule.
- Review quote cards must wrap without clipping; any count/rating shown is real data only.
- On desktop, hero and editorial content can use a wider split composition rather than simply enlarging the mobile stack.

**Interactive states:** CTA loading/disabled, wishlist saved/removed, Add to Bag success/failure, coupon copied/failure, newsletter validation/subscription outcome, no featured products, content fetch error and offline banner.

**Content safeguards:** “Spring & Festive '25”, sample discount/offer codes, “Flat 15% Off”, “100% Pure”, customer review names/counts and other sample claims in the source are not production facts. CMS must only publish approved current campaign copy and authentic reviews.

### 8.3 C-02 Category & Collections — Stitch reference

**Reference:** `np_wardrobe_category_collections/screen.png` and `code.html`.

**Visual order:**
1. Global header.
2. Small editorial overline (“Curated Editions” style).
3. Large serif title (“Explore By Category” in prototype).
4. Introductory description.
5. Category filter chips (All Editions, Western Chic, Ethnic Couture, Casual Luxe, Evening Glam, Accessories as source examples).
6. Large full-width image collection cards with overlay title, subtitle, label/count and Explore Collection CTA.
7. Two-up smaller editorial collection cards.
8. Accessory feature card.
9. Seasonal/lookbook feature panel.
10. Stylist CTA and delivery/payment reassurance tiles.
11. Footer, floating WhatsApp and bottom navigation.

**Interactions:** Category chip selected state; image/title/Explore link; collection favourite only if saving that category/collection is implemented; stylist CTA opens contextual WhatsApp enquiry. Category chip navigation must be consistent with C-05/C-06 page patterns.

**Responsive:** Mobile stacked editorial composition; tablet two-column card groups; desktop asymmetric editorial grid with large feature card and supporting cards. Avoid forcing every collection into identical small tiles.

**Content safeguards:** The source references counts (e.g. “34 Styles”), “Handcrafted” labels, “Festive Season 2025”, event tags and specific collection counts. All counts, campaign dates and craftsmanship claims must be CMS data verified before production.

### 8.4 C-03 Full-screen Search — design proposal

**Entry:** Header search icon or supported search action. [APPROVED]

**Mobile layout:**
- Focused top row with back/close control and prominent search field.
- Clear icon inside search field when text exists.
- Initial discovery area with Recent Searches, Trending Searches and Popular Categories.
- As the user types, show live suggestions and matching products with compact thumbnails, product name and current price.
- Search result list/grid uses the shared Product Card.

**Desktop layout:** Wide overlay or dedicated results page with search field, suggestions column and result grid. Keep keyboard focus in the search experience.

**States:** Initial, typing/debounced, suggestion loading, results, no results, service unavailable, clear history, offline. Query text is preserved when returning from a product detail.

**Privacy:** User can clear search history. Do not send personal data in search events.

### 8.5 C-04 Shop All Products — Stitch reference

**Reference:** `np_wardrobe_shop_all_products/screen.png` and `code.html`.

**Mobile visual order:**
1. Header and compact page title/collection subtitle.
2. Horizontal category chips.
3. Search field.
4. Filter button with selected-filter count, sort control and grid/list toggle.
5. Applied filter chips and Clear All.
6. Product grid (2 columns default) or 1-column editorial view.
7. Load More control or pagination state.
8. Service reassurance/footer and bottom navigation.

**Product card structure:** 3:4 photo, top-left badge, top-right heart, product type/fabric, product title, available size summary, current price and optional compare-at price, stock availability text where real, Quick View/Add and Chat action.

**Filter drawer layout:**
- Drawer title and close.
- Sort group.
- Size selection chips.
- Colour selection swatches with names.
- Price range slider plus editable values if accessible.
- Availability filter.
- Occasion/category filters only where configured.
- Live result count.
- Reset All and Apply Filters anchored at bottom.

**View toggle:** 2-column grid as default; single-column editorial view is user-selectable and preference is saved on the device/account as appropriate.

**States:** Loading skeletons, no products, no results after filters, all products unavailable, filter validation, failed query, load-more error and image fallback. Preserve selected filters if a network error occurs.

### 8.6 C-05 Main Category Page — design proposal

**Layout:** Category hero banner, breadcrumb, category title, short description, subcategory chips/cards, collection links, product count, shared filter/sort/view toolbar and product grid/list.

**Desktop:** Hero may be split between text and image; subcategories and products align to the 12-column grid.

**Interactions:** Subcategory navigation, filters, product click, Quick View, wishlist and load-more. If no products are published, show a useful empty state and related category links; do not render a dead blank page.

### 8.7 C-06 Editorial Collection Page — design proposal based on Curated screen

**Layout:** Full-width editorial hero, collection title/eyebrow, descriptive paragraph, campaign metadata where valid, curated products, collection-specific lookbook imagery, optional styling notes and related collections.

**Content states:** Draft/preview is visible only to authorized staff; expired campaign is archived or hidden; unpublished collection is not indexed or accessible publicly.

**No false urgency:** Campaign end dates and “limited” language must be real and configured.

### 8.8 C-07 Product Details — Stitch reference

**Reference:** `np_wardrobe_product_details/screen.png` and `code.html`.

**Mobile visual hierarchy:**
1. Focused product header/back control.
2. Large edge-to-edge image gallery with image count and share/wishlist controls.
3. Stock notice/availability only when current.
4. Brand/fabric eyebrow and product title.
5. Current price, compare-at price and discount if active.
6. Delivery summary if verified.
7. Selected colour label and colour swatches.
8. Size options, Size Guide link and fit note.
9. Quantity stepper and subtotal summary.
10. Primary Add to Shopping Bag action.
11. WhatsApp stylist/product enquiry action.
12. Trust/payment/service strip.
13. Expandable Description & Styling Notes, Fabric Composition & Care, Delivery & Shipping Rates, Payment Options.
14. Verified Customer Love / review summary and review cards.
15. Related products / Complete the Look with Quick View/Quick Add.
16. Sticky bottom purchase bar with price, size summary, Add to Bag and compact WhatsApp action; avoid bottom-tab collision.

**Desktop layout proposal:** Main gallery left (larger multi-column image area), product information/variant form right in a sticky or aligned panel; detailed accordions/reviews/related products below. Ensure gallery and details remain balanced rather than making a narrow text column.

**Critical selection states:** No variant selected, colour selected but size required, size unavailable, variant unavailable, low stock, out of stock, price differs by variant, inventory changed while page open. The selected variant’s current image, price, SKU and availability must remain consistent across the page and cart.

**Sticky bar:** Appears when primary purchase controls move out of view. It includes selected product/variant summary, current price, primary Add to Bag and compact WhatsApp access. It must not cover the quantity stepper, bottom safe area or screen reader focus.

### 8.9 C-08 Quick View / Quick Shopping — design proposal

**Mobile:** Bottom sheet or nearly full-height panel with close control, image preview, product name/price, colour and size selector, quantity, stock, short description, Size Guide link, delivery info, Add to Bag and View Full Product.

**Desktop:** Dialog/side panel with product media and variant controls in two columns where viewport permits.

**States:** Loading product, loaded, variant required, selected variant, unavailable variant, service error, adding, added, add failed. Never auto-select a variant that was not explicitly selected if the product requires size/colour.

### 8.10 C-08A Added-to-Bag Confirmation Panel — design proposal

**Visual:** Compact bottom panel with small product image, “Added to Bag” status, product name, selected variant, quantity, unit/line price, updated cart count, Continue Shopping and View Bag.

**Rules:** Only display success after cart persistence succeeds. Keep the panel dismissible. Announce confirmation to assistive technology. If cart save fails, show a retryable error and do not show a success state.

### 8.11 C-09 Product Size Guide Modal

**Reference:** Size Guide modal trigger from Product Details prototype.

**Visual:** Clean dialog/sheet with product-specific measurement table if supplied, unit segmented control, garment fit note, “View Full Size Guide” link and Consult Stylist action. On mobile, use a readable bottom sheet/full-height dialog with horizontally scrollable table if necessary.

**States:** Product chart available, general chart only, chart unavailable. Never imply a generic size chart is a guaranteed fit for a specific garment.

### 8.12 C-10 Full Size Guide — Stitch reference

**Reference:** `np_wardrobe_size_guide/screen.png` and `code.html`.

**Visual order:**
1. Header and page title (“Find Your Perfect Silhouette” in source).
2. Short explanation of fit philosophy.
3. Inches / Centimeters segmented control.
4. Standard size matrix with horizontally scrollable table on narrow screens.
5. Standard-size indicator/fit advice panel.
6. Silhouette/garment fit cards (e.g. Kurti & Anarkali Sets, Pleated Gowns & Evening Wear, Linen Blazers & Trousers as source examples).
7. Step-by-step “How to Measure at Home” content with instructional image and numbered measurements.
8. Custom fitting / between-sizes help card.
9. WhatsApp Consult Stylist CTA.
10. Service/policy footer and customer navigation.

**Design rules:** Table headers remain sticky if useful; size labels and numbers remain legible. Horizontal scroll must be discoverable and keyboard accessible. Switching units updates every measurement consistently. Preserve the selected unit during the page session.

**Content rule:** Every size chart, bust/waist/hip/shoulder value, fit label and custom-alteration promise must be confirmed by the owner. The source table is sample content until verified.

### 8.13 C-11 Wishlist / Saved — design proposal

**Mobile layout:** Page title, item count, grid/list toggle, sort/filter if required, saved product cards, availability and price-change labels, quick view, Move to Bag and Remove controls.

**Empty state:** Elegant fashion illustration/photography, concise message, Explore Collections, New Arrivals and Best Sellers sections; personalized suggestions only when enough reliable browsing history exists.

**Guest:** Local wishlist with sign-in prompt only for cross-device sync or account-specific actions. **Registered:** account-synced wishlist. On merge, deduplicate by product+variant identity where applicable; preserve saved metadata.

**States:** Empty, populated, some unavailable, price changed, loading, sync conflict, offline/local only, failed sync.

### 8.14 C-12 Shopping Bag / Cart — source continuation plus approved flow

**Source:** Checkout screen includes a cart review block; full cart page is defined by APP_FLOW.

**Visual hierarchy:** Page title/Bag count; item rows with image/name/variant; remove icon; quantity stepper; unit and line price; coupon input/apply status; price breakdown; delivery estimate/fee if known; final total; Continue Shopping and Proceed to Checkout.

**Mobile:** Item rows stack image left and product metadata/actions right. Totals use a clear white/blush summary card; checkout CTA can be sticky when it does not cover content.

**Empty state:** “Your bag is empty” message, Continue Shopping and category/New Arrival links.

**Changed item state:** Clearly identify item/variant and changed price/availability. Show original/current data where useful, selectable correction/removal and require review before checkout. Never silently remove or substitute.

### 8.15 C-13 Checkout Step 1 — Review

**Approved flow:** Review → Delivery → Payment. The source screenshot stacks checkout content vertically; the approved production UX is a guided three-step experience.

**Visual layout:** Progress stepper at top, item list with variant/qty controls, remove item, coupon code, subtotal, discount and delivery summary where known, estimated total, Continue to Delivery.

**States:** Cart empty, invalid/expired coupon, price changed, stock changed, line unavailable, cart recalculating. Require the customer to review changes before advancing.

### 8.16 C-14 Checkout Step 2 — Delivery

**Visual layout:** Stepper, recipient full name, phone/WhatsApp, province, district, municipality/rural municipality, ward, street/house/landmark, optional delivery instructions, saved-address selector for registered users, serviceability result and delivery charge summary; Back to Review / Continue to Payment.

**Address UX:** Use structured selects with dependent options and searchable dropdowns where the data set is large. Do not force the user to type every administrative unit if verified structured options exist. If the dataset is incomplete, provide a carefully labeled manual-entry fallback. Do not use a GPS pin as mandatory.

**States:** Missing fields, invalid phone, unsupported area, charge needs manual confirmation, saved address unavailable, network failure. Preserve entered data on recoverable failure.

### 8.17 C-15 Checkout Step 3 — Payment

**Visual layout:** Stepper, compact order summary, eSewa card and COD card with clear radio selection, any configured advance-payment rule, final amount, required terms/policy acknowledgement and Place Order button.

**Rules:** Display only enabled methods. COD availability and eSewa setup are driven by configuration. The amount shown must come from the latest server calculation. Payment status remains distinct from order status.

### 8.18 C-16 eSewa Guided Payment — Phase 1 manual flow

**Visual layout:** Order reference and status, merchant name/ID and genuine QR only after owner configuration, payment instructions, copy button, payment-reference input, optional private proof upload, “I have made payment” submission, WhatsApp next step and “Pending Verification” status explanation.

**Visual feedback:** Copy success; QR/image load failure; proof uploading; upload complete; reference invalid; pending verification; admin rejected; verified/paid. Do not style a submitted screenshot as a paid/approved badge.

**Privacy:** Payment proof is shown only to the submitting customer where appropriate and authorized staff; use private storage and short-lived links.

### 8.19 C-17 COD Order Submission

**Visual layout:** COD selected card, any configured advance payment/limit notice, delivery area and charge, final total, order summary and final Place Order action.

**States:** COD available, unavailable for location/order, advance payment required, order saved awaiting manual confirmation. COD remains unpaid until actual collection is recorded.

### 8.20 C-18 Order Confirmation / WhatsApp Handoff

**Visual layout:** Clear order saved status, order reference, summary, payment method/status, delivery details, order timeline starter, WhatsApp CTA, Track Order and Continue Shopping.

**Important status hierarchy:** “Order saved” is a durable application status. “Open WhatsApp” is an external handoff. “WhatsApp message sent” is not known by the website. “Order confirmed by NP Wardrobe” occurs only after authorized admin transition.

**Error:** If WhatsApp cannot open, retain the saved order and show order reference plus manual contact route. Never create a duplicate order merely because the customer taps WhatsApp again.

### 8.21 C-19/C-20 Order Tracking Lookup and Detail

**Lookup visual:** Order ID/reference and phone number fields, continue button, privacy explanation and help link.

**Detail visual:** Order status timeline, order summary, payment status, delivery address summary (masked where appropriate), courier/tracking details, verified delivery estimate if available, WhatsApp support and eligible cancellation/return actions.

**Security:** Rate-limit lookup; generic failure copy should not reveal whether an order belongs to another phone number. Use verified access before revealing customer-specific information.

### 8.22 C-21 to C-25 Account Gateway, Login, Registration, Verification and Recovery

**Account Gateway:** Editorial/clean logo area with Login, Create Account, Phone OTP, Email/Password, Google Login and Continue as Guest. Make guest shopping explicit; do not make account registration look mandatory.

**Login:** Method selection; fields change based on method. Provide Forgot Password, verification help and return-to-shopping link. Show inline validation and generic authentication errors.

**Registration:** Full name, phone, email, chosen login method/password where applicable, terms/privacy acceptance and optional separate marketing consent. Do not request delivery address at registration.

**Verification:** OTP entry with visible destination, resend timer, code length cells or a single accessible input, change destination and back. Success and expired/invalid/rate-limited states are explicit. Avoid account enumeration.

**Recovery:** Email link or phone OTP path; new password/confirmation form; show password requirements and success. Password change invalidates/revokes sessions according to policy.

### 8.23 C-26 to C-30 Customer Dashboard, Profile, Address Book, Order History and Order Details

**Dashboard:** Greeting/name, account summary, recent orders, shortcuts to Orders, Addresses, Saved, Requests, Notifications and Security. Avoid an excessively dense mobile grid.

**Profile:** Clean form with verified/unverified badges on contact details, edit/save/cancel states and re-verification action.

**Address Book:** Address cards with label, recipient, phone, structured Nepal address, default badge, Edit/Delete/Set Default. Destructive delete requires confirmation.

**Order History:** Status filter chips, order cards, reference/date/thumbnail/total/payment state/order state, details and tracking actions. Reorder revalidates the latest variant and stock.

**Order Details:** Order-time snapshot, product items, totals, payment history, address, status timeline, delivery and request actions. Clearly separate order, payment and delivery statuses.

### 8.24 C-31 to C-33 Cancellation, Return/Exchange and Request Tracking

**Request forms:** Simple step-by-step selection of affected item(s), request type, reason, notes and evidence upload. Exchange selection displays replacement size/colour and availability without promising reservation until approved workflow says so.

**Request status view:** Submitted, Under Review, More Information Requested, Approved, Rejected, Pickup/Drop-off, Received/Inspected, Refund/Exchange Processing, Completed where applicable.

**Visual safeguards:** A request submission is not approval; approval is not refund completion; item received is not restocked until inspection outcome is recorded. Display the exact current state and next action.

### 8.25 C-34 Reviews

**Review form:** Star rating, written review, photo upload, product context and submission button. Verified-purchase eligibility appears before the form. Use upload preview, removal and size/type guidance.

**Review card:** Reviewer display name/initial, verified-purchase marker only when valid, star rating, date, text and approved images. Helpful/report controls follow APP_FLOW and backend moderation policy.

**Moderation state:** Pending review is not public. Rejected or changes requested states provide safe private feedback to the reviewer.

### 8.26 C-35 Notification Centre

**Visual:** Notification list with category icon, title, concise message, timestamp and unread indicator. Tabs/filters may separate Orders, Payments, Delivery, Requests and Account/Security. Read/unread and mark-all-read actions.

**Preferences:** Transactional vs marketing categories separated. Channel toggles only appear for channels configured and approved. Do not imply automatic WhatsApp is available before Phase 2 integration.

### 8.27 C-36 FAQ & Shipping Help — Stitch reference

**Reference:** `np_wardrobe_faq_shipping/screen.png` and `code.html`.

**Visual order:** Page header, title/introduction, search, horizontal category chips, service/assurance tiles, grouped FAQ headings, accordion cards, editorial help image, “Still have questions?” support panel, WhatsApp and verified contact channel, footer and bottom nav.

**Accordion:** Chevron/plus icon changes with open state; question and answer remain in card; only one accordion open at a time only if explicitly selected as the behaviour, otherwise allow independent rows. The prototype opens the first FAQ initially; production can use a clear collapsed default for easier scan/search.

**No-results state:** Search query stays visible, clear/reset action and WhatsApp support CTA.

**Content safeguards:** “7-Day Fit Guarantee,” 24–48-hour delivery, 2–4 business-day regional delivery, SMS updates, customer care hours and email concierge shown in the screenshot are sample content until the owner confirms them.

### 8.28 C-37 About Us — Stitch reference

**Reference:** `np_wardrobe_about_us/screen.png` and `code.html`.

**Visual order:** Editorial philosophy hero, origin story, key stats/brand values, value pillar cards, founder/atelier note, studio/visit section, stylist CTA, fitting CTA and footer.

**Layout:** Use long-form editorial rhythm with images interspersed between concise copy blocks. The mobile stack should remain easy to scan; desktop may use image/text split sections.

**Content safeguards:** “Lalitpur, 2021,” named founder/staff, “10,000+” clients, “100% Pure,” “24–48 Hours,” studio location/hours and business-registration claims are prototype content and must be verified before publication.

**Fitting CTA:** Must route to a real booking flow or WhatsApp enquiry. Do not show a false appointment-success toast.

### 8.29 C-38 Contact / WhatsApp Concierge

**Visual:** Contact card with approved WhatsApp number, contact action, contextual support entry points and verified business hours only if supplied. Provide a clear privacy reminder when a customer is about to include order information in an external app.

### 8.30 C-39 Shipping, Returns and Policy Pages

**Visual:** Readable content page with clear section headings, effective date/version when appropriate, table or list for delivery regions/fees only when verified, and contextual help link. Keep policy content in the CMS; use an alert for recent changes where needed.

---

## 9. Admin portal and staff UI specification

The admin UI does not have source screenshots in the ZIP. All layouts in this section are **[DESIGN PROPOSAL]** based on the approved PRD, TRD and APP_FLOW. They should preserve NP Wardrobe's visual identity but optimize for operational clarity and safe decision-making.

### 9.1 Admin application shell

**Desktop shell:**
- Fixed/collapsible left sidebar with NP Wardrobe admin mark and grouped navigation.
- Top bar with page title/breadcrumb, global search where appropriate, real-time notification bell, help, user menu and environment indicator.
- Main content area on neutral light surface, with cards, compact data tables and clear status labels.
- Content max-width may expand for tables and operational screens; keep forms and detail panels to readable widths.

**Mobile/tablet shell:**
- Sidebar becomes drawer/overlay.
- Top bar retains page title, menu, notifications and user menu.
- Tables transform to readable cards or controlled horizontal scrolling with sticky key column.
- Critical actions remain reachable without overlapping device keyboard or safe areas.
- Admin does not use customer five-tab bottom navigation.

**Role-specific navigation:** Hide inaccessible sections in UI, but enforce route/action authorization server-side. Show current location, notification count and contextual quick actions.

### 9.2 A-01/A-02 Admin Login and MFA

**Login layout:** Compact centered panel on calm neutral background; brand mark, “Admin Sign In” heading, email and password fields, password visibility toggle, Sign In, Forgot Password and security note. No public registration link.

**MFA:** Dedicated verification panel with factor prompt, code entry or supported authenticator UI, Verify, recovery path and Sign Out. Never display a success state until the server confirms MFA.

**States:** Invalid credentials, disabled/invited account, rate limit, MFA required, expired factor, provider unavailable, session expired. Copy should be safe and not leak whether a staff email exists.

### 9.3 A-03 Admin Dashboard

**Visual hierarchy:** Page title and date range; KPI row (orders, sales, pending orders, pending payments); operational cards (low stock, ready to dispatch, delivery issues); sales/revenue chart; recent orders; activity stream; quick actions.

**Role variation:** Owner sees full permitted overview; Order Manager sees assigned order work; Inventory Manager sees stock alerts; Support sees assigned customer/request queue; Marketing sees campaign/content performance where available.

**States:** Skeletons per widget, no data state, partial widget failure with Retry, realtime reconnect indicator. Estimated profit must be labeled and is hidden until costs/expenses are correctly configured.

### 9.4 A-04 Navigation

Grouped menu sections may include:
- Overview: Dashboard.
- Sales: Orders, Payments, Delivery, Requests.
- Catalogue: Products, Categories, Collections, Inventory, Import/Export.
- Customers: Customer Directory, Reviews.
- Marketing: Promotions/Campaigns, Content/CMS.
- Insights: Reports.
- Administration: Staff, Roles/Permissions, Activity Log, Settings.

Menu badges represent persisted actionable work (e.g. pending orders), not stale client counts. Collapsible groups preserve state during navigation.

### 9.5 A-05/A-06 Order Queue and Order Details

**Queue layout:** Title, tabs/status filters, search, date filters, payment filter, delivery region, assigned staff, sort and table. Columns: order reference, date, customer, total, order status, payment method/status, region, assigned staff and actions.

**Order detail layout:** Order header/reference/state, action toolbar, timeline, customer/address panel, item snapshot table, totals, payment section, stock reservation section, courier/dispatch panel, internal notes, linked requests and audit history.

**Visual safety:** Confirm, cancel, ship, deliver and payment actions use explicit buttons with confirmation dialogs and reasons where required. Do not rely on changing a dropdown to perform irreversible transitions. Payment and order statuses are shown in separate labeled chips.

**Mobile:** Order summary first, collapsible sections for customer, items, payment, delivery, notes and timeline. Sticky action bar only for the primary allowed next action; never hide audit details.

### 9.6 A-07/A-08/A-09 Product Catalogue, Creation Wizard and Editor

**Catalogue list:** Product thumbnail, name, SKU/slug, category, publish state, variant count, price range, stock summary, updated time and row actions. Toolbar includes search, category/status/stock filters, Add Product, Import/Export and bulk actions subject to permission.

**Creation wizard:** Stepper at top with Basic Info → Media → Variants → Pricing & Inventory → Fashion Details → SEO & Localization → Preview → Publish. Main content uses focused forms; right/side summary preview can appear on large screens. Save Draft, Back, Next and validation summary remain visible.

**Editor:** Tabs/sections for General, Images, Variants, Inventory, Details, SEO & Translation, Related Products and Settings. Autosave status and explicit Save where needed. Unsaved changes must be apparent.

**Media manager:** Image upload progress, main image selection, reorder, crop/preview and alt-text fields. Failed upload remains retryable. No public upload of private payment proof.

### 9.7 A-10 Import / Export

Use a guided flow: Select File → Map Columns → Preview → Validation Report → Confirm Import → Processing → Completion Report. Show row count, valid rows, invalid rows and reason per error. Export filters and fields are explicit; sensitive customer/payment data requires separate permission and audit.

### 9.8 A-11/A-12 Inventory Overview and Variant Detail

**Overview:** KPI strip (on-hand, reserved, available, low stock, out of stock), product/variant search, filters and table. Make “Available” distinct from “Physical” and “Reserved”.

**Detail:** Variant image/name/attributes/SKU; physical/reserved/available quantities; low-stock threshold; active reservations and linked orders; stock movement timeline; adjustment action. Adjustment form asks delta/new value, reason and confirmation. Bulk changes show a preview of all affected variants.

**States:** Reservation active/expiring/committed/released; out-of-stock; low-stock; data mismatch; permission restricted; concurrent update conflict. Do not show a stale value as authoritative after a conflict—refresh and explain.

### 9.9 A-13/A-14 Payment Queue and Payment Verification

**Queue:** Tabs for Pending Verification, Verified/Paid, Rejected/Failed, Refunds and COD Collection where enabled. Columns include payment reference, order, method, amount, status, submitted date, reviewer.

**Detail:** Order/payment summary, merchant reference, submitted transaction reference, private proof viewer (permission-checked), verification checklist, notes, history and action panel.

**Actions:** Approve, Reject with reason, Request More Information, Record COD Collected, Record Refund. Approval/rejection requires a confirm step and writes actor/time/reason. Refund Requested and Refund Completed are visually distinct. A screenshot upload is never an approved state.

### 9.10 A-15 Delivery Management

**Queue tabs:** Ready to Dispatch, Assigned, In Transit, Attempted, Delivered, Failed/Returned, as supported by operational process.

**Detail panel:** Customer/recipient information as permitted, address, package details, courier, tracking reference/link, dispatch date, delivery status timeline, failure reason, proof of delivery and notification record.

**Actions:** Assign Courier, Enter Tracking, Mark Dispatched, Record Attempt, Mark Delivered, Mark Failed/Returned, Contact Customer. Each state change is guarded, auditable and role-checked.

### 9.11 A-16 Requests (Cancellation / Return / Exchange)

**Queue:** Separate filter/tabs by request type and state. Show request ID, order reference, customer, item, reason, submitted date, assigned staff and next action.

**Detail:** Linked order/item snapshots, customer evidence, eligibility result, notes, internal comments, pickup/delivery coordination, inspection/restock choice, refund/exchange state and timeline.

**Actions:** Assign, Request Info, Approve, Reject, Schedule Pickup, Mark Received, Record Inspection, Restock/Do Not Restock, Process Exchange, Record Refund. Destructive/financial actions require permissions and confirmation.

### 9.12 A-17 Customer Directory

**List:** Customer identity (minimal), masked contact details based on permission, total orders/spend where permitted, last order and account state. Search and filter. Avoid exposing customer addresses or payment details in the list view.

**Detail:** Customer profile, verified contacts, addresses (role-limited), order history, requests and support notes. Export is restricted/audited.

### 9.13 A-18 Review Moderation

**Queue:** Pending, Changes Requested, Approved, Rejected and Reported. Show product, star rating, review text, reviewer/verified state, date and photo previews.

**Detail:** Review content and safe media view, purchase eligibility, moderation actions, reason and history. Approve/reject/request changes/report resolution are auditable. Never show unapproved review in public product cards.

### 9.14 A-19 CMS / Homepage Editor

**CMS home:** Page list, published/draft state, locale, last updated, scheduled state and action.

**Homepage editor:** Section list with drag/reorder controls, add section, edit content, replace image, configure target link, preview at mobile/tablet/desktop and save draft/publish. Use a structured block editor rather than arbitrary unrestricted code/HTML.

**Page editor:** About, FAQ, Shipping/Returns, Size Guide and other approved content. Localized content completeness is visible. Policy changes show version/effective date and may require owner approval.

### 9.15 A-20 Campaigns / Promotions

**Layout:** Campaign list/calendar, status, start/end time, affected products/collections, discount rule and usage summary. Create/edit uses clear promotion form. Show validation of conflicting/stacking rules. Require explicit approval for high-impact discounts or global promotions if configured.

### 9.16 A-21 Reports

**Layout:** Date filters, report category selector, KPI summary, chart with table alternative, breakdown and export. Label gross/net/estimated values clearly and show how values are derived. Profit metrics are hidden or labeled unavailable until costs/expenses are supplied.

### 9.17 A-22/A-23 Staff and Permissions

**Staff list:** Name, email, role, status, last active and invitation state. Actions: Invite, Edit Role, Suspend/Deactivate, Resend Invite. Invitation screen shows assigned role and permissions before sending.

**Role editor:** Predefined roles plus custom role builder. Permission groups for view/create/edit/delete/approve/export/manage. High-risk permissions (payment verification, refunds, customer data export, role management, security settings) are explicit and visually distinguished. Changes require confirmation and audit entry.

### 9.18 A-24 Activity / Audit Log

**Layout:** Searchable, filterable chronological log with actor, timestamp, action, target, result and correlation/reference ID. Detail view shows safe before/after values where appropriate. Secrets, passwords, OTP, raw private evidence and unnecessary personal information must never appear.

### 9.19 A-25 Admin Settings and Security

Grouped settings pages for Store Details, Payment Methods, Delivery Rules, Notification Channels, Localization, Team/Security, Integrations and Backup/Recovery status. Configuration states include Not Configured, Pending Verification, Active, Disabled and Error. Do not show an integration as Active until credentials and end-to-end test pass.

---

## 10. Forms, data density and content patterns

### 10.1 Form hierarchy

- Page-level title and short context.
- Group fields into named sections.
- Labels above fields.
- Helper text below only when it clarifies expected format or privacy.
- Validation message directly below the field.
- Required/optional status clearly indicated.
- Main action grouped at the end or in a safe sticky footer.
- Keep entered data on recoverable errors.

### 10.2 Error presentation

- Field error: concise and actionable, located beside the field.
- Form error: summary near the form top with links/scroll focus to invalid fields.
- System error: calm alert with reference ID and Retry/alternative action.
- Security error: generic enough to avoid exposing account/security state.
- Payment error: show order/payment status and next safe step; never label unpaid as paid.

### 10.3 Data density

Customer screens prioritize visual breathing room and simple choices. Admin screens may be denser but must maintain hierarchy:
- Use compact table rows for routine lists.
- Reserve cards for grouped KPIs and details.
- Avoid a card-within-card structure for every field.
- Use tabs/accordions for secondary detail, not to hide critical statuses or next actions.
- Keep important state and primary action in the first screenful on desktop and near the top on mobile.

### 10.4 Microcopy voice

The brand voice is calm, warm, clear and reassuring. Avoid overly technical customer messages, exaggerated luxury claims and fake urgency.

Examples:
- “Added to your bag.”
- “This size is no longer available. Choose another size to continue.”
- “Your order has been saved. Continue to WhatsApp to contact NP Wardrobe.”
- “Payment submitted for verification. Your order is not marked paid yet.”
- “We couldn't refresh your order status. Your saved order is safe; try again.”

Do not use:
- “Payment successful” before verified confirmation.
- “Order confirmed” before an authorized confirmation transition.
- “Message sent” after only opening WhatsApp.
- “Your refund is complete” before actual completion is recorded.

---

## 11. Status and feedback visual language

Order, payment, delivery and request statuses are separate dimensions and need separate labeled components.

### 11.1 Order statuses

| Status | Label style | Customer/admin language |
|---|---|---|
| Pending | Neutral/warning subtle | Awaiting confirmation |
| Confirmed | Positive/brand subtle | Confirmed by NP Wardrobe |
| Processing | Informational | Preparing your order |
| Shipped | Informational/positive | On its way |
| Delivered | Success | Delivered |
| Cancelled | Muted/destructive according to context | Cancelled |

### 11.2 Payment statuses

| Status | Visual treatment | Language |
|---|---|---|
| Unpaid | Neutral/warning | Payment not collected / awaiting payment |
| Pending Verification | Warning | Submitted; awaiting verification |
| Paid/Verified | Success | Payment verified |
| Rejected/Failed | Error | Payment could not be verified / failed |
| Refund Requested | Warning/in progress | Refund requested |
| Partially Refunded | Informational | Partially refunded |
| Refunded | Success only after completion | Refund completed |

### 11.3 Delivery/request states

Delivery statuses such as Assigned, Dispatched, In Transit, Attempted, Delivered and Failed/Returned must be shown separately from the top-level order status where the model uses both. Request states such as Under Review, More Information Requested, Approved, Rejected, Inspection, Refund Processing and Completed also remain distinct.

### 11.4 Loading, empty and offline states

- Use skeletons that match the final component structure; avoid large blank spinners.
- Empty states explain what is empty and provide a safe next action.
- Offline states explain which cached content remains visible and which actions require reconnection.
- When data is stale, show “Last updated” information where it affects decisions (inventory/order/payment).
- Do not let realtime disconnection silently leave the admin believing the data is current; show a reconnect state and refresh action.

---

## 12. Responsive behaviour

### 12.1 Mobile `<768px`

- Customer five-tab bottom navigation on main browsing/content routes.
- Header uses compact icon controls and wordmark.
- Product cards two columns by default; one-column editorial option.
- Product Details uses sticky purchase bar and compact WhatsApp trigger.
- Filter and Quick View use drawers/sheets.
- Checkout uses dedicated stepper header/back navigation; preserve input on back/forward.
- Long tables use card layout or carefully controlled horizontal scrolling.
- All tap targets aim for 44px minimum height/area.

### 12.2 Tablet `768–1199px`

- 8-column grid and wider side margins.
- Customer header may use expanded navigation if space supports it; retain accessible menu fallback.
- Product lists expand to 2–3 columns.
- Product Detail may become split gallery/info when width allows.
- Admin sidebar may collapse to icon rail or drawer depending on available width.
- Forms use two columns only where label/field grouping remains clear.

### 12.3 Desktop `1200px+`

- Centered storefront content up to 1360px.
- 12-column layout with 24px gutters and generous margin.
- Header uses full navigation; no customer bottom tabs.
- Product grid typically 3–4 columns based on content.
- Product detail uses gallery + purchase information split.
- Admin uses persistent sidebar, topbar and wide tables/charts.
- Hover states may reveal secondary actions, but all actions remain keyboard/touch accessible.

### 12.4 Safe areas and sticky elements

- Respect iOS/Android safe-area insets for bottom navigation, purchase bars, sheets and WhatsApp action.
- Do not stack multiple fixed controls in the same corner.
- In checkout, payment and form screens, hide/reposition global floating WhatsApp when it could obscure the Place Order CTA or input focus.
- Sticky elements must not obscure the last field or page footer; add corresponding content inset.

---

## 13. Accessibility and interaction requirements

The UI must meet the accessibility direction in PRD/TRD and the following practical requirements:

- All controls have accessible names, including icon-only controls.
- Keyboard focus is visible and logical; modal/drawer focus is trapped while open and restored on close.
- Menus, accordions, tabs, dialogs and status controls expose correct roles/state.
- Images have useful alt text or are marked decorative.
- Inputs have persistent labels and linked error/helper descriptions.
- Form validation is announced and focus moves to the first invalid field when appropriate.
- Minimum 44px touch target on mobile where practical.
- Text and interactive states meet sufficient contrast; use a contrast checker after final color palette approval.
- Do not convey stock/order/payment state through color alone.
- Respect browser zoom and text scaling; no fixed-height content should clip enlarged text.
- Support reduced-motion preferences.
- Tables/charts have structured headings and text/data alternatives.
- English and Nepali glyphs must render with the selected font/fallback stack; verify shaping, numerals and currency symbol display.

---

## 14. Localization and content design

Initial languages are English and Nepali. Language-specific interface and content must be designed from the beginning even if some translated content is supplied later.

- Language switcher is available from the drawer/account settings.
- Switching language preserves the equivalent route where a translation exists.
- If a page/product translation is missing, display the approved fallback language clearly rather than blank content.
- Buttons, validation messages, payment states, order statuses, admin labels and notifications must have translation keys.
- Product and CMS content supports translated title/description/SEO fields.
- Layout must tolerate longer Nepali/English strings without overflow.
- Use a suitable system fallback for Nepali script; verify glyph weight and baseline alongside the selected Latin fonts.
- Dates/times display in `Asia/Kathmandu` as appropriate; currency remains NPR.
- Do not assume automatic translation of legal/policy content is approved.

---

## 15. Privacy and trust in the interface

- Display privacy context before submitting personal delivery details or opening WhatsApp with order information.
- Public tracking requires order reference plus phone verification; do not expose customer addresses or other orders.
- Mask sensitive fields in admin list views unless the role needs them.
- Private payment proof uses a restricted viewer, not a public image URL.
- Customer support CTA may include order reference only after a relevant order has been selected/verified.
- Marketing consent is separate and optional; it is not bundled with required transactional terms.
- Never use sample testimonials, fake counts, fabricated urgency or unverified service guarantees.
- Do not display a fitting-session success modal unless an actual booking request has been accepted and persisted.

---

## 16. Prototype content and visual claims requiring confirmation

The following strings/details are visible in the Stitch screens/HTML but are not automatically approved business facts. They must be replaced with verified values or hidden before production:

- “Spring & Festive '25” and “Festive Season 2025”.
- “Flat 15% Off” and coupon `NPWARDBO15`.
- Product sample names, sizes, prices and stock values.
- Product rating averages, review counts, reviewer names and review photos.
- “Only 4 left in Kathmandu”.
- “Free Valley Express Delivery”, “Free over रु. 5,000” and similar thresholds.
- Example eSewa merchant ID `NP-WARDROBE-8821`, QR image and merchant-account name.
- Fonepay, bank wire and “Fonepay QR on delivery” references; only eSewa and COD are approved launch payment methods unless owner adds more.
- “7-Day Fit Guarantee”, 7-day exchange, free exchange and “easy returns” claims.
- Kathmandu 24–48-hour and regional 2–4-business-day delivery estimates.
- SMS/WhatsApp automatic dispatch tracking promises before providers are configured.
- Email `care@npwardrobe.com.np`, operating hours and response-time claims.
- Studio address, atelier hours, public visiting/appointment details and fitting services.
- Founding year, named founder/employee, business registration statements, customer count and purity/craftsmanship claims.
- Newsletter collection before list provider, consent and unsubscribe flow are configured.
- Private fitting booking button until a real booking workflow exists.

The CMS must not publish these as facts by default. Each requires owner-approved content/configuration.

---

## 17. Design-system implementation and component inventory

### 17.1 Shared tokens

Implement a central theme/token file with semantic variables for:
- `--color-background`, `--color-surface`, `--color-surface-muted`.
- `--color-text`, `--color-text-muted`, `--color-border`.
- `--color-primary`, `--color-primary-foreground`, `--color-secondary`.
- `--color-accent`, `--color-success`, `--color-warning`, `--color-error`, `--color-info`.
- `--color-whatsapp`.
- `--font-editorial`, `--font-ui`.
- `--radius-*`, `--space-*`, `--shadow-*`, `--container-max`.

Do not hard-code the source palette in each component. Add aliases only after token conflict resolution. Include a visual token preview page for review.

### 17.2 Shared component inventory

**Storefront:**
- AnnouncementBar
- CustomerHeader
- CustomerBottomNavigation
- CustomerSideDrawer
- SearchOverlay
- SearchSuggestions
- CategoryChip
- EditorialCategoryCard
- CollectionHero
- ProductCard
- ProductBadge
- WishlistButton
- ProductImageGallery
- ColourSwatchSelector
- SizeChipSelector
- QuantityStepper
- StockStatus
- PriceDisplay
- FilterDrawer
- SortMenu
- ViewModeToggle
- QuickViewSheet
- AddedToBagPanel
- CartItemRow
- CouponInput
- OrderSummary
- CheckoutStepper
- AddressForm
- PaymentMethodCard
- EsewaInstructionPanel
- OrderStatusTimeline
- TrackingLookupForm
- ReviewCard
- ReviewForm
- SizeGuideModal
- FAQAccordion
- WhatsAppConciergeButton
- CustomerFooter

**Customer account:**
- AccountGatewayPanel
- AuthMethodSelector
- LoginForm
- RegistrationForm
- OTPVerificationForm
- PasswordRecoveryForm
- ProfileForm
- AddressCard
- CustomerOrderCard
- RequestStatusCard
- NotificationItem
- AccountSectionNavigation

**Admin:**
- AdminShell
- AdminSidebar
- AdminTopbar
- AdminMobileDrawer
- DashboardWidget
- KPIStatCard
- AdminDataTable
- AdminFilterBar
- OrderStatusBadge
- PaymentStatusBadge
- DeliveryStatusBadge
- RequestStatusBadge
- TimelinePanel
- AuditEventRow
- ProductWizardStepper
- ProductMediaManager
- VariantEditor
- InventorySummaryCard
- StockAdjustmentDialog
- PaymentProofViewer
- PaymentVerificationPanel
- DeliveryDispatchPanel
- RequestResolutionPanel
- StaffRoleMatrix
- CMSSectionEditor
- CampaignEditor
- ReportChartPanel

### 17.3 Component state contract

Every async component must define its relevant states before implementation. At minimum:
- Loading / skeleton.
- Ready/default.
- Hover (pointer devices).
- Keyboard focus.
- Pressed/selected.
- Disabled/unavailable.
- Validation error.
- Server/network error.
- Success/completed only after persistence.
- Empty/no data where applicable.
- Stale/reconnecting where data freshness matters.

---

## 18. UI implementation handoff rules

1. Read `PROJECT_OVERVIEW.md`, `PRD.md`, `TRD.md`, `APP_FLOW.md`, this file and the source Stitch ZIP before implementation.
2. Keep the original eight source screens recognizable; do not replace them with a generic ecommerce template.
3. Resolve the typography and color-token conflicts with the owner before final visual freeze; use centralized tokens so the change is low-cost.
4. Implement the customer mobile shell exactly around the approved five-tab navigation.
5. Build the new Account Gateway, Wishlist, Search, Quick View, tracking and admin screens using the same design grammar.
6. Build admin layouts as a separate operational application, not as a reskinned customer storefront.
7. Ensure the UI reflects actual persisted state. No fake success toast, fake payment state or client-only stock change.
8. Do not expose placeholder merchant IDs, QR codes, sample coupon values, fake reviews, sample counts or unsupported business claims in production.
9. Add screenshots for mobile, tablet and desktop component/page states to the repository for future regression review.
10. Use visual regression testing for key Stitch screens after the initial implementation.
11. Verify text at 200% zoom, English/Nepali rendering, reduced motion and keyboard-only operation.
12. Keep all page-specific behavior consistent with APP_FLOW and server-side rules in TRD.
13. Any design change that affects workflow, permissions, payment or policy must be escalated to the owner and reflected in APP_FLOW/PRD/TRD as appropriate.

---

## 19. UI/UX design acceptance checklist

### Visual fidelity and brand
- [ ] Homepage, Category/Collections, Shop, Product Details, Checkout, Size Guide, FAQ and About Us retain the Stitch layout intent.
- [ ] Cream + Rose Gold brand direction is visible without overwhelming product imagery.
- [ ] Typography uses centralized tokens and final approved font choice.
- [ ] Color token conflicts are resolved and documented before production design freeze.
- [ ] Product images use consistent 3:4 card aspect ratio and accurate variant imagery.
- [ ] No sample campaign/policy/merchant/review claims remain in production.

### Navigation and responsive layout
- [ ] Five customer bottom tabs work and show correct active state on supported mobile pages.
- [ ] Hamburger drawer opens/closes accessibly and preserves route context.
- [ ] Account/profile entry changes correctly for signed-in/signed-out users.
- [ ] Product Detail sticky action, checkout stepper and WhatsApp action do not overlap.
- [ ] Mobile, tablet and desktop layouts are reviewed at the specified breakpoints.

### Components and states
- [ ] Buttons, forms, chips, badges, drawers, dialogs and accordions have consistent states.
- [ ] Loading, empty, validation, error, success and stale states are designed.
- [ ] Product variant selector clearly distinguishes selected, available and unavailable states.
- [ ] Cart/checkout displays current server-calculated totals and review-required changes.
- [ ] Order, payment, delivery and request statuses are visually distinct.
- [ ] Admin critical actions use confirmation and reason patterns.

### Accessibility, privacy and localization
- [ ] Keyboard and screen-reader interactions are supported for navigation and dialogs.
- [ ] Touch targets are at least 44px where practical.
- [ ] Contrast is verified after token reconciliation.
- [ ] English and Nepali text fit without overflow.
- [ ] Reduced-motion preference is respected.
- [ ] Sensitive tracking/payment details are not exposed by design.

---

## 20. Open design decisions for owner sign-off

These items do not block drafting the visual specification but must be resolved before the final design system is considered frozen:

1. **Heading font:** Cormorant Garamond (PRD/project brief) or EB Garamond (Stitch `DESIGN.md`). DM Sans is shared by both.
2. **Canonical brand primary:** YAML `#8a4853` vs prose Rose Gold `#B76E79`.
3. **Canonical blush surface:** YAML `#eddfdd` / `#f7ebeb` vs prose `#F2E4E2`.
4. **Canonical conversion accent:** YAML `#b5192c` / `#d83641` vs prose Crimson `#C92A38`.
5. **Canonical dark text:** YAML `#201a1a` vs prose Dark Cocoa `#292323`.
6. **Final logo/assets:** Confirm actual logo files and approved usage/clear-space rules.
7. **Newsletter:** Confirm provider, consent and unsubscribe workflow or keep hidden.
8. **Studio appointment:** Confirm whether a real fitting/booking process exists or route the CTA to WhatsApp only.
9. **Support email and hours:** Confirm actual public contact information before showing it.
10. **Verified product content:** Confirm actual prices, fit charts, photos, review content, shipping fees, policy text and any public claims.

### Recommended resolution order

- Preserve the source ZIP’s layout, spacing, imagery and component grammar immediately.
- Keep fonts and palette behind semantic tokens.
- Use the PRD as the authority when it has explicitly approved a value; where PRD and Stitch differ, retain the source candidate in a documented branch until the owner selects one.
- Do not spend time rebuilding page composition solely to resolve a font or color alias; the design system should make that change centralized.

---

## 21. Relationship to remaining project documents

| Document | Purpose | How this file relates |
|---|---|---|
| `PROJECT_OVERVIEW.md` | Business and brand brief | Provides audience, product range, market, brand direction and source context. |
| `PRD.md` | Product requirements | Defines the functions and priorities that the UI must represent. |
| `TRD.md` | Technical requirements | Defines stack, authorization, persistence and technical boundaries; UI must not bypass them. |
| `APP_FLOW.md` | Application flow | Defines routes, transitions, controls, actors, status states and recovery paths. |
| `UI_UX_DESIGN.md` | Visual and interaction design | Defines brand, layout, components, visual states and responsive behaviour. |
| `BACKEND_SCHEMA.md` | Data structure | Will define the data that screens read/write, RLS and history. |
| `IMPLEMENTATION_PLAN.md` | Build sequence | Will sequence design and implementation tasks and acceptance gates. |

If a visual treatment conflicts with a business state or security rule, the PRD/TRD/APP_FLOW take precedence. The UI must make the real state understandable; it must not hide or imply a different outcome.

---

**End of UI_UX_DESIGN v1.0**
