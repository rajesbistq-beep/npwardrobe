# NP Wardrobe — Application Flow Document (APP_FLOW)

**Document status:** Approved 50-question discovery baseline; implementation specification  
**Version:** 1.0  
**Date:** 14 November 2026  
**Product:** NP Wardrobe ecommerce website and administration system  
**Primary market:** Nepal  
**Primary currency:** NPR (`रु.`)  
**Primary visual source:** `stitch_np_wardrobe_luxury_ecommerce_experience(1).zip`  
**Related approved documents:** `PROJECT_OVERVIEW.md`, `PRD.md`, `TRD.md`

---

## 1. Purpose and authority

This document defines how every important NP Wardrobe user journey behaves: the screens users see, the controls they can operate, the decisions they make, the navigation destinations, the system responses, authorization checks, state changes, and recovery paths.

It covers:

- Mobile-first customer journeys for guest and registered shoppers.
- The eight original Stitch mobile screens and their existing prototype interactions.
- Customer authentication, account, wishlist, cart, checkout, payment and order journeys.
- Order tracking, delivery, cancellation, return, exchange, reviews and notifications.
- The separate admin portal and staff workflows.
- Product, variant, inventory, payment, order, courier and CMS management.
- Security guards, permission boundaries, error states and recovery behaviour.
- Traceability to the approved PRD and TRD.

### 1.1 Source precedence

When two sources differ, apply this precedence:

1. **Approved PRD:** Product scope, business rules, priorities and customer outcomes.
2. **Approved TRD:** Technical boundaries, security, persistence, architecture and operational safeguards.
3. **This APP_FLOW:** Screen-level interaction decisions from the 50-question interview, subject to PRD/TRD constraints.
4. **Uploaded Stitch ZIP:** Primary reference for the existing mobile visual structure, labels and prototype interaction patterns.
5. **Explicitly marked assumptions/proposals:** Must not become public business promises until the owner approves them.

This document does not replace `BACKEND_SCHEMA.md`, which will define the actual tables, keys and RLS policies, or `UI_UX_DESIGN.md`, which will define final component visuals, spacing and responsive specifications.

### 1.2 Evidence labels used in this document

| Label | Meaning |
|---|---|
| **[STITCH]** | Observed in the uploaded HTML or screenshot; describes the reference prototype, not necessarily a production-ready implementation. |
| **[APPROVED]** | Selected by the owner in the 50-question APP_FLOW discovery interview. |
| **[PRD]** | Required by the approved Product Requirements Document. |
| **[TRD]** | Required by the approved Technical Requirements Document. |
| **[PROPOSED]** | A screen, route or detailed behaviour needed to implement the approved requirement; confirm in UI_UX/schema work if it affects data or policy. |
| **[CONFIG]** | Must be supplied or configured by the owner; do not invent it. |
| **[PHASE 2]** | Approved as a future capability in the PRD/TRD; do not let it block the essential Phase 1 release. |

### 1.3 Non-negotiable flow principles

1. An order is not real until its server-side order record is committed.
2. An order must be recorded before the site attempts to open WhatsApp.
3. Opening WhatsApp does not prove that the customer sent a message or that NP Wardrobe confirmed the order.
4. A payment selection, QR display, screenshot upload or browser redirect does not prove payment success.
5. Payment state and order fulfilment state are separate.
6. A cart is not an inventory reservation. A reservation is created only by the server-side checkout/order workflow.
7. Product price, promotion, delivery charge, stock and permissions are recalculated/verified by trusted server-side logic.
8. Guest checkout remains available; customers are not forced to create an account.
9. Customer-facing status and error messages must not reveal internal security or infrastructure details.
10. Unknown merchant credentials, delivery charges, policies, dates, provider names and stock claims remain hidden or marked pending until verified.
11. Every sensitive admin operation must be authorized, validated, auditable and recoverable.
12. The visual identity follows the approved Stitch direction while typography/token conflicts are resolved separately in `UI_UX_DESIGN.md`.

---

## 2. Product and user model

### 2.1 Application areas

The application is a responsive web product with two distinct secure areas:

- **Customer storefront:** Public pages, shopping, checkout, customer accounts and support.
- **Admin portal:** Protected owner/staff operations under a distinct `/admin` area and dedicated authentication flow.

There is no approved native iOS/Android application in this scope. PWA installation and extended offline support are a later enhancement.

### 2.2 Actors

| Actor | Access and needs |
|---|---|
| Anonymous visitor | Browse public pages, search, view product information, use a local cart/wishlist and access public support content. |
| Guest shopper | All visitor capabilities plus guest checkout, order submission and verified public order lookup. |
| Registered customer | Customer profile, account order history, saved addresses, synced cart/wishlist, reviews and request management. |
| Owner / super administrator | Full business access and control of staff, settings, policies, content and integrations. |
| Order manager | Assigned order review, confirmation and permitted fulfilment actions. |
| Inventory manager | Product variants, stock, reservation visibility and stock adjustments within assigned permissions. |
| Customer support staff | Relevant customer/order support and request handling within assigned permissions. |
| Marketing/content staff | Promotions, reviews, CMS content and campaigns within assigned permissions. |
| Custom staff role | Owner-defined permissions; must not receive implicit access beyond assigned capabilities. |

### 2.3 Global navigation and application shell

#### Customer mobile shell

The existing five-item bottom navigation is preserved:

| Tab | Destination | Active state |
|---|---|---|
| Home | `/` | Home route active |
| Shop | `/shop` | Product listing/search active |
| Curated | `/curated` | Category/collection discovery active |
| Saved | `/wishlist` | Wishlist active |
| Bag | `/cart` | Shopping bag active |

Header controls on the primary storefront screens:

- **Menu icon:** Opens the premium left-side navigation drawer. [APPROVED Q3]
- **Wordmark/logo:** Returns to Home.
- **Search icon:** Opens the full-screen search experience. [APPROVED Q18]
- **Saved/heart icon:** Opens Wishlist and shows saved-item count where appropriate.
- **Shopping bag icon:** Opens Cart and shows cart quantity count.
- **Profile icon:** Opens Account Gateway when signed out or Customer Dashboard when signed in. [APPROVED Q2]

The bottom navigation is used on primary shopping and informational screens, as shown in the Stitch references. Focused checkout and authentication steps use their own reduced header/back navigation to minimize accidental abandonment; the checkout Stitch screen itself uses a back arrow and bag header rather than the five-tab bar. Modal/drawer overlays do not create a second navigation bar.

#### Global floating WhatsApp action

- Appears on supported customer-facing routes.
- Opens `https://wa.me/9779740258617` for generic support.
- Context-specific actions create an appropriate prefilled message (product enquiry, sizing help, order support) without falsely claiming a transaction occurred.
- Must not obscure sticky product actions, form controls, bottom navigation or keyboard focus.
- Hide or reposition where it would overlap checkout/payment actions.

#### Premium side navigation drawer [APPROVED Q3]

Opens from the left. It contains, at minimum:

- Account entry (Login / Create Account or signed-in customer name/account).
- Shop All.
- Expandable main categories and subcategories.
- Curated Collections.
- New Arrivals and Best Sellers where published.
- Saved/Wishlist.
- Shopping Bag.
- My Orders / Track Order.
- Size Guide.
- About Us.
- FAQ / Help.
- Shipping, Returns and Exchanges policies.
- Contact / WhatsApp Concierge.
- Language selector (English / Nepali).

Drawer interactions:

- Menu button opens drawer and moves focus into it.
- Close button, backdrop tap or Escape closes it.
- Category accordion expands/collapses without navigating until a child item is selected.
- Selecting an item closes drawer and navigates to the selected route.
- Current route is visibly marked.
- Account-dependent entries show the correct signed-in/signed-out state.
- Drawer content is scrollable on short screens; page behind it is not scrollable while open.

### 2.4 Route map

The following route patterns are the logical flow map. The final locale prefix and exact route naming can be standardized during implementation; they must not change the journey or authorization rules.

| Area | Proposed route | Screen |
|---|---|---|
| Storefront | `/` | Home |
| Storefront | `/shop` | Shop All Products |
| Categories | `/categories` | Category discovery |
| Category | `/categories/[slug]` | Dedicated category page |
| Curated | `/curated` | Curated category/collection landing |
| Collection | `/collections/[slug]` | Editorial collection page |
| Product | `/products/[slug]` | Product Details |
| Wishlist | `/wishlist` | Saved products |
| Cart | `/cart` | Shopping Bag |
| Checkout | `/checkout` | Three-step checkout state: Review → Delivery → Payment |
| Confirmation | `/order-confirmation/[reference]` | Saved order summary and handoff |
| Public tracking | `/track-order` | Order ID + phone lookup |
| Public tracking detail | `/track-order/[reference]` | Verified tracking detail state |
| Auth | `/account` | Account Gateway / signed-in account entry |
| Auth | `/auth/login` | Login options |
| Auth | `/auth/register` | Registration |
| Auth | `/auth/verify` | Phone/email verification |
| Auth | `/auth/forgot-password` | Recovery request |
| Auth | `/auth/reset-password` | Password reset |
| Customer | `/account/dashboard` | Customer Dashboard |
| Customer | `/account/profile` | Profile and preferences |
| Customer | `/account/addresses` | Address Book |
| Customer | `/account/orders` | Order History |
| Customer | `/account/orders/[reference]` | Customer Order Details |
| Customer | `/account/requests` | Cancellation/return/exchange requests |
| Customer | `/account/notifications` | Notification Centre |
| Reviews | `/products/[slug]/reviews/new` | Write Review (eligible customer) |
| Content | `/size-guide` | Size Guide |
| Content | `/faq` | FAQ and help search |
| Content | `/about` | About Us |
| Content | `/contact` | Contact / concierge |
| Content | `/shipping-returns` | Shipping, cancellation, return and exchange policies |
| Admin | `/admin/login` | Dedicated Admin Login |
| Admin | `/admin/mfa` | Admin MFA challenge |
| Admin | `/admin` | Admin Dashboard |
| Admin | `/admin/orders` | Order queue |
| Admin | `/admin/orders/[id]` | Admin Order Details |
| Admin | `/admin/products` | Product catalogue |
| Admin | `/admin/products/new` | Product creation wizard |
| Admin | `/admin/products/[id]` | Product editor |
| Admin | `/admin/inventory` | Inventory overview |
| Admin | `/admin/inventory/[variantId]` | Variant stock detail/history |
| Admin | `/admin/import-export` | Product import/export |
| Admin | `/admin/payments` | Payment queues |
| Admin | `/admin/payments/[id]` | Payment detail and verification |
| Admin | `/admin/deliveries` | Delivery/dispatch queue |
| Admin | `/admin/requests` | Cancellation/return/exchange queue |
| Admin | `/admin/requests/[id]` | Request resolution |
| Admin | `/admin/customers` | Customer directory |
| Admin | `/admin/customers/[id]` | Customer details (permission-limited) |
| Admin | `/admin/reviews` | Review moderation |
| Admin | `/admin/content` | CMS pages and sections |
| Admin | `/admin/campaigns` | Promotions/campaigns |
| Admin | `/admin/reports` | Business reports |
| Admin | `/admin/staff` | Staff directory/invitations |
| Admin | `/admin/roles` | Role and permission editor |
| Admin | `/admin/activity` | Audit/activity history |
| Admin | `/admin/settings` | Store, integration and security settings |

---

## 3. Original Stitch reference audit

The uploaded archive contains eight screen directories, each with `code.html` and `screen.png`, plus `np_wardrobe/DESIGN.md`:

1. `np_wardrobe_homepage`
2. `np_wardrobe_category_collections`
3. `np_wardrobe_shop_all_products`
4. `np_wardrobe_product_details`
5. `np_wardrobe_shopping_bag_checkout`
6. `np_wardrobe_size_guide`
7. `np_wardrobe_faq_shipping`
8. `np_wardrobe_about_us`

### 3.1 Prototype interactions observed

| Source screen | Observed controls / behaviours in the HTML prototype | Production treatment |
|---|---|---|
| Homepage | Menu, search, saved, bag, profile icon; hero CTA; category links; featured product cards; favourite icons; Add to Bag labels; coupon Copy; WhatsApp CTA; newsletter Join; footer links; bottom navigation. | Preserve information hierarchy. Wire all controls to real routes/services. Newsletter requires approved consent/list handling before activation. |
| Category & Collections | Category chips (All Editions, Western Chic, Ethnic Couture, Casual Luxe, Evening Glam, Accessories); collection cards; favourite icons; Explore Collection/View links; festive lookbook CTA; stylist WhatsApp. | Preserve category/collection discovery. Main categories route to dedicated pages; special campaigns route to editorial collections. |
| Shop All Products | Category chips, filter drawer, sort choices, grid/list toggle, applied filter chips, size buttons, price range, occasion filters, Reset All, Show Results, Load More, product favourite, Add and Chat controls. | Existing JS toggles some presentation states; production must implement real query/filter/sort/pagination, persistent view preference and actual cart/wishlist actions. |
| Product Details | Gallery navigation, share button, wishlist icon, colour pills, size chips, Size Guide modal, quantity controls, subtotal, Add to Shopping Bag toast, Order Now via WhatsApp, Write Review, related Quick Add cards. | Preserve and extend. Variant data, stock, pricing and cart actions must be server-authoritative. Add approved Quick View and full-screen gallery behaviours. |
| Shopping Bag & Checkout | Back, search, bag count; delete; quantity minus/plus; coupon input and Apply; customer name/phone/city/address/notes; payment selector; eSewa details and merchant ID Copy; Place Order via WhatsApp; SMS/Call Support link. | Replace hard-coded sample order and direct client-side WhatsApp generation with validated three-step checkout, durable order creation, stock reservation and safe WhatsApp handoff. SMS/Call is not an approved order channel unless separately enabled. |
| Size Guide | Inches/CM switch; standard size matrix; fit guidance; measuring instructions; WhatsApp consult. | Preserve switch and measurement content structure. Admin-managed/product-specific measurements must be verified before publication. |
| FAQ & Shipping | FAQ search, clear button, category chips, expandable accordions, empty state and Reset Search; WhatsApp support; sample email concierge. First FAQ opens by default. | Preserve search, filtering and accordion. FAQ copy/policies are content-managed and must not contain unapproved service claims. Support email/hours only when confirmed. |
| About Us | Brand story/editorial sections; values; studio/address/hours details; WhatsApp stylist; Book Private Fitting Session button that triggers a temporary “request received” toast. | Preserve editorial layout. Address, hours, origin claims and figures require owner verification. Fitting button must route to an actual approved booking flow or a WhatsApp enquiry; do not display a success toast that implies a booking was recorded. |

### 3.2 Specific prototype limitations and unsafe sample content

The HTML files are visual prototypes, not production integrations. The following behaviour is explicitly not accepted as final production logic:

- The homepage, category links and many footer links use placeholder `href="#"` destinations.
- The product details JS initializes a fixed sample price (`5600`), selected size `M`, and a quantity bound of 1–10. It changes gallery position, selected-size text, quantity/subtotal display, a heart icon and a toast, but does not connect to live variant inventory, server price or a persisted wishlist/cart.
- The product colour selection changes the selected shade label and swatch styling; it does not perform a full variant lookup for imagery, SKU, price or availability.
- The Shop JS toggles grid/list CSS, opens/closes the filter modal, changes category-chip styling and changes an Add button to an “Added” label temporarily. It does not implement a production search/filter API, stock validation, cart persistence or wishlist backend.
- The checkout JS builds a WhatsApp message from hard-coded sample products and amounts, allows missing name/phone/address values to fall back to placeholder strings, and directly opens WhatsApp. It does not create a durable order, reserve stock, calculate totals from current database data, verify payment or prevent duplicates.
- The checkout prototype includes sample merchant ID `NP-WARDROBE-8821` and sample data. This is not an approved production credential. The Copy action must copy only the owner-supplied, verified merchant ID.
- The checkout prototype has an SMS/Call Support action. This is not the approved core order workflow; the approved channel is the server-recorded order followed by WhatsApp handoff.
- The FAQ JS does implement local accordion expansion, category selection, text matching, clear/reset and empty-state display. This is prototype interaction logic and must be populated with approved, current business content.
- The Size Guide JS switches cell values using `data-val-in` and `data-val-cm` attributes and toggles pressed states. This is a real in-page prototype interaction, but sample measurements/fit claims still need owner validation.
- The About page fitting-session button only displays a temporary toast. It does not create an appointment, notify an operator or persist a request.
- The sample ratings/review counts, product prices, review testimonials, stock quantities, “only 4 left” messaging, delivery ETAs, courier prices, “free delivery above रु. 5,000”, 15% promotion/coupon, “7-day fit guarantee”, exchange policy, support hours, sample email, merchant ID, Fonepay, bank transfer, address, studio hours, client counts and founding/story claims are example content unless separately approved.

**Production rule:** Preserve the visual concepts, but replace prototype shortcuts and placeholder business facts with real services, configured data and server-side workflows.

---

## 4. Screen and interaction specification — customer application

Each screen below identifies its purpose, visible controls, navigation, system response and important guards. Exact visual measurements and component styling belong in `UI_UX_DESIGN.md`.

### C-01 — Homepage

**Entry:** Logo/Home tab; default storefront route `/`.

**Reference:** `[STITCH] np_wardrobe_homepage`.

**Content regions:**
- Promotional announcement strip (only when an active, verified promotion/policy exists).
- Header with Menu, NP Wardrobe wordmark, Search, Saved, Bag and Profile.
- Hero/editorial banner and primary CTA (prototype copy: “Elegance Redefined: Spring & Festive”).
- Explore By Style category tiles: Western Wear, Ethnic & Kurtis, Casual Luxe, Party & Evening and Accessories.
- New Arrivals/featured products with price, product badge, rating if real, wishlist and Add to Bag.
- Curated campaign/promotional section.
- Brand promise/service information.
- Approved customer reviews/social lookbook where data and consent exist.
- WhatsApp ordering/support CTA.
- Newsletter/subscribe block only if provider, consent, privacy and unsubscribe flow are configured.
- Footer links: collections, size guide, About, Shipping, Returns, Contact.
- Floating WhatsApp action and five-item bottom navigation.

**Interactions:**

| Control | Customer action | System response / transition |
|---|---|---|
| Logo/Home | Tap | Navigate to `/`; return scroll position to top on explicit Home tap. |
| Menu | Tap | Open C-02 drawer; lock background scroll. |
| Search | Tap | Open C-03 full-screen search. |
| Saved | Tap | Open C-10 Wishlist; prompt authentication only for account-only actions, not for basic guest browsing. |
| Bag | Tap | Open C-11 Shopping Bag. |
| Profile | Tap | Signed out → C-19 Account Gateway; signed in → C-24 Customer Dashboard. |
| Hero CTA | Tap | Navigate to configured destination, typically `/shop` or a published collection; do not hard-code seasonal campaign destination. |
| Category tile | Tap | Navigate to C-05 category page. |
| View All | Tap | Navigate to Shop or curated landing based on section label. |
| Product image/title | Tap | Navigate to C-07 Product Details. |
| Product heart | Tap | Toggle wishlist. Guest: persist locally. Signed in: persist account wishlist. Show login prompt only if user chooses account sync or a protected action. |
| Add to Bag | Tap | If required variant is unresolved, open Quick View/variant picker. Otherwise validate and add selected variant; show C-08 confirmation panel. |
| Coupon Copy | Tap | Copy visible active coupon code; announce success. If clipboard permission fails, select/show code for manual copy. Do not imply discount is applied until checkout validates it. |
| Chat to Order / WhatsApp | Tap | Open WhatsApp with contextual greeting or order enquiry. No order record is created by a generic homepage enquiry. |
| Newsletter Join | Submit | Validate email and consent; only activate when a compliant mailing-list integration is configured. Otherwise keep disabled/hidden or show “coming soon”; do not silently collect data. |
| Footer links | Tap | Navigate to relevant content routes. |
| Bottom tabs | Tap | Navigate to Home, Shop, Curated, Saved or Bag and update active state. |

**States:** Initial loading, content loaded, empty promotional section (hide section), product-load failure, no featured products, clipboard failure, offline banner, and generic service error with Retry.

### C-02 — Premium left navigation drawer

**Entry:** Menu control from customer shell.

**Controls and behaviour:**
- Close button / backdrop / Escape: close drawer and return focus to Menu.
- Account block: signed out opens Account Gateway; signed in opens dashboard/profile shortcut.
- Expandable category group: expand/collapse child links; selecting a child navigates to its category page.
- Collections links: navigate to curated/editorial pages.
- Saved, Bag, Orders, Tracking: navigate to relevant route.
- Size Guide, About, FAQ, Shipping & Returns, Contact: navigate to content pages.
- Language control: switch English/Nepali while keeping the equivalent route where translation exists; fallback to localized Home or nearest available page when it does not.

**System rules:** Drawer must be keyboard and screen-reader accessible, scroll independently, prevent page scroll behind it, show current selection and avoid exposing admin links to customer sessions.

### C-03 — Full-screen Search

**Entry:** Search icon from header or supported search entry point.

**Initial state:** Search field focused; recent searches and trending searches displayed when available; popular categories displayed below.

**Controls:**
- Search input: submit on Enter or select a live suggestion.
- Clear: empty query and restore discovery suggestions.
- Recent search item: run search.
- Remove recent item / Clear history: remove local/account search history according to privacy preference.
- Trending query: run search.
- Category shortcut: navigate to category page.
- Product suggestion: open Product Details.
- Close/back: return to previous route and preserve prior scroll position.

**Search response:** Query products by configured searchable fields; support product name, category, colour, size, text synonyms and approved typo tolerance. Show loading, result count and product suggestions. Search requests are debounced; stale responses must not overwrite a newer query.

**No results:** Show “No matching products found”, preserve query, offer Clear Search, related categories and approved recommendations. Do not generate misleading recommendations if there is no relevant catalogue content.

**Privacy:** Do not send personal information in search analytics. Search history is a user preference and must be clearable.

### C-04 — Shop All Products

**Entry:** Shop bottom tab, menu Shop All, Home View All, search result CTA.

**Reference:** `[STITCH] np_wardrobe_shop_all_products`.

**Main components:**
- Page title / collection subtitle.
- Category chips (prototype: All, Western Wear, Ethnic Wear, Casual Wear, Partywear).
- Search entry.
- Filter count and Filters control.
- Sort dropdown/control.
- View toggle: two-column grid / one-column editorial list.
- Applied filter chips and Clear All.
- Product cards with image, badge, wishlist, product title, fabric, size/fit labels, current/sale price, Quick View/Add and Chat action.
- Load More or pagination control.
- Empty and loading states.

**Interactions:**

| Control | Action | System response |
|---|---|---|
| Category chip | Tap | Update category query and product results; active chip updates. Preserve unrelated filters unless category selection makes them invalid. |
| Filter count / Filters | Tap | Open filter drawer with current selection preloaded. |
| Sort | Tap | Open sort options (Featured, Newest, Price Low–High, Price High–Low; other modes only if configured). |
| Grid toggle | Tap | Render 2-column product grid; save last choice for that user/device. |
| List toggle | Tap | Render single-column editorial view; save last choice. |
| Active filter chip X | Tap | Remove only that filter and refresh results. |
| Clear All | Tap | Reset category-dependent filters and sort to approved default; keep search query only if design specifies it, otherwise show explicit reset scope. |
| Product image/name | Tap | Open C-07 Product Details. |
| Product card quick action | Tap | Open C-08 Quick View if variant choice is needed. Do not add a size-dependent variant using an unselected/default size. |
| Heart | Tap | Toggle local/account wishlist and update icon/count. |
| Chat | Tap | Open WhatsApp product enquiry using product identity and page link. Does not reserve stock/create order. |
| Load More | Tap | Load next results page; append without duplicating previously displayed product IDs. |

**Filter drawer:**
- Sort selection.
- Size selection (XS, S, M, L, XL, XXL, Free Size as applicable to the selected products).
- Colour filter.
- Price range in NPR.
- Availability filter.
- Occasion/collection filters where configured (the reference includes Festive/Wedding, Cocktail Evening, Everyday Chic, Work & Formal).
- Live result count.
- Reset All.
- Apply Filters.

**Filter behaviour:** Selections are staged within the drawer; result count updates as the customer changes selections where feasible. Apply commits selected filters and closes drawer. Reset clears staged selections to default. Closing without applying discards staged changes. Removable filter chips appear on Shop after apply. The selected sort/filter state must remain consistent while opening/closing Quick View or Product Details and returning.

**Errors:** Search/filter service error → preserve current query/selection and show Retry. No results → empty state with Clear Filters. Product discontinued while browsing → remove from visible results on refresh and explain if customer tries to open it.

### C-05 — Main Category Page

**Entry:** Category tiles/chips from Home, Curated, drawer or search.

**Reference:** Category content and image tiles are visible in `[STITCH] np_wardrobe_category_collections`; dedicated category-page behaviour is an approved enhancement.

**Content:** Category hero banner, title/description, subcategory chips or cards, curated sub-collections, product count and product grid/list controls, filters/sort, and optional editorial content.

**Interactions:**
- Back/breadcrumb → parent category or previous route.
- Subcategory → update category route/filter and show its product listing.
- Product card → Product Details.
- Quick View → Quick View panel.
- Filter/sort/grid/list → same behaviour as C-04.
- Category favourite/heart → save category/collection if that capability is enabled; otherwise do not render an inert heart.

**Empty category:** Show editorial empty state and adjacent categories; admin is prompted through content/merchandising review if a published category contains no available products.

### C-06 — Curated / Editorial Collection Page

**Entry:** Curated tab, category/collection card or campaign link.

**Reference:** `[STITCH] np_wardrobe_category_collections` includes All Editions, Western Chic, Ethnic Couture, Casual Luxe, Evening Glam, Accessories, The Wedding & Teej Curation, a festive lookbook and stylist CTA.

**Content:** Collection hero, editorial description, collection imagery, sub-edits/occasion chips, curated products and styling support CTA.

**Interactions:**
- Collection chip/card → selected collection.
- Explore Collection/View → collection route with configured product set.
- Festive Lookbook CTA → published lookbook route or collection section.
- Product card → Product Details/Quick View.
- WhatsApp stylist CTA → context-rich stylist enquiry.
- Back → previous route or Curated landing.

**Content accuracy:** Seasonal names, offers, dates, editorial copy and product counts must be controlled through CMS. Do not preserve expired “Spring & Festive '25” or “Festive Season 2025” copy as live by default.

### C-07 — Product Details

**Entry:** Product card/title, search suggestion, Quick View “View full details”, wishlist item.

**Reference:** `[STITCH] np_wardrobe_product_details`.

**Main content:**
- Back control and page title.
- Product gallery with image counter and thumbnail selection.
- Share action.
- Wishlist heart.
- Product badge/discount only when valid.
- Product name, description, fabric/quality details and current price.
- Original price/discount where valid.
- Selected colour/shade.
- Size choices and selected size/fit text.
- Size Guide control.
- Quantity control.
- Variant availability/stock messaging.
- Product details, fabric/care and shipping/payment accordions.
- Reviews and rating summary when actual approved reviews exist.
- Related products / Complete the Look.
- Sticky mobile price/quantity/Add to Bag bar where appropriate.
- WhatsApp product consultation and explicit Order Now enquiry action.

**Interaction details:**

| Control | Behaviour | Validation/system response |
|---|---|---|
| Back | Return to prior page | Restore Shop search/filter/scroll state where possible. |
| Gallery swipe | Move previous/next | Keep active index and image counter synchronized. |
| Thumbnail | Select image | Update main image and active thumbnail. |
| Fullscreen/zoom | Open image viewer and zoom | Close returns to same gallery index. Respect device gestures and accessibility controls. |
| Share | Open native share or copy canonical product link | If share unavailable, provide Copy Link fallback. |
| Wishlist heart | Toggle saved product | Persist guest local or registered account state; announce Added/Removed. |
| Colour swatch | Select colour variant | Update selected colour, corresponding images, valid sizes, SKU, price and stock. Clear an incompatible selected size. |
| Size chip | Select size | Select a currently purchasable size for the chosen colour; show fit details if stored. Disabled unavailable sizes. |
| Size Guide | Open C-09 modal | Show product-specific chart where provided. Link to C-10 full guide. |
| Quantity minus/plus | Decrement/increment | Enforce minimum 1 and maximum based on available stock and configured quantity cap. Prototype sample limit of 10 is not a production rule unless approved. |
| Add to Shopping Bag | Validate variant + stock and add to cart | If no required size/colour selected, focus relevant selector and show inline prompt. If valid, show C-08 confirmation. |
| Order Now via WhatsApp | Open product enquiry | Include product name, product URL, chosen size/colour if selected, price/quantity and contextual enquiry. It is not an order submission and must not reserve stock. |
| Expand product details | Expand/collapse section | Preserve current variant and page scroll. |
| Write Review | Open review form if eligible | Ineligible customer sees purchase/eligibility guidance, not an unrestricted public review form. |
| Related product Quick Add | Open Quick View when variant selection required | Never silently use a default size. |

**Stock display:** Use a truthful state derived from current inventory. Do not show the prototype’s “Only 4 left in Kathmandu” or any location-specific stock promise unless backed by current stock/serviceability data and explicitly approved.

### C-08 — Quick View / Quick Shopping Panel

**Entry:** Quick View action from Shop, Wishlist, Related Products or category page.

**[APPROVED Q7–Q8]** It is an overlay/bottom sheet on mobile that allows a quick purchase decision without leaving the listing page.

**Content:** Image gallery/preview, product name, price, description, colour choices, size choices, quantity, SKU/availability indication, stock message, size-guide access, delivery information link, Add to Bag, Wishlist and View Full Product.

**Actions:**
- Close/backdrop/Escape → close and return to prior listing state.
- Colour/size → same variant-resolution rules as C-07.
- Quantity → validate against available stock.
- Add to Bag → validate selected variant, add to cart, display C-08A confirmation, close/retain panel according to the final UI design. Keep listing scroll and filters intact.
- View Full Product → navigate to C-07 with same product/variant selection where possible.

**Error:** If the product is unpublished or unavailable, disable purchase action and provide a safe return to the listing. If stock changes while panel is open, revalidate before Add.

### C-08A — Added to Bag Confirmation Panel

**Entry:** Successful Add to Bag from Product Details, Quick View or product card after all required variant selections are resolved.

**Panel content:** Product image/name, selected size, selected colour, quantity, unit price and line total; cart count updated.

**Buttons:**
- **Continue Shopping:** Close panel and preserve current route/scroll.
- **View Bag:** Navigate to C-11 Cart.
- **Close:** Dismiss panel; cart item remains saved.

**System response:** Persist cart locally for guest or to the account cart for signed-in user. Display accessible success announcement. If persistence fails, show a recoverable error and do not claim that the item was saved.

### C-09 — Product Size Guide Modal

**Entry:** Size Guide link from Product Details or Quick View.

**Content:** Product-specific chart when available; measurement units; brief fit note; link to full C-10 Size Guide; WhatsApp sizing-help action.

**Controls:** Close icon, backdrop, Escape, View Full Guide and Consult Stylist. Return focus to the Size Guide link after closing.

**Rule:** If product-specific measurement is missing, show general guide with a clear label that it is a general guide, not a guaranteed fit recommendation.

### C-10 — Full Size Guide Page

**Entry:** Menu/footer or Size Guide link.

**Reference:** `[STITCH] np_wardrobe_size_guide`.

**Content:** “Find Your Perfect Silhouette”, unit selector, standard size matrix, fit explanations, measurement instructions, bespoke/fit support content if approved, and WhatsApp stylist contact.

**Controls:**
- Inches (in) / Centimeters (cm): switch every measurement cell to its corresponding stored value and update `aria-pressed`/selected state.
- Product type/style tabs, if configured: display the corresponding product fit guidance.
- Consult Stylist on WhatsApp: open a prefilled sizing enquiry.
- Back/bottom navigation: return to previous route or use primary navigation.

**System response:** Unit conversion display must use stored approved values or exact conversion with consistent rounding. Do not convert placeholder or unverified measurements into a public sizing guarantee.

### C-11 — Wishlist / Saved

**Entry:** Saved bottom tab, header heart, drawer entry, account dashboard.

**[APPROVED Q14–Q16]** Flexible saved-product experience with two-column grid/list toggle, availability and price-change labels, Quick View, remove, move to bag and a smart empty state.

**Guest behaviour:** Persist to local browser storage; do not require account creation to save a hearted product.

**Signed-in behaviour:** Persist to customer account and synchronize across devices.

**Guest-to-account merge:** On login/register, merge guest items with the account wishlist by stable product/variant reference; avoid duplicates and then synchronize. If product is unpublished/deleted, keep an unavailable notice or remove according to a transparent cleanup rule; do not add unavailable products to cart.

**Controls:**
- Grid/list toggle: switch presentation and remember preference.
- Product/title: Product Details.
- Quick View: C-08.
- Remove heart/button: remove item and update count.
- Move to Bag: request colour/size selection when required; validate stock; add selected variant and show confirmation.
- Price/stock notice: refresh product data; alert customer to current value without silently changing cart.

**Empty state:** Fashion-themed empty state, Explore Collections, New Arrivals, Best Sellers and relevant product suggestions when enough preference/browsing signals exist. Do not create fabricated personalization.

### C-12 — Shopping Bag / Cart

**Entry:** Bag bottom tab, header bag, Add to Bag confirmation View Bag, Account dashboard shortcut.

**Reference:** `[STITCH] np_wardrobe_shopping_bag_checkout`.

**Content:** Product rows; thumbnail; product name; selected colour/size; unit price; quantity control; remove control; coupon input; subtotal; discount; delivery-charge status; total; Continue Shopping; Proceed to Checkout.

**Actions:**
- Back/Continue Shopping → return to prior shopping route or Shop.
- Plus/minus → update quantity; server/client guard against values below one or above currently available/allowed quantity.
- Delete → confirmation when appropriate; remove line and recalculate.
- Coupon Apply → validate code, eligibility, dates, limits and stacking on server; show applied/rejected state and exact amount.
- Remove coupon → remove discount and recalculate.
- Proceed to Checkout → run cart validation before opening C-13 Review step.

**Smart cart validation [APPROVED Q13]:**
- Refresh current product/variant, price and stock at checkout entry and again at order submission.
- Identify each changed item individually.
- Show original/current price or available quantity where useful.
- Allow quantity reduction or removal.
- Recalculate coupon eligibility, subtotal, delivery and total.
- Require the customer to review changes before continuing.
- Never silently remove an item or charge an old price.

**Empty state:** “Your bag is empty” with Shop/Explore CTA. No checkout CTA.

**Persistence:** Guest cart in localStorage; signed-in cart in account storage; merge at authentication. Cart contents are not stock reservations.

### C-13 — Checkout Step 1: Review

**Entry:** Proceed to Checkout from C-12.

**Progress indicator:** Review → Delivery → Payment, with step 1 active.

**Content:** Order item list, variant selections, quantities, unit/line prices, coupon and discount, subtotal, stock/price validation status, estimated delivery/fee only if calculable, and total breakdown.

**Controls:**
- Edit Cart → C-12.
- Quantity/edit variant if supported → return to Cart/Product selection; revalidate.
- Continue to Delivery → validate all order lines and navigate to C-14.
- Back → C-12.

**System responses:** If an item becomes unavailable or price changes, keep customer on Review and show required action. If cart is empty, redirect to Cart empty state. If server cannot validate, preserve cart and provide Retry; do not create order.

### C-14 — Checkout Step 2: Delivery

**Progress indicator:** Review complete; Delivery active; Payment pending.

**Fields:** Recipient full name, phone (`+977` handling), province, district, municipality/rural municipality, ward number, street/house address, landmark, optional delivery instructions, saved-address selector for registered customers, save-as-address/default-address controls where applicable.

**Controls:**
- Saved Address selector → populate fields; user can edit before continuing.
- Add New Address → show structured address form.
- Back to Review → C-13 without losing entered data.
- Continue to Payment → validate required fields, phone and serviceability; compute location-based fee only from configured rules.

**Validation:**
- Required name, valid phone, required address hierarchy and complete delivery details.
- Municipality/ward values must be valid according to configured address dataset or allowed free-text fallback.
- Delivery region must be serviceable under current admin settings.
- If fee cannot be determined, show a clear “delivery fee requires confirmation” state and follow owner-configured confirmation process; never invent fee or ETA.
- Guest may continue without saving an account address.

**Error:** Invalid phone/field → inline error and focus. Unserviceable area → explain and offer address correction/WhatsApp support. Network failure → preserve fields and allow retry.

### C-15 — Checkout Step 3: Payment

**Progress indicator:** Review and Delivery complete; Payment active.

**Content:** Final order summary, recipient/address summary, delivery charge, coupon/discount, total payable, payment choice and relevant terms.

**Payment choices:** COD and eSewa only when currently enabled for the order/location. Any advance-payment rule must be configured and clearly displayed. Bank transfer, Fonepay or other methods from Stitch sample content are not enabled unless owner separately approves and configures them.

**Controls:**
- Change Delivery → C-14.
- Change Order → C-13/C-12.
- Select COD → show relevant configured COD conditions/advance requirement.
- Select eSewa → show guided eSewa instructions state (C-16).
- Submit Order → server-side final revalidation; create durable order and stock reservation transactionally; prevent duplicate submissions.

**Before final submit:** Show final customer, address, order items and price summary. Require explicit confirmation action. Payment/order states follow C-16 onward.

### C-16 — eSewa Guided Payment Instructions (Phase 1 manual workflow)

**Entry:** eSewa selected on C-15.

**Precondition:** Real, verified eSewa merchant information and QR supplied by owner. If unavailable, do not show a fake/sample merchant QR or permit payment submission; show “eSewa payment is temporarily unavailable” and allow the customer to choose COD if eligible or contact support.

**Sequence:**
1. Customer confirms final order submission.
2. Server revalidates cart/pricing/address/payment eligibility.
3. Server atomically creates order + item snapshots + payment record + active stock reservation.
4. Customer receives order reference and order-saved state.
5. Show genuine merchant ID, QR and payment instructions.
6. Customer pays through eSewa outside the website.
7. Customer returns and enters transaction/payment reference and optionally uploads payment proof (based on owner configuration).
8. Server stores proof privately and marks payment `pending_verification`.
9. Customer proceeds to WhatsApp handoff and shares order reference/payment information.
10. Admin later verifies transaction amount/reference and records decision.

**Controls:** Copy Merchant ID, View/Download QR, Enter Payment Reference, Upload Proof (if enabled), Submit Payment Details, Contact WhatsApp and Continue.

**System responses:** Copy success/failure accessible announcement; upload progress; accepted proof confirmation; duplicate reference warning; file validation errors; pending verification state; safe retry. The order and reservation must not be duplicated when payment details are resubmitted.

**Important:** A screenshot/reference is evidence submitted for review, not automatic payment proof. Payment becomes paid only after authorized verification or a trusted future gateway confirmation.

### C-17 — COD Order Submission

**Entry:** COD selected on C-15.

**Sequence:**
1. Server checks COD enabled for address, amount and product restrictions.
2. Server calculates any configured advance amount and balance.
3. Customer reviews total, delivery address and COD terms.
4. Server creates order/payment record and reserves stock atomically.
5. Customer receives order reference and saved-order confirmation.
6. Customer is offered prefilled WhatsApp handoff.
7. Admin reviews and manually confirms the order.
8. Fulfilment proceeds; COD remains unpaid until amount is collected and recorded.

**If COD unavailable:** Explain why without exposing internal risk flags; allow eligible alternative eSewa or edit delivery details. No order is created until a valid submission occurs.

### C-18 — Order Confirmation / WhatsApp Handoff

**Entry:** Successful order transaction from eSewa or COD.

**Page content:**
- “Order saved” state and unique reference.
- Product/variant/quantity summary.
- Subtotal, discount, delivery fee and total.
- Payment method and payment state (e.g. Pending Verification or Unpaid/COD).
- Recipient/delivery summary with appropriately masked details when public/guest.
- Order timeline with current state.
- WhatsApp contact / Continue on WhatsApp CTA.
- Track Order CTA.
- Continue Shopping CTA.
- Explanation that opening WhatsApp is separate from sending the message and separate from admin confirmation.

**WhatsApp handoff:**
- Create message from saved order data, not from stale client cart data.
- Include order reference, customer name, phone, delivery address, line items with variants/quantity/prices, subtotal, discount, delivery fee, total and selected payment method; include eSewa reference/status only when submitted.
- Encode content safely and open `https://wa.me/9779740258617`.
- Do not say message delivered/sent, order confirmed or payment approved based solely on link opening.
- If browser blocks popup or WhatsApp is unavailable, keep order saved, show copy-message/copy-order-reference fallback where safe and provide contact instructions.

### C-19 — Public Order Tracking Lookup

**Entry:** Drawer, FAQ, footer, confirmation or direct `/track-order`.

**Fields:** Order reference/ID and phone number used on the order.

**Action:** Track Order.

**System:** Rate-limit attempts; validate format; compare reference and phone through a protected server operation; return minimal generic failure if details do not match. Do not reveal if an order reference exists for a different phone number.

**On success:** Navigate to C-20 tracking detail. Never place private order data in URL query strings or analytics.

### C-20 — Order Tracking Detail

**Content:** Order reference, current order status, order timeline with timestamps, payment state, product/order summary, delivery address (appropriately protected), courier name, tracking number/link where provided, verified estimated delivery only when available, WhatsApp support and eligible request actions.

**Actions:**
- Refresh status → request current persisted state.
- Courier tracking link → open provider's verified tracking URL in safe external context.
- Request Cancellation → C-27 if eligible.
- Return/Exchange → C-28 if eligible.
- WhatsApp Support → open context-specific support enquiry.

**Security:** Public lookup session should expire after a configured period and should not grant access to unrelated account data. Authenticated customers can view full details through their account.

### C-21 — Account Gateway

**Entry:** Profile icon/menu Account while signed out.

**Options:** Login, Create Account, Phone OTP, Email/Password, Google Login (only when configured), Continue as Guest.

**Return path:** Preserve the customer's originating route, intended action, cart, wishlist and checkout data. After successful authentication, return to the intended destination. Do not discard guest cart or wishlist.

**Close/back:** Return to previous route.

### C-22 — Customer Login

**Methods:** Email/password, phone OTP, Google OAuth where enabled.

**Actions:**
- Enter email/phone/credentials.
- Submit Login / Send OTP.
- Resend OTP after cooldown.
- Forgot Password → C-25.
- Create Account → C-23.
- Continue as Guest → return to requested public shopping flow.

**Responses:** Invalid credentials use non-enumerating error wording; OTP expired/incorrect/too many attempts show specific safe recovery; Google redirect failure offers retry or another configured method. Rate limits and CAPTCHA/abuse controls apply when configured.

### C-23 — Customer Registration

**Fields:** Full name, phone, email, selected verification/login method, password where applicable, Terms/Privacy acceptance and optional separate marketing consent.

**Sequence:** Validate fields → create Supabase Auth account/identity → initiate method-specific verification → navigate C-24 verification → on success create/activate customer profile and return to intended route.

**Rules:**
- Phone registration uses OTP verification.
- Email registration uses email verification.
- Google login uses Google OAuth; do not ask for a password for Google-only authentication.
- Other contact channel verification can happen later in account settings.
- Phone OTP provider must support Nepal `+977` and be configured before method is shown as active.
- Marketing consent must be optional and not bundled into required account terms.

### C-24 — Verification Result / OTP

**Controls:** OTP input, Verify, Resend Code with countdown, Change Phone/Email, Back to Login.

**Success:** Mark only the verified channel as verified, complete account activation/flow and redirect to original destination.

**Failure:** Incorrect/expired code, too many attempts, provider unavailable and resend cooldown. Preserve safe form state; do not expose whether another user owns a phone/email. Apply server-side verification and rate limiting.

### C-25 — Password Recovery

**Flow:** Forgot Password → choose email or phone method where configured → request reset → verify reset link/OTP → set new password + confirmation → server validates password policy → invalidate/revoke existing sessions according to security policy → show success → route to Login.

**Errors:** Expired link, invalid code, provider unavailable, rate limit, password mismatch, weak password. Avoid account enumeration. A failed recovery must not change password/session state.

### C-26 — Customer Dashboard

**Entry:** Profile icon after login, drawer Account, account route.

**Modules:** Profile, recent orders, all orders, order tracking, addresses, wishlist, recommendations, cancellation/return/exchange requests, notification preferences/history and account security.

**Actions:** Module cards/links navigate to dedicated account screens. Dashboard only displays records scoped to authenticated customer. Failed module fetches do not block other modules; show per-module Retry.

### C-27 — Profile and Account Settings

**Fields/actions:** Full name; verified/unverified phone and email; edit profile; verify additional contact; language preference; logout; account security/password change; session management where supported; optional account deletion/data request according to approved retention/legal policy.

**System:** Changes are validated server-side and audited where sensitive. If phone/email changes, re-verification is required before being marked verified. Logout revokes/clears session and returns to storefront.

### C-28 — Address Book

**Features:** Multiple saved addresses, add/edit/delete, set default, label address (e.g. Home/Work if implemented), structured Nepal address fields and delivery notes.

**Actions:** Save → validate; Set Default → update exactly one default per customer; Delete → confirm and prevent deleting the address actively being used in an unfinished checkout without warning. Checkout can select a saved address and edit a checkout copy without unintentionally overwriting saved address.

### C-29 — Customer Order History

**Content:** Order cards with reference/date/product thumbnails/total/payment method/order status; filters by status; pagination; order detail link.

**Actions:** Open Order → C-30. Track → C-20. Cancellation/Return → respective request screen if eligible. Reorder → revalidate current product and variant data, then add available items to Cart; unavailable/changed variants are clearly shown, never silently substituted.

### C-30 — Customer Order Details

**Content:** Original order-time product and price snapshots, payment state/history visible to customer, address, status timeline, courier details if available, request history and permitted actions.

**Actions:** Track; Request Cancellation; Return/Exchange; Contact Support; Reorder. The system applies status eligibility and permission rules before displaying/enabling actions.

### C-31 — Cancellation Request

**Entry:** Account Order Details or public tracking detail after lookup.

**Eligibility:** Evaluated against current order status and owner-approved policy. Only eligible pre-shipment order cancellation can release active stock reservation. A shipped order is directed to return/support workflow rather than a cancellation flow.

**Form:** Affected order/item(s), reason selection, optional note and confirmation.

**Sequence:** Customer reviews cancellation impact → Submit Request → server stores request `pending_review` (or schema-equivalent) → confirmation screen and request reference → admin queue → approve/reject/request more information → notify customer → on approval, perform eligible stock release and payment/refund record updates.

**Important:** Request submitted is not the same as order cancelled. A pending request does not release stock or refund payment until the authorized decision/transition occurs.

### C-32 — Return / Exchange Request

**Entry:** Account Order Details or public tracking after verified access.

**Form:** Select order item(s), choose Return or Exchange, choose reason, describe condition, add notes and supporting images if needed. For an exchange, choose requested replacement product/variant/size/colour if eligible and available.

**Sequence:** Show current policy/eligibility → validate order/item/status/date according to owner-approved rules → submit request → show request ID and pending state → admin/staff review → request more information or approve/reject → pickup/drop-off coordination → item receipt and inspection → explicit restock decision → exchange dispatch or refund processing → completed state.

**Policy rules:** Return windows, acceptable condition, exclusions, shipping costs, exchange stock rules and refund timing remain owner-configured. Do not display ZIP's sample “7-day” statements as policy without approval.

### C-33 — Request Detail / Request Tracking

**Content:** Request ID, type, linked order/items, current request state, timeline, customer notes, admin decisions/reasons, pickup/tracking details and refund status where appropriate.

**Controls:** Add requested information, upload evidence, contact support, view decision. Do not allow customer to alter an approved/closed request except through a new authorized support process.

### C-34 — Write / Edit Review

**Eligibility:** A qualifying customer purchase of the product is required before a verified-purchase review can be submitted. The exact qualifying order status must follow the PRD's verified-purchase rule and schema implementation.

**Fields:** 1–5 stars, written feedback, photos. Submit Review.

**Sequence:** Customer enters review → client and server validation → private/media upload validation where applicable → review saved as pending moderation → confirmation → admin review queue → approve/reject/request changes → approved review appears on product page and verified-purchase badge is shown only when eligibility is confirmed.

**Actions after publication:** Edit subject to review policy, report review, mark Helpful if enabled. Prevent repeat voting by same eligible user/record. Never display unpublished/rejected review content publicly.

### C-35 — Notification Centre

**Entry:** Customer Dashboard or notification icon/entry.

**Content:** Order, payment, shipping, delivery, request and account security notifications; unread/read states; history; preferences.

**Phase behaviour:**
- Phase 1: Show reliable order state in account/tracking and support manual WhatsApp communication; only enable configured transactional email/in-site notification events.
- Phase 2: Expanded channel preferences, templates and automated WhatsApp Business messaging after approved provider, template and consent setup.

**Actions:** Open notification → mark read and navigate to referenced order/request. Mark all read. Preferences → change allowed channels. Marketing messages remain separately consented. Failure to send a notification does not reverse the order/payment state.

### C-36 — FAQ & Shipping Help

**Entry:** Drawer/footer/checkout help.

**Reference:** `[STITCH] np_wardrobe_faq_shipping`.

**Controls:** Search input, clear search, category chips (All Questions, Nationwide Delivery, Payments & eSewa, Returns & Exchange, Custom Orders), expandable question rows, Reset Search, WhatsApp support, contact email only if confirmed.

**Prototype behaviour:** Accordion toggles `aria-expanded`; category selection filters groups; search matches keywords/title/body text; clear/reset returns to all questions; prototype opens first FAQ by default. Production may keep a first accordion open only if it remains accessible and doesn't interfere with searching.

**System:** No-results state offers Reset Search and WhatsApp help. FAQ content is CMS-managed and localized. Do not publish unconfirmed delivery ETA, payment or return policy.

### C-37 — About Us

**Entry:** Drawer/footer.

**Reference:** `[STITCH] np_wardrobe_about_us`.

**Content:** Brand philosophy, origin story, craftsmanship/values, verified business facts, editorial imagery and contact CTA.

**Actions:** Chat with Head Stylist → WhatsApp enquiry. Visit Us → only if verified address/map and public visit policy are approved. Book Private Fitting Session → use a real booking request workflow only if a booking owner/process is configured; otherwise route to WhatsApp enquiry and do not display a false “request received” success state.

**Content rule:** Founding year, atelier location, staff name, client count, craft/sourcing claims, operating hours and business registration claims must be verified before publication.

### C-38 — Contact / WhatsApp Concierge

**Entry:** Footer, drawer, floating WhatsApp, product sizing, About or support CTA.

**Options:** Generic WhatsApp, contextual product enquiry, sizing enquiry, order-support enquiry. For order-support, include order reference only after the customer has selected/verified an order. The WhatsApp destination is the approved number `+977 9740258617`.

**System:** Show clear external handoff. Do not imply message delivery/read or staff response time. Support hours and service-level promise must be configured from verified business hours.

### C-39 — Shipping, Returns & Policy Pages

**Entry:** Footer/drawer/FAQ/checkout terms link.

**Content:** Owner-approved delivery coverage, rates/thresholds, estimated windows, COD eligibility, payment instructions, cancellation/return/exchange/refund rules, product care and privacy/terms links.

**Interaction:** Read-only content with contextual WhatsApp/contact link. Policy version/effective date should be available where required. Checkout links to the current relevant policy and records acceptance when applicable.

---

## 5. Admin portal flow and screen specification

The admin is a separate secure application area. It must never be presented as a customer tab or implicitly available from customer login.

### A-01 — Admin Login

**Entry:** Direct `/admin/login` or authorized admin invitation link.

**Controls:** Email/username credential field (exact login identifier set by Supabase Auth config), password, Sign In, Forgot Password, help link.

**System:** Authenticate identity, then check active staff membership and assigned role. A customer account without an admin/staff assignment must not enter admin. Privileged account continues to A-02 MFA. Disabled/invited/pending accounts receive safe access messaging.

**Errors:** Invalid credential generic error; rate limit; provider failure; disabled account; MFA required; session expired. Do not reveal sensitive account-enumeration details.

### A-02 — Admin MFA Challenge

**Entry:** Successful credential verification for privileged admin/staff account.

**Controls:** MFA challenge input, Verify, recovery method, sign out.

**System:** Verify supported factor, record security event, create authorized admin session. Failed attempts are rate limited. Recovery process must be controlled by owner/security policy; no bypass via client parameter.

### A-03 — Admin Dashboard

**Entry:** Valid authenticated admin/staff session.

**Widgets:** Sales/orders summary, pending orders, pending payments, low stock, inventory snapshot, dispatch/delivery overview, recent activity, charts/date range, quick actions. The layout is customizable and role-specific.

**Actions:** Widget opens relevant module. Date filter refreshes permitted metrics. Realtime event shows new order/payment/stock signal; dashboard refetches persisted records rather than treating a WebSocket event as the source of truth. Quick-action actions are permission-checked.

**States:** Loading skeletons; per-widget error with retry; no data state; disconnected realtime indicator with manual refresh.

### A-04 — Admin Navigation

Grouped collapsible sidebar/menu; current page indicator; badges; quick search/action; responsive mobile navigation. Items include Dashboard, Orders, Catalogue, Inventory, Customers, Payments, Delivery, Requests, Reviews, Promotions, Content/CMS, Reports, Staff/Roles, Activity and Settings as permitted.

Hiding an item is not authorization. Every route and action has server-side permission checks and database RLS.

### A-05 — Order Queue

**Entry:** Dashboard alert or Orders navigation.

**List fields:** Order reference, date/time, customer display identity, total, order status, payment status/method, delivery region, assigned staff and flags.

**Controls:** Status tabs/filters; search by order reference/customer/contact subject to permission; date range; payment method/status; delivery region; sort; pagination/export if permitted; open order; assign staff.

**Real-time:** New order badge/count update. Refetch current queue and do not duplicate rows.

**Bulk actions:** Only explicitly permissioned and safe bulk actions. Payment approval, cancellation approval/refund and stock adjustments should remain individually confirmed/audited unless a separately reviewed bulk operation exists.

### A-06 — Admin Order Details

**Sections:** Order-time item snapshots, variant/SKU, totals, discounts, delivery charge, customer/address, payment record and proof access, stock reservation, delivery/courier, order timeline, staff assignments, internal notes, linked cancellation/return/exchange requests.

**Actions:** Confirm, reject/cancel, move to Processing, mark Shipped, mark Delivered, assign staff, add internal note, assign courier/tracking, contact customer, view audit timeline.

**State transition guard:** Server validates allowed transition from current state, actor permission, payment/COD conditions and inventory reservation condition. Invalid transition returns a clear reason and current state; it is not force-applied by changing a select input.

**Confirm:** Commit reservation exactly once; create audit record; update status; notify customer through configured channels.

**Cancel:** Requires reason and eligibility. Release only active reservation exactly once; create cancellation/request/refund history as applicable. No automatic refund assumption.

**Ship:** Requires required dispatch/courier fields according to operational configuration. Shipped orders follow returns/support rather than pre-shipment cancellation.

**Deliver:** Record actual delivery state and timestamp; COD remains unpaid until collection is recorded.

### A-07 — Product Catalogue List

**Content:** Product name, main image, slug/SKU, category, publication state, price/range, variants, stock summary, tags and updated time.

**Actions:** Create Product, Edit, Duplicate, Publish/Unpublish, Search/Filter, Bulk Select, Import/Export, View Customer Preview.

**Validation:** Slug/SKU uniqueness; publish requires all configured required product fields and valid variant/media data. Product unpublish must protect historical orders and existing customer records.

### A-08 — Product Creation Wizard

**Entry:** Products → Add Product.

**Steps:**
1. Basic Information — product name, slug, description, category/subcategory, tags, product type.
2. Media — upload photographs, arrange gallery, choose main image, alt text.
3. Variants — sizes, colours, option combinations, variant images, SKU generation or entry.
4. Pricing & Inventory — price, compare-at price/discount if applicable, variant-level stock, low-stock threshold.
5. Fashion Details — fabric/material, measurements, care instructions, fit notes, product-specific size chart.
6. SEO & Localization — English/Nepali titles/descriptions, metadata, translated content.
7. Preview — customer page preview at mobile/desktop breakpoints.
8. Publish — Save Draft or Publish.

**Controls:** Back/Next, Save Draft, Autosave status, Validate, Preview, Publish/Unpublish, Cancel. On validation error, identify exact step/field and preserve values. Autosave failure shows clear unsaved state and retry; never claim changes were saved when not persisted.

### A-09 — Product Editor

After creation, use tabs/sections: General, Images, Variants, Inventory, Details, SEO & Translation, Related Products and Settings. Changes persist through explicit Save/autosave rules. Preview shows draft/published view. Version/change history is retained according to admin policy.

### A-10 — Product Import / Export

**Flow:** Select CSV/Excel file → upload → choose mapping/template → preview parsed rows → validation report → confirm import → background processing → completion report.

**Validation:** Missing required fields, invalid prices, invalid categories, duplicate SKUs, invalid variants, image references, row errors. Invalid rows must be reported; no silent partial data corruption. Import should support dry run and safe retry/idempotency.

**Export:** Permission-checked data export; omit sensitive customer/payment data unless specifically authorized.

### A-11 — Inventory Overview

**View:** Physical/on-hand, reserved, available-to-sell, low stock, out of stock, per-product and per-variant SKU/size/colour counts.

**Filters:** Product/category/SKU/status. Open variant history, bulk update and stock adjustment.

**Actions:** Stock adjustment requires quantity change, reason and confirmation. System checks concurrency, writes inventory movement record, updates availability and broadcasts permitted realtime change.

**Reservation visibility:** Show active reservations, linked order, expiry, state and release/commit history. Admin cannot manually alter a reservation in a way that violates order state; privileged override must be audited and reasoned.

### A-12 — Variant Inventory Detail

Displays variant attributes, SKU, current on-hand quantity, reserved quantity, available quantity, low-stock threshold, stock movement timeline and active reservations. Adjustment flow records actor, timestamp, reason and resulting balance. Bulk operations preview affected SKUs and require confirmation.

### A-13 — Payment Queue

**Tabs/filters:** Pending Verification, Verified/Paid, Rejected/Failed, Refunded/Partially Refunded, COD collection outstanding/collected as configured.

**Fields:** Payment ID, linked order, method, amount due/received, payment reference, submitted timestamp, status and reviewer.

**Actions:** Open payment, view secure proof (if permission), approve, reject, enter decision note, record COD collected, start/record refund and view history.

### A-14 — Payment Detail / Verification

**Verification checklist:** Match order reference, merchant destination, transaction reference, currency/amount, payment timestamp and actual merchant evidence. Check duplicate references against previous accepted/rejected records.

**Approve:** Authorized user confirms evidence → server validates state/amount/reference/duplicate constraints → marks payment paid/verified → writes actor/timestamp/note → refreshes order/payment dashboard → notifies customer through configured channel.

**Reject:** Requires reason → mark rejected/failed or pending retry as the configured model specifies → keep order/payment state distinct → notify customer with safe next steps. Never alter order to paid.

**COD collection:** Record collected amount, date, actor and reference/receipt where applicable. Under/overpayment requires exception handling; do not auto-close mismatch.

**Refund:** Create refund record, amount, reason, method, external reference and status. “Refund requested” is not the same as “refund completed”. Only authorized staff can mark actual completion after evidence/transaction.

### A-15 — Delivery Management

**Queue:** Ready to dispatch, assigned, dispatched/in transit, delivery attempted, delivered, failed/returned. Exact operational statuses must map consistently to the order lifecycle.

**Dispatch workflow:**
1. Select confirmed/processing order.
2. Verify delivery area and configured fee/service.
3. Assign courier/service and staff.
4. Record package information and dispatch date.
5. Enter tracking number and verified external URL where available.
6. Confirm dispatch and update order state to Shipped.
7. Customer receives configured notification.
8. Update transit/attempt/delivered/failed status from admin or approved integration.
9. Record proof of delivery when available.

**Failure:** Delivery failed → record reason/attempt and next action; notify responsible staff; do not mark Delivered. Re-delivery/return-to-sender requires approved workflow and may affect return/refund decisions.

**Phase boundary:** Manual courier assignment/tracking is Phase 1. API-integrated label creation/status synchronization is Phase 2 and provider-dependent.

### A-16 — Cancellation / Return / Exchange Queue

**Queue types:** Cancellation, Return, Exchange; filter by request state, order status, age, assigned staff and reason.

**Request detail:** Customer/order/item snapshot, request reason, notes, submitted images, eligibility result, payment and stock context, history, pickup/tracking and proposed resolution.

**Actions:** Assign staff, request more information, approve, reject, set pickup/dropoff, mark received, inspect item, decide restock condition, exchange variant selection/availability, record refund status and close request.

**Required guardrails:**
- Request submission does not itself cancel an order.
- Approving pre-shipment cancellation releases active reservation once.
- Shipped items use return/support workflow.
- Return approval does not automatically restock item.
- Refund is separately recorded; never infer payment was refunded because request was approved.
- Every decision includes actor, timestamp and reason.

### A-17 — Customer Directory

Search and filter by customer identity/contact/order history subject to permission. Customer details screen shows only necessary profile/address/order/request information. Sensitive payment proofs and privileged account/security data require separate permissions. Customer record exports are restricted and audited.

### A-18 — Review Moderation

Queue statuses: Pending, Approved, Rejected/Hidden, Reported. View rating/text/photos/product/customer eligibility; verify qualifying purchase; approve/reject/request revision; moderate report; record reason. Do not edit customer opinion without transparent policy. Only approved review is public. Customer image access is protected until approved for public display.

### A-19 — CMS / Homepage Editor

**Content model:** Pages, homepage sections, banners, product/collection placements, FAQs, About, Size Guide, policies, translation fields and SEO metadata.

**Actions:** Create/edit, move section up/down or drag reorder, preview mobile/desktop, save draft, schedule publish, publish, unpublish/archive, view versions and restore prior version.

**Content state machine:** Draft → Scheduled (if configured) → Published → Archived; published content can return to draft/unpublished via authorized change. Publish validation checks required translation, image alt text, valid destination links, content dates and approved policy placeholders.

### A-20 — Campaigns / Promotions

Create/edit promotion, configure code/discount/eligibility/dates/usage caps, choose products/categories, delivery threshold or shipping benefit, preview customer display, schedule and publish. Test checkout calculation before activation. Campaign end/expiry must remove promotional presentation and reject expired code. Promotion precedence/stacking remains an owner-approved business rule; do not invent it.

### A-21 — Reports

Date range filters and role-limited views for order count, sales/revenue, product performance, payment method, inventory, customers and campaigns. Export CSV/Excel subject to permission. Estimated profit requires accurate product cost and expense inputs; if unavailable show “not configured” rather than fabricated profit.

### A-22 — Staff Directory and Invitation

Owner enters staff identity/email, chooses predefined or custom role, selects permissions, optional temporary expiration and sends invitation. Invitee verifies identity and activates account. Pending invitation state is visible. Owner can resend/revoke invite, suspend/reactivate staff, change role, set temporary access and view history. All changes are audited.

### A-23 — Role and Permission Editor

Start from predefined roles (Order, Inventory, Support, Marketing/Content) and allow owner-created roles. Permission granularity covers view/create/edit/delete/publish/approve/refund/export/configure for each module as applicable. Payment approval/refund, staff management, role changes, security settings, customer data export and inventory override are privileged capabilities and must require explicit owner grant. Deny by default. Changing a role does not retroactively erase audit history.

### A-24 — Activity / Audit Log

Search by actor, action, object type/reference, date and severity. Capture sensitive business events including login/security, order state, payment verification/refund, inventory adjustment/reservation override, staff/role change, CMS publish/restore, integration setting and export. Log only necessary metadata; do not log passwords, OTPs, full payment credentials, WhatsApp message contents or unnecessary personal data. Audit logs should be append-oriented and access restricted.

### A-25 — Admin Settings and Security

Store configuration, serviceability/delivery fee rules, COD rules, reservation expiry, payment instructions, verified QR/merchant details, support contacts/hours, language/content settings, notification templates, integration status, security sessions and backup/report links. Changes validate, require confirmation for high-impact settings, record an audit event and may require owner/MFA reauthentication.

---

## 6. Staff journeys and role-specific entry points

### 6.1 Staff invitation and activation

Owner/Admin with staff-management permission → Staff Directory → Invite Staff → enter identity → select role/template and permissions → set optional temporary end date → send invite → staff opens invite → verify identity → configure authentication/MFA → account becomes Active → staff is routed to role-appropriate dashboard.

Invalid/expired/revoked invite → show safe message and Contact Owner action. Invite tokens are single-use/short-lived according to auth configuration.

### 6.2 Order Manager

Login → MFA → role-scoped dashboard → Pending Orders → open order → review items/customer/payment/address → add internal note or assign → Confirm or reject/cancel within policy → Process → dispatch fields → Shipped/Delivered as allowed → monitor issue/request. Order Manager cannot approve eSewa payment/refunds unless owner explicitly grants those permissions.

### 6.3 Inventory Manager

Login → Dashboard → Low Stock/Inventory → filter product/SKU → open variant detail → review reserved/available → adjust stock with reason or bulk update → confirm → audit record → inventory refresh/realtime update. Inventory Manager cannot force-release valid active reservation without explicit override permission.

### 6.4 Customer Support Staff

Login → Support queue/customer/order search within permission → verify customer/request context → view permitted order status and customer contact data → add internal note/request information → respond through approved communication channel → record interaction outcome. Support staff cannot access full payment proof or sensitive exports unless granted.

### 6.5 Marketing / Content Staff

Login → CMS/Campaigns/Reviews depending on role → draft content or offer → preview → submit/publish within permission → monitor status/engagement. High-impact discounts, policy changes, global banners and scheduled campaign financial rules may require owner approval. Marketing staff cannot access private payment data by default.

### 6.6 Owner / Super Administrator

Login → MFA → full dashboard → manage all modules, roles, settings and integrations → review audit and security alerts → approve sensitive changes. Owner access remains subject to secure authentication and audit logging.

---

## 7. Core state models and transition rules

### 7.1 Order lifecycle

The PRD's customer-visible order states are:

`Pending → Confirmed → Processing → Shipped → Delivered`

Cancellation may transition an eligible order to `Cancelled`. The exact transition matrix must be encoded server-side and mirrored in the admin action UI. Invalid or backward transitions require an explicitly documented exceptional workflow.

| Current state | Allowed action / next state | Guard |
|---|---|---|
| Pending | Confirmed | Authorized order staff; order data valid; active reservation exists or valid stock is re-reserved atomically. |
| Pending | Cancelled | Authorized decision or approved auto-expiry policy; release active reservation exactly once. |
| Confirmed | Processing | Authorized staff; order not cancelled; fulfilment can begin. |
| Processing | Shipped | Dispatch fields required by configured workflow; reservation committed; courier/tracking recorded if applicable. |
| Shipped | Delivered | Delivery confirmation or authorized manual record; COD collection remains a separate payment action. |
| Confirmed / Processing | Cancelled | Only if owner-approved cancellation rules permit; stock/payment adjustments handled and audited. |
| Shipped | Cancellation unavailable | Redirect to return/support request, subject to policy. |
| Delivered | No direct cancellation | Use return/exchange/refund request flow if eligible. |

A cancellation request has its own state and does not change the order to Cancelled until approved and executed.

### 7.2 Payment lifecycle

Payment status is independent from order status. Required concepts include:

- `unpaid` / `pending` (COD not yet collected or payment not yet made).
- `pending_verification` (eSewa customer submitted reference/proof).
- `paid` / `verified` (trusted gateway confirmation or authorized manual verification).
- `rejected` / `failed` (invalid/unmatched/rejected attempt; may allow resubmission under policy).
- `partially_refunded`.
- `refunded`.

| Event | Result |
|---|---|
| Customer selects eSewa | Does not mark paid. |
| Customer views/copies QR/merchant ID | No payment state change. |
| Customer submits reference/proof | Payment becomes Pending Verification. |
| Admin approves after verification | Payment becomes Paid/Verified; actor/time/evidence reference recorded. |
| Admin rejects | Payment becomes Rejected/Failed or pending customer correction according to defined status model; reason recorded. |
| COD order confirmed/shipped | Remains Unpaid until collected. |
| COD collected | Authorized staff records actual collected amount; payment updates accordingly. |
| Refund requested | Refund Pending/Requested; not yet Refunded. |
| Actual refund completed | Authorized staff records completion and external reference; payment becomes Refunded/Partially Refunded. |

### 7.3 Inventory reservation lifecycle

A reservation is created by the order creation transaction, not by adding an item to cart.

Conceptual states: `active → committed` or `active → released/expired`.

- Create all order reservations atomically; if any variant cannot be reserved, fail the entire order transaction.
- Confirm order commits reservation without subtracting stock twice.
- Eligible cancellation releases reservation once.
- Expiry job releases reservation once.
- Duplicate retry must return existing outcome, not release/decrement again.
- Returns enter an inspection decision; approved return does not automatically re-add stock.

Reservation expiry duration is an owner configuration still required before production.

### 7.4 Delivery lifecycle

Operational delivery events may include: Not Assigned → Assigned → Packed/Ready → Dispatched/Shipped → In Transit → Delivery Attempted → Delivered, with Failed/Returned states as supported by selected courier process. These operational states map to the PRD's customer-visible order statuses. A delivery integration may provide events, but persisted admin/system state is authoritative after verification.

### 7.5 Request lifecycle

Cancellation, return and exchange requests use separate records/states. A proposed state set is:

`Submitted → Under Review → (More Information Requested → Under Review) → Approved or Rejected → (Pickup/Drop-off Arranged → Item Received → Inspected → Refund/Exchange Processing → Completed)`.

This is a workflow model, not an approved legal/returns policy. Eligibility windows, conditions, fee responsibility, refund timing and exchange availability must be configured by the owner. Terminal states cannot be reopened without an audited exception/new request.

### 7.6 Content lifecycle

`Draft → (Preview) → Scheduled → Published → Archived` where scheduling is enabled. Saving a draft is not publishing. A published policy update must retain version/effective date history where required.

---

## 8. Authentication, access guards and privacy rules

### 8.1 Customer access

- Public published catalogue/content is available to anonymous visitors.
- Guest cart and guest wishlist are local to the browser until merged or cleared.
- Guest checkout does not require a customer account.
- Registered customer records are scoped to their authenticated identity.
- Public order lookup requires both order reference and phone verification and is rate-limited.
- Guest order access must not reveal unrelated account data or other order history.

### 8.2 Admin access

- `/admin/*` is protected by dedicated admin authorization.
- Customer session alone never grants admin/staff privileges.
- Privileged admin sessions require MFA.
- Role/permissions are checked server-side and via RLS, not only in navigation.
- Staff account suspension/revocation must invalidate access as quickly as supported.
- High-risk actions may require fresh MFA/reauthentication according to security policy.

### 8.3 Permission matrix — initial minimum principles

The final role matrix is owner-configurable and must be stored/validated in the backend schema. The table below is a recommended default boundary, not a substitute for the owner granting each permission.

| Capability | Owner | Order staff | Inventory staff | Support staff | Marketing/content |
|---|---:|---:|---:|---:|---:|
| View operational dashboard | Full | Assigned widgets | Assigned widgets | Support widgets | Marketing widgets |
| Product view | Yes | Read | Read | Read limited | Read |
| Edit products/variants | Yes | No by default | Limited if granted | No | Content-only if granted |
| Adjust stock | Yes | No by default | Yes if granted | No | No |
| View/act on orders | Full | Assigned order actions | Limited context | Support scope | No by default |
| Verify payment / approve refund | Yes | Only if granted | No | No by default | No |
| Manage courier/delivery | Yes | If granted | No | View/support if granted | No |
| Handle cancellations/returns | Yes | If granted | Inspection/restock only if granted | Intake/support if granted | No |
| Moderate reviews | Yes | No | No | If granted | If granted |
| Edit/publish CMS | Yes | No | No | No | If granted |
| Manage campaigns | Yes | No | No | No | If granted |
| Manage staff/roles | Yes | No | No | No | No |
| Change integrations/security | Yes | No | No | No | No |
| Export customer/payment data | Explicitly granted only | Restricted | Restricted | Restricted | Restricted |

Deny by default. Access to payment proof, full customer address/phone, refund and export functions must be separately permissioned.

### 8.4 Sensitive data rules

- Never send full address/phone/payment references/WhatsApp message body to analytics.
- Never log passwords, OTPs, session tokens or merchant secrets.
- Payment proof is private and access is short-lived/permission-checked.
- Use minimal customer data on public tracking and notification surfaces.
- Guest tracking does not grant access to profile, address book or other orders.
- Admin audit log is append-oriented and access restricted.

---

## 9. Error, exception and recovery catalogue

The customer-facing response should be calm and actionable. Admin-facing response can include a correlation/reference ID and more diagnostic context if the user is authorized. Technical detail belongs in secure logs, not public messages.

| ID | Scenario | Customer/staff response | System action / recovery | Safety invariant |
|---|---|---|---|---|
| ERR-01 | Offline while browsing | Offline banner; previously cached public content may remain visible | Retry data fetch when connection returns | Do not claim stock/price is current while offline. |
| ERR-02 | Offline during cart update | Keep pending local change where safe; show retry | Reconcile against server on reconnect | Server stock/price remains authoritative. |
| ERR-03 | Offline during order submit; response unknown | Show “Checking your order status” and provide Retry/Check Existing Order | Query idempotency/order reference; do not blindly create another order | No duplicate order/reservation. |
| ERR-04 | Order creation failed before commit | Explain order was not placed; allow retry | Roll back partial transaction; preserve cart | No partial order/reservation. |
| ERR-05 | Duplicate submit / repeated tap | Show existing saved result or progress | Idempotency key returns same order result | One logical order only. |
| ERR-06 | Variant stock conflict | Identify unavailable item and current available quantity | Refresh cart, require customer correction | Never oversell. |
| ERR-07 | Price changed | Show old/current price and ask review | Recalculate all totals | Never charge stale amount. |
| ERR-08 | Coupon expired/ineligible | Show coupon reason and revised total | Recalculate; require review of changed total | Never apply invalid discount. |
| ERR-09 | Delivery area unserviceable | Explain area unavailable; offer edit/contact | Keep checkout data; do not place order | No fabricated availability/fee. |
| ERR-10 | Delivery fee unknown | Mark fee requires confirmation and show safe next step | Follow owner-defined manual-confirm workflow | Do not invent amount or ETA. |
| ERR-11 | eSewa merchant setup unavailable | Explain eSewa temporarily unavailable; show COD if eligible | Do not show sample QR/ID | No fake merchant destination. |
| ERR-12 | eSewa proof upload fails | Preserve typed reference; show retry | Upload resumably where supported; payment remains pending only when accepted submission is stored | Never mark paid. |
| ERR-13 | Invalid/duplicate eSewa reference | Show correction/contact instructions | Reject/flag duplicate reference; audit | No duplicate credit. |
| ERR-14 | eSewa verification pending | Explain awaiting verification | Keep payment pending verification | Order/payment states remain separate. |
| ERR-15 | eSewa rejected | Show safe reason and next approved action | Preserve rejection/audit history; allow resubmission only under policy | No false paid state. |
| ERR-16 | WhatsApp app/site unavailable or popup blocked | Show order saved, copy reference/message, retry WhatsApp or contact manually | Keep order and reservation persisted | No order rollback. |
| ERR-17 | WhatsApp opened but customer did not send | Show “Continue in WhatsApp” not “Message sent” | No assumption or status transition | Handoff is not message delivery. |
| ERR-18 | Payment service/email/notification fails | Show core order status unchanged | Retry notification/integration separately | No order/payment rollback. |
| ERR-19 | OTP invalid/expired | Inline message, resend after cooldown | Rate limit, maintain safe form state | No auth bypass. |
| ERR-20 | OTP/email provider unavailable | Offer retry or another configured auth method/guest route | Log provider issue; do not mark verified | Contact unverified. |
| ERR-21 | Login rate limit/suspicious activity | Generic safe message and wait/recovery guidance | Temporary restriction/alert as configured | Do not disclose detection rules. |
| ERR-22 | Session expires during checkout | Ask re-auth if action requires it; preserve safe checkout fields | Validate session and return to intended step | Never bypass authorization. |
| ERR-23 | Session expires in admin | Redirect to admin login/MFA and show safe notice | Revoke expired session | Unsaved sensitive changes are not falsely claimed saved. |
| ERR-24 | Unauthorized admin route/action | 403/denied state without data leakage | Log security event; redirect or show access denied | UI hiding is not authorization. |
| ERR-25 | Customer tracking details mismatch | Generic “We couldn't verify those details” | Rate-limit and log attempt | Do not disclose whether order reference exists. |
| ERR-26 | Product/image load failure | Placeholder and Retry; retain product text where possible | Retry Cloudinary fetch | No broken layout or fake product. |
| ERR-27 | Upload invalid type/size | Explain accepted limits and allow replacement | Reject before publishing; audit where needed | No unsafe file access. |
| ERR-28 | Wishlist/cart sync conflict | Explain items merged/changed; allow review | Merge idempotently and validate current product state | No duplicate lines or silent removal. |
| ERR-29 | Realtime disconnect | “Live updates paused”; provide Refresh | Reconnect and refetch server state | Event stream not source of truth. |
| ERR-30 | Courier update failed | Admin sees update not saved and can retry | Do not advance status until persistence confirmed | No false Shipped/Delivered status. |
| ERR-31 | Delivery attempted/failed | Customer sees verified failed-attempt state and support next step | Staff records reason and next plan | Never mark Delivered. |
| ERR-32 | Cancellation request not eligible | Explain status/policy outcome and show support/return alternative | Do not create false approved request | No unauthorized stock release. |
| ERR-33 | Cancellation pending approval | Show request submitted/pending, not cancelled | Keep reservation/payment unchanged until decision | Request is not cancellation. |
| ERR-34 | Return/exchange policy data missing | Do not offer unsupported request path; contact support | Mark policy configuration gap to admin | No invented window/fee. |
| ERR-35 | Return item condition unresolved | Show Under Inspection | Hold restock until authorized decision | No automatic inventory increase. |
| ERR-36 | Refund provider/manual transfer pending | Show Refund Pending | Store refund request/reference and audit | Approval is not completion. |
| ERR-37 | Admin product autosave fails | Persistent unsaved indicator, Retry/Save | Keep local draft where safe | Never claim saved. |
| ERR-38 | Product import row invalid | Row-level error report and preview | Skip/reject according to confirmed import mode | No silent partial import. |
| ERR-39 | Promotion schedule job repeats/fails | Admin sees job status/alert | Idempotent job retry | No duplicate discounts or messages. |
| ERR-40 | Database/server unavailable | Customer safe service error; admin incident alert | Retry with backoff, monitor and restore when service returns | No false success; no public stack trace. |

### 9.1 Global system feedback patterns

Every async action must have:
- Idle state.
- Loading/processing state and disabled duplicate submit where appropriate.
- Success state only after persistence/provider result is confirmed.
- Validation state with field-level guidance.
- Recoverable error state with safe Retry or alternative action.
- Non-recoverable/permission state with contact/help route.

Destructive actions (remove address, remove cart item where undo is available, cancel request where permitted, unpublish content, suspend staff, stock override) require an appropriate confirmation dialog and clear consequence wording.

---

## 10. System response and notification matrix

| Event | Customer response | Admin/staff response | Channel phase |
|---|---|---|---|
| Order saved | Confirmation page and order reference | New order queue alert | Phase 1 core UI; email/in-site where configured |
| Admin confirms order | Updated timeline/status | Order action/audit record | Phase 1 status in account/tracking; automated multi-channel expansion later |
| eSewa proof received | Pending Verification state | Payment verification queue | Phase 1 |
| eSewa verified/rejected | Updated payment state and reason/next step | Audit history | Phase 1 manual |
| COD collected | Paid/collection update if customer view supports | Collection action/audit | Phase 1 manual |
| Shipped | Tracking/courier update if entered | Delivery queue update | Phase 1 manual tracking; Phase 2 courier integrations |
| Delivered | Delivered timeline | Delivery closure | Phase 1 manual |
| Cancellation/return decision | Request state and decision | Request queue/audit | Phase 1 basic workflow; advanced automation Phase 2 |
| Review approved/rejected | Review state | Moderation queue | Phase 1/P1 per PRD |
| Promotional announcement | Display only when published/active | CMS/campaign status | Phase 1 basic content; scheduling P2 |
| Automated WhatsApp | Only after approved provider/templates/consent | Delivery log/status | Phase 2 |

Notification preferences must not suppress essential account security or legally required transactional messages where policy requires them. Marketing communications require separate consent.

---

## 11. Cross-screen navigation and return behaviour

1. Opening Search from any page retains the origin route and returns there on close.
2. Opening Product Details from Shop preserves search query, category, filters, sort, view mode and scroll position.
3. Closing Quick View returns to the exact listing state.
4. Closing Size Guide returns to Product Details/Quick View with selected variant intact.
5. Add to Bag from product detail preserves product page state; View Bag navigates to Cart.
6. Cart edits update the cart badge across the customer shell.
7. Checkout Back controls preserve entered delivery data and selected payment method unless invalidated by changed cart/address/eligibility data.
8. Authentication redirects preserve intended destination and safe shopping state.
9. Guest-to-account merge happens once and is idempotent; the user sees an explicit merge result if quantities/items conflict.
10. After order submission, browser Back must not resubmit the order. Re-entering confirmation uses the existing order reference.
11. Tracking lookup has no implicit account access; account login may offer the authenticated order detail path.
12. Admin navigation preserves filters/search state when opening and returning from record details where practical.
13. Admin Realtime updates refetch persisted records and do not silently overwrite unsaved form fields.
14. Staff deeplinks are reauthorized at destination; if permission is missing, show Access Denied and return to permitted dashboard.
15. Expired sessions route through appropriate reauthentication and safe return path.

---

## 12. Responsive, locale and accessibility flow rules

### 12.1 Responsive behaviour

- Mobile is the primary customer design target (the PRD estimates around 90% phone usage).
- Preserve the mobile five-tab customer navigation from Stitch.
- On tablet/desktop, transform navigation/layout without changing information architecture or action meaning.
- The admin portal uses a collapsible sidebar on larger screens and a responsive navigation drawer/menu on small screens.
- Sticky Add to Bag controls and floating WhatsApp actions must avoid overlap and account for device safe areas/keyboard.
- Checkout must remain readable and operable with a mobile keyboard open.

### 12.2 Language behaviour

- Initial languages: English and Nepali.
- Language switcher is accessible from the menu/account settings.
- Interface strings use translation dictionaries; product/content fields use database-managed translations.
- Switching language preserves route when translated; otherwise route to closest localized destination.
- Search, error messages, checkout, confirmation, order tracking and policy pages must be localizable.
- User-submitted notes/reviews are not automatically translated or altered.

### 12.3 Accessibility

- Interactive controls use semantic buttons/links and accessible names.
- Dialogs and drawers trap focus appropriately and restore it on close.
- Accordions expose `aria-expanded` and associated content relationship.
- Unit selectors and filter options expose selected/pressed state.
- Errors associate with form fields and are announced to assistive technology.
- Product images have useful alt text.
- Status is conveyed using text/icon as well as colour.
- Keyboard navigation and visible focus are supported.
- Critical tap targets are at least 44px high where practical per PRD/TRD.

---

## 13. Phase 1 and Phase 2 screen/flow boundaries

### Phase 1 — essential launch

Must work end-to-end:
- Home, Shop, main category/collection, product details, size guide, FAQ, About and contact.
- Product search and essential filters/sort.
- Product variant selection and stock states.
- Cart persistence and cart validation.
- Guest checkout with Review → Delivery → Payment steps.
- COD and manual eSewa workflows.
- Server order creation, idempotency and atomic stock reservation.
- Order confirmation and WhatsApp handoff with fallback.
- Customer order history/tracking; authenticated account functions subject to provider setup.
- Wishlist essential behaviour.
- Admin login/MFA, dashboard, product, stock, order, payment and manual delivery operations.
- Basic cancellation/return/exchange request handling.
- Essential CMS and sales/order reports.
- RLS, staff permissions, audit, backups, monitoring, tests and deployment gates.

### Phase 2 — advanced growth

- Automated WhatsApp Business notifications and templates.
- Official eSewa gateway and automatic verification.
- Expanded notification preferences/history and automation.
- Advanced analytics and customer recommendations.
- Scheduled content/campaign workflows and full visual CMS history/rollback.
- Courier integrations, labels and tracking sync.
- Advanced PWA/offline support.
- Advanced return/refund automation and other advanced workflows.
- Dedicated search engine only when evidence justifies it.

The 50 discovery answers define desired complete application behaviour. They do not override the PRD's phased release priority. An advanced flow can be specified now while being marked Phase 2 in implementation.

---

## 14. Open owner decisions and content configuration

The flow must not fill these gaps with assumptions. Keep them as configurable fields or disabled features until the owner supplies verified details.

### 14.1 Business content and policy

- Confirmed production domain and public business address.
- Confirmed business email and support hours.
- Verified studio/atelier address and visiting hours, if publicly displayed.
- Verified founding year, client counts, service promises and brand/craft claims.
- Product photography, actual product names, prices, SKU, size/colour combinations, stock, measurements and care instructions.
- Approved product review content and customer consent for testimonials/photos.
- Actual size chart and garment-specific fit guidance.
- Delivery coverage/serviceability, courier providers, rates and estimated windows.
- Free-delivery threshold, if any.
- COD eligibility, amount restrictions and required advance payment.
- eSewa merchant ID, verified QR and exact payment instructions.
- Whether Fonepay, bank transfer or any other method is approved. Until explicitly approved and configured, show only COD/eSewa as in the PRD.
- Reservation expiry duration.
- Cancellation deadline and rules.
- Return/exchange time window, item-condition rules, exclusions, fees and refund timing.
- Whether private fitting session booking or bespoke alteration/pre-order service is a real operational offering; if so, appointment capacity and confirmation workflow.
- Newsletter provider, consent wording, unsubscribe and retention rules if email collection will be enabled.
- SMS provider for OTP.
- Automated WhatsApp Business provider, templates, eligibility and consent.
- Email provider configuration and sender identity.

### 14.2 Design system conflict to resolve in UI_UX_DESIGN

The approved PRD/TRD specify Cream + Rose Gold and Cormorant Garamond headings with DM Sans body text. The uploaded Stitch `DESIGN.md` uses EB Garamond in its YAML typography tokens and explanatory text, and describes a palette that includes a Crimson CTA accent plus cream/blush/rose values. The source YAML token map also includes colour values that are not identical to its prose description. `UI_UX_DESIGN.md` must reconcile this explicitly and obtain owner approval for the final font/token set; do not silently discard either source.

### 14.3 Prototype example content not approved as policy

Do not publish these source examples as confirmed business facts without verification:
- “Free delivery across Nepal on orders above रु. 5,000”.
- “100% quality guaranteed”.
- Example coupon `NPWARDBO15` and 15% discount.
- Sample eSewa merchant ID `NP-WARDROBE-8821` and QR.
- Fonepay or direct bank transfer as payment methods.
- Seven-day fit/exchange guarantee.
- Specific Kathmandu/outstation delivery times and rates.
- “Only 4 left in Kathmandu” or other sample stock messages.
- Sample product prices, review counts, star ratings and testimonial identities.
- Client totals, founding year, studio address, hours and staff names.
- `care@npwardrobe.com.np` and support response-time promise.
- Fitting-session booking success state.
- Bespoke alterations/pre-order claims.

---

## 15. Acceptance criteria and end-to-end scenarios

The APP_FLOW is implemented only when the corresponding scenarios pass in staging and relevant unit/component tests exist.

### 15.1 Guest shopper

- [ ] Anonymous visitor can browse all published public content without login.
- [ ] Five bottom navigation items work on customer screens.
- [ ] Drawer, search and Profile/Account Gateway behave according to this document.
- [ ] Guest can add a variant to local cart and guest wishlist.
- [ ] Cart and wishlist survive normal refresh/return on same browser.
- [ ] Guest can complete checkout without registering.
- [ ] Guest order is stored before WhatsApp handoff.
- [ ] Guest can track an order using order reference + matching phone verification.

### 15.2 Product discovery and variant

- [ ] Category and collection destinations are distinct.
- [ ] Shop grid/list preference is remembered as approved.
- [ ] Filter drawer applies multiple filters and shows active removable chips.
- [ ] Search has loading, results and no-results flows.
- [ ] Product gallery, colour, size, quantity and price/stock state stay synchronized.
- [ ] Unavailable variant cannot be added.
- [ ] Quick View can add a selected variant without losing listing state.

### 15.3 Cart and checkout

- [ ] Guest/account cart merges idempotently while preserving variant/quantity.
- [ ] Cart revalidation identifies unavailable/price-changed items and asks for review.
- [ ] Checkout follows Review → Delivery → Payment.
- [ ] Customer can go Back without losing valid form data.
- [ ] Server calculates all authoritative totals.
- [ ] Delivery fee is calculated from configured rules or transparently marked for confirmation.
- [ ] Duplicate taps/retries do not create duplicate order/reservation.

### 15.4 eSewa and COD

- [ ] No sample merchant ID or sample QR can be displayed in production.
- [ ] eSewa order/payment starts in unverified state.
- [ ] Payment proof is private and authorized.
- [ ] Only authorized admin/trusted gateway can mark eSewa paid.
- [ ] COD is offered only under configured eligibility.
- [ ] COD remains unpaid until actual collection is recorded.
- [ ] Payment and order states are separate.

### 15.5 WhatsApp

- [ ] Order saved before WhatsApp opens.
- [ ] Message comes from saved server data and uses `+977 9740258617`.
- [ ] Message contains correct order reference and item/variant/totals.
- [ ] If WhatsApp fails/blocked, order remains saved and fallback appears.
- [ ] UI never claims message sent or order confirmed solely because link opened.

### 15.6 Customer account and requests

- [ ] Phone OTP/email verification/Google are only enabled when configured.
- [ ] Account Gateway preserves intended route and guest shopping data.
- [ ] Customer can view only own account/order/request data.
- [ ] Password recovery is rate-limited and non-enumerating.
- [ ] Cancellation request is not treated as approved cancellation.
- [ ] Shipped order follows return/support path.
- [ ] Return approval does not automatically restock; inspection/restock decision is explicit.
- [ ] Review submission checks qualifying purchase and moderation state.

### 15.7 Admin and staff

- [ ] Customer login cannot access `/admin`.
- [ ] Privileged staff complete MFA.
- [ ] Staff dashboard/sidebar is permission-scoped; server rejects unauthorized deep links/actions.
- [ ] Product creation/editing validates required fields and autosave/publish state.
- [ ] Stock view distinguishes physical, reserved and available quantities.
- [ ] Order state transitions are validated and audited.
- [ ] Payment approval/rejection/refund action is permissioned and audited.
- [ ] Courier/tracking changes persist before customer-facing status is updated.
- [ ] CMS preview does not publish; publishing requires permission.
- [ ] Staff invitation, suspension and role change are logged.

### 15.8 Reliability, security and accessibility

- [ ] Network loss during order creation cannot create ambiguous duplicate orders.
- [ ] Payment, email, WhatsApp or Realtime failure cannot erase a valid order.
- [ ] Public tracking lookup is rate-limited and privacy-protective.
- [ ] Sensitive uploads are inaccessible to unauthorized users.
- [ ] Sentry/Better Stack events exclude secrets and unnecessary personal data.
- [ ] Critical menus, drawers, dialogs and forms are keyboard accessible.
- [ ] Responsive screens work on common phone/tablet/desktop widths.
- [ ] Error, loading, empty and retry states exist for all critical modules.

---

## 16. Traceability to PRD/TRD

| Flow area | PRD sections/requirements | TRD sections |
|---|---|---|
| Storefront navigation | Section 7; FR-001–008 | Sections 5, 12, 17 |
| Product discovery | Section 8.2; FR-010–022 | Sections 5, 12 |
| Cart | Section 8.3; FR-030–038 | Sections 9.1–9.2 |
| Checkout/order | Section 8.4; FR-040–052 | Sections 6, 9.3 |
| Order management | Section 8.5; FR-060–069 | Sections 9.5, 13 |
| Inventory | Section 8.6; FR-070–079 | Sections 7, 9.6 |
| Payments | Section 8.7; FR-080–088 | Sections 9.7, 11 |
| Delivery | Section 8.8; FR-090–097 | Section 9.8 |
| Accounts/auth | Section 8.9; FR-100–105 | Section 8 |
| Wishlist/reviews | Section 8.10; FR-110–118 | Sections 5, 10 |
| Cancellation/returns | Section 8.11; FR-120–128 | Section 9.9 |
| Promotions | Section 8.12; FR-130–136 | Sections 13.3, 14–15 |
| CMS/content | Section 8.13; FR-140–143 | Section 13.3 |
| Notifications | Section 8.14; FR-150–155 | Sections 11, 14, 18 |
| Admin/staff/reporting | Section 8.15; FR-160–168 | Sections 5, 13, 15 |
| SEO/sharing | Section 8.16; FR-170–176 | Section 12.3 |
| Performance/accessibility | Section 8.17; FR-180–186 | Section 17 |
| Security/backups | Section 8.18; FR-190–198 | Sections 16, 21 |
| Acceptance | PRD Sections 12 and 15 | TRD Sections 19, 20, 24 |

---

## 17. Handoff rules for UI_UX_DESIGN.md

The next design document must use this APP_FLOW as its interaction source and the uploaded Stitch ZIP as the primary visual reference. It must:

1. Preserve and improve the eight source mobile screens rather than replacing the approved design direction without owner approval.
2. Add designed states for all new customer screens (wishlist, Quick View, search, account, orders, tracking, request flows and notifications).
3. Design the dedicated admin portal and all required staff modules; the ZIP has no admin screens.
4. Define mobile, tablet and desktop adaptations.
5. Resolve the Cormorant Garamond vs EB Garamond discrepancy and YAML/prose colour-token discrepancies explicitly.
6. Define all component states: default, hover/focus, active, disabled, loading, success, error, empty, pending and selected as relevant.
7. Specify drawer, modal, filter sheet, accordion, toast, sticky CTA, image gallery and bottom navigation behaviour.
8. Respect the route map and button destinations in this document.
9. Keep example/pending business data clearly marked and avoid false policy claims.
10. Include accessibility, focus management, reduced-motion considerations, tap targets and safe-area behaviour.

---

## 18. Document governance

- This document records the owner's approved 50-question APP_FLOW discovery decisions.
- The uploaded ZIP is a visual/prototype source, not a substitute for a production backend.
- Changes that affect security, permissions, order/payment/inventory state, customer personal data or public business policy require an explicit owner-approved revision.
- UI_UX_DESIGN must not change flow outcomes or create new business promises without approval.
- BACKEND_SCHEMA must support the data/state/authorization requirements here.
- IMPLEMENTATION_PLAN must map each screen and flow to milestones, dependencies and tests.
- When implementation reveals a conflict among documents, record it and obtain resolution; do not silently choose a weaker or less secure behaviour.

**End of APP_FLOW v1.0**

---

## Appendix A — Approved 50-question discovery decision register

This register preserves the owner’s exact option selection and the decision it represents. The detailed behaviour is specified in the relevant sections above.

| Q | Selected option | Approved decision |
|---:|:---:|---|
| 1 | B | Preserve the existing Stitch customer screens and visual hierarchy while improving navigation, interactions and integration with PRD/TRD. |
| 2 | D | Keep the five bottom tabs; provide Account in the hamburger menu and a profile icon in the header. |
| 3 | D | Premium left-side navigation drawer with categories, collections, account, orders, support and information links. |
| 4 | D | Complete visual category experience with expandable subcategories, curated collections, trending/featured categories and dedicated category pages. |
| 5 | D | Main categories use dedicated category pages; special collections use editorial collection pages. |
| 6 | D | Two-column grid by default, manual single-column editorial toggle, remember last selection. |
| 7 | D | Product image/name opens full details; a separate Quick View opens without leaving the listing. |
| 8 | D | Premium Quick View includes imagery, variants, quantity, stock, wishlist, size guide, description, delivery information and full-page link. |
| 9 | D | Complete product gallery: swipe, thumbnails, full-screen viewing, zoom, indicators and transitions. |
| 10 | D | Complete variant system with colour-dependent images, sizes, prices, SKUs and stock validation. |
| 11 | D | Add-to-Bag confirmation panel, updated bag count, Continue Shopping and View Bag. |
| 12 | D | Guest local cart; registered cloud cart; safe merge after login preserving variants and quantities. |
| 13 | D | Smart cart validation identifies changed items and requires customer review of stock/price changes. |
| 14 | D | Complete wishlist: guest/account persistence, sync, move to bag, variant selection and availability alerts. |
| 15 | D | Flexible wishlist with grid/list, availability and price changes, Quick View, remove and move to bag. |
| 16 | D | Smart empty wishlist with Explore Collections, New Arrivals, Best Sellers and relevant suggestions. |
| 17 | D | Complete fashion discovery search with advanced filters, trending/recent searches, typo tolerance and recommendations. |
| 18 | D | Full-screen search with recent/trending searches, popular categories and live product suggestions. |
| 19 | D | Premium filter drawer with staged multi-select, live result count, Apply/Reset and removable active chips. |
| 20 | D | Contextual stylist WhatsApp consultation with product, selected variant, quantity, price and enquiry context; not an order/reservation. |
| 21 | D | Verified-purchase reviews with stars, text, photos, moderation, edit/report/helpful actions and verified badges. |
| 22 | D | Complete size experience with product charts, full page, Inches/CM, measuring instructions and WhatsApp help. |
| 23 | D | Three-step checkout: Review → Delivery → Payment; preserve data and allow Back/review. |
| 24 | D | Guided eSewa: save order/reserve stock, show real QR/details, collect reference/proof, WhatsApp handoff, admin verification. |
| 25 | D | Complete COD: save order, reserve stock, validate eligibility/location/advance rule, WhatsApp handoff, admin confirmation. |
| 26 | D | Premium confirmation dashboard with order summary/timeline, payment and delivery information, Track Order and WhatsApp next steps. |
| 27 | D | Complete order tracking with timeline, courier/tracking, verified ETA, payment status, WhatsApp and eligible actions. |
| 28 | D | Cancellation request from account and public tracking, with eligibility, reason, confirmation, tracking and admin decision. |
| 29 | D | Complete return/exchange request with item selection, reason/evidence, variant, eligibility, tracking, admin decision, pickup and refund status. |
| 30 | D | Complete structured Nepal address system with province/district/municipality/ward, saved addresses, serviceability and configured charges. |
| 31 | D | Account Gateway with Login, Register, Phone OTP, Email/Password, Google Login and Continue as Guest. |
| 32 | D | Complete registration with full name, phone, email, applicable credential/OTP, terms/privacy and separate optional marketing consent. |
| 33 | D | Method-based verification: phone OTP, email verification or Google OAuth; additional contacts verified later. |
| 34 | D | Complete password recovery through email/phone, secure verification, session invalidation and recovery errors. |
| 35 | D | Complete customer dashboard with profile, orders, tracking, addresses, wishlist, suggestions, requests, notifications and security. |
| 36 | D | Complete order management with status filters, details, payment/delivery, cancellation/returns and reorder. |
| 37 | D | Notification preferences across WhatsApp, email and in-site, with history, read/unread and admin templates. |
| 38 | D | Dedicated secure `/admin` portal, separate login, role checks, MFA and protected routes. |
| 39 | D | Configurable role-specific admin dashboard with business metrics, alerts, charts, filters and quick actions. |
| 40 | D | Grouped collapsible admin navigation, role-based visibility, active indicators, badges, quick actions and responsive mobile menu. |
| 41 | D | Advanced product editor with creation wizard, tab editing, preview, autosave, validation, drafts and publishing. |
| 42 | D | Complete inventory with physical/reserved/available stock, alerts, bulk updates, adjustment reasons and audit history. |
| 43 | D | Complete order operations with real-time alerts, filters, assignment, transition validation, internal notes and timeline. |
| 44 | D | Advanced delivery operations with serviceability, fees, courier, package/dispatch, tracking, failures, proof of delivery and notifications. |
| 45 | D | Complete payment operations with secure proof, amount/reference verification, approve/reject, COD collection, refunds, duplicate detection and audit. |
| 46 | D | Advanced cancellation/return/exchange resolution with assignment, eligibility, decisions, pickup, inspection, restock and refund workflow. |
| 47 | D | Complete visual CMS with sections, preview, drafts, publish, scheduling, multilingual content, SEO, version history and rollback. |
| 48 | D | Complete staff management with invitations, activation, roles/permissions, temporary access, monitoring and suspension. |
| 49 | D | Complete security response with suspicious-activity detection, MFA, rate limits, session revocation, alerts and protected admin actions. |
| 50 | D | Complete resilience with contextual errors, safe retries, preserved forms/cart, duplicate prevention, fallbacks, incident alerts and recovery. |

**End of APP_FLOW v1.0 and discovery decision register.**
