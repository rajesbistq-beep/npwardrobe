# Task 006 — Design system catalog

## Source review and reference audit

The theme follows the approved precedence: PRD/TRD/APP_FLOW for product and behavior, then `docs/UI_UX_DESIGN.md` for the formal visual system, with the actual Stitch assets used for composition. All 8 customer `screen.png` and `code.html` pairs and all 26 admin screenshot/HTML pairs were inventoried and visually reviewed in contact sheets. The admin folder also contains `np_wardrobe_enterprise_console/DESIGN.md` without a `screen.png` or `code.html`. This is 27 admin folders, not the 28 admin references described in the Task 006 brief. There is no customer `DESIGN.md` in the repository; `UI_UX_DESIGN.md` refers to a design file in the original archive which is not present here.

Customer references reviewed:

- `design/stitch/customer_storefront/np_wardrobe_homepage/`
- `design/stitch/customer_storefront/np_wardrobe_category_collections/`
- `design/stitch/customer_storefront/np_wardrobe_shop_all_products/`
- `design/stitch/customer_storefront/np_wardrobe_product_details/`
- `design/stitch/customer_storefront/np_wardrobe_shopping_bag_checkout/`
- `design/stitch/customer_storefront/np_wardrobe_size_guide/`
- `design/stitch/customer_storefront/np_wardrobe_faq_shipping/`
- `design/stitch/customer_storefront/np_wardrobe_about_us/`

Admin visual/component references reviewed:

- `activity_audit_log_np_wardrobe`, `admin_login_np_wardrobe`, `admin_mfa_verification_np_wardrobe`, `campaigns_coupons_np_wardrobe`, `cancellation_returns_queue_np_wardrobe`, `cms_content_banners_np_wardrobe`, `create_product_np_wardrobe`, `customer_directory_np_wardrobe`, `customer_profile_sunita_poudel_np_wardrobe`, `edit_product_prd_9042_np_wardrobe`, `integrations_gateways_np_wardrobe`, `inventory_overview_np_wardrobe`, `notification_templates_np_wardrobe`, `operations_dashboard_np_wardrobe`, `orders_management_np_wardrobe`, `order_npw_8945_details_np_wardrobe`, `payments_verification_queue_np_wardrobe`, `payment_verification_pay_9924_esw_np_wardrobe`, `products_catalogue_np_wardrobe`, `reports_analytics_np_wardrobe`, `request_inspection_req_2024_082_np_wardrobe`, `review_moderation_np_wardrobe`, `roles_permissions_np_wardrobe`, `shipments_deliveries_np_wardrobe`, `staff_management_np_wardrobe`, `store_settings_np_wardrobe`.
- `design/stitch/admin_panel/np_wardrobe_enterprise_console/DESIGN.md` provides the admin-specific palette and dense operations typography. Its conflicting values are kept in admin-prefixed tokens.

## Theme and tokens

All variables live in `app/globals.css`; `@theme inline` exposes the semantic colors, fonts, spacing and radii to Tailwind CSS 4. Source colors below are from the Stitch YAML block reproduced in `docs/UI_UX_DESIGN.md` §4.2.

| Token group | Included source tokens |
|---|---|
| Surfaces | `surface`, `surface-dim`, `surface-bright`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`, `surface-variant`, `background`, `surface-cream`, `surface-pure` |
| Text | `on-surface`, `on-surface-variant`, `on-background`, `inverse-surface`, `inverse-on-surface`, `text-muted` |
| Brand | `primary`, `on-primary`, `primary-container`, `on-primary-container`, `inverse-primary`, `surface-tint`, `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container`, `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container` |
| Fixed colors | `primary-fixed`, `primary-fixed-dim`, `on-primary-fixed`, `on-primary-fixed-variant`, `secondary-fixed`, `secondary-fixed-dim`, `on-secondary-fixed`, `on-secondary-fixed-variant`, `tertiary-fixed`, `tertiary-fixed-dim`, `on-tertiary-fixed`, `on-tertiary-fixed-variant` |
| Error | `error`, `on-error`, `error-container`, `on-error-container` |
| Edges and actions | `outline`, `outline-variant`, `border-subtle`, `whatsapp-green` |

Exact values are in the CSS custom properties with those names. The prose proposal aliases remain separate: `brand-proposal-rose-gold` `#B76E79`, `brand-proposal-soft-blush` `#F2E4E2`, `brand-proposal-crimson` `#C92A38`, and `brand-proposal-dark-cocoa` `#292323`. Components do not use these proposal aliases.

Admin-only values (`admin-canvas`, `admin-surface`, `admin-primary`, `admin-text`, `admin-border`, and status pairs) come from the available enterprise console `DESIGN.md`; status tokens are never used to merge lifecycle domains. Success/warning/info/error state treatments use those named status tokens, while the global destructive role uses the source error tokens. WhatsApp green is only used for WhatsApp actions.

Contrast checks for representative text pairs: primary `#8A4853` on white is 6.70:1; primary-container `#A6606B` on white is 4.66:1; muted `#746A66` on cream is 4.92:1; on-secondary-container `#6C6261` on `#EDDFDD` is 4.55:1. Status text uses the darker foregrounds supplied by the admin status palette. Focus indicators use an outline, not text color. These sampled ratios do not replace a full page-level contrast audit.

## Typography

`--font-body` is `"DM Sans", "Avenir Next", Arial, sans-serif`. No local DM Sans file exists, so it uses a system fallback without fetching fonts. `--font-editorial` is a centralized system serif stack (`Georgia`, `Times New Roman`, serif) until the heading family is approved. No font is loaded from Google or another network source.

The unresolved decision is preserved: PRD prefers **Cormorant Garamond**; Stitch YAML and its description prefer **EB Garamond**. Neither was selected as final. `--font-admin-heading` centralizes the enterprise console preference and falls back to the body stack if Plus Jakarta Sans is unavailable.

| Class | Family | Size / line-height | Weight / tracking |
|---|---|---|---|
| `.type-display` | Editorial | 3.5rem / 4rem; mobile 2.5rem / 3rem | 400 / -0.02em; mobile -0.01em |
| `.type-headline-lg` | Editorial | 2.5rem / 3rem; mobile 1.875rem / 2.25rem | 400 / -0.01em; mobile 0 |
| `.type-headline-md` | Editorial | 1.75rem / 2.25rem | 500 / 0 |
| `.type-headline-sm` | Editorial | 1.25rem / 1.75rem | 500 / 0.01em |
| `.type-title-lg` | Body | 1.125rem / 1.625rem | 600 / 0.01em |
| `.type-title-md` | Body | 1rem / 1.5rem | 500 / 0.01em |
| `.type-body-lg` | Body | 1.0625rem / 1.75rem | 400 / 0 |
| `.type-body-md` | Body | 0.9375rem / 1.5rem | 400 / 0 |
| `.type-body-sm` | Body | 0.8125rem / 1.25rem | 400 / 0.01em |
| `.type-label-md` | Body | 0.8125rem / 1rem | 600 / 0.08em |
| `.type-label-sm` | Body | 0.6875rem / 0.875rem | 600 / 0.1em |
| `.type-currency` | Body | 1rem / 1.25rem | 700 / 0.02em; tabular numerals |

## Spacing, grid, shape, elevation and motion

- Spacing: `space-xs` 4px, `space-sm` 8px, `space-md` 16px, `space-lg` 24px, `space-xl` 40px, `space-2xl` 64px; desktop gutter 24px; mobile/tablet/desktop margins 16/32/56px.
- Radius: `radius-sm` 2px, `radius` 4px, `radius-md` 6px, `radius-lg` 8px, `radius-xl` 12px, `radius-full` 9999px.
- Layout: centered 1360px content; source grid is 4 columns on mobile, 8 on tablet, 12 on desktop. Product cards use 3:4 media; mobile two columns, tablet three, desktop four.
- Level 1 shadow matches the source: `0 4px 20px -2px rgba(41,35,35,.06), 0 2px 6px -1px rgba(41,35,35,.03)`. It is for overlays, not ordinary cards.
- Short transitions support drawer and image states; reduced-motion preferences remove nonessential animation and transition. Nothing waits on decorative motion.

## Component catalog and usage

### UI primitives (`components/ui/`)

- `Button`: primary, secondary, tertiary, destructive and WhatsApp variants; default/small/icon sizing; disabled and loading states.
- `Input`, `Textarea`, `Label`, `Badge`, `Card` family, `Separator`, `Skeleton`, `Table` helpers and native `AccordionItem`.
- `Dialog` and `Sheet` use the browser's native `<dialog>` modal behavior for Escape, focus containment and return. `cn` is a small class joiner; no extra utility dependency is needed.

Example: `<Button variant="secondary" disabled>View details</Button>` or `<Input id="email" type="email" aria-describedby="email-help" />`.

### Shared (`components/shared/`)

- `SectionHeading`, `PriceDisplay`, typed `StatusBadge`, `Feedback`, `EmptyState`, `ErrorState`, `LoadingState`, and `ContentPanel`.
- Status badge domains are separate TypeScript unions for order, payment, shipment, reservation and request. A paid payment is not rendered as delivered, and an active reservation is not conflated with inventory availability.
- Price formatting receives an amount and optional compare-at amount; no product, price or promotion is supplied by these components.

### Storefront (`components/storefront/`)

- `ProductCard`: 3:4 image, title, optional metadata/valid compare-at price/badge, availability state, wishlist callback and option-selection entry callback. No size is preselected; missing callbacks hide actions.
- `ProductGallery`: main image, counter, thumbnails, touch swipe, arrows, selected indication and unavailable-image state.
- `CategoryCard`: image-backed editorial link with feature and regular compositions.
- `SizeSelector` and `ColourSwatch`: controlled options with readable names, selected state and disabled unavailable state.
- `QuantityStepper`: controlled value, configurable minimum and optional parent-supplied maximum; no stock operations.
- `ProductFilterDrawer`: native modal shell with caller-provided staged controls and explicit reset/apply/close callbacks; it does not query catalogue data.
- `FaqAccordion`: native keyboard-operable disclosure items.
- `StorefrontBottomNavigation`: mobile-only Home/Shop/Saved/Bag/Profile tabs; hides for cart, checkout and order confirmation flows. It shows no fabricated counts.

### Admin (`components/admin/`)

- `StatCard`: supplied value, optional description/icon, and loading state; missing values render as an em dash.
- `PageHeader`, generic typed `DataTable`, `FilterToolbar`, `FormSection`, `DetailPanel`, and typed `Timeline`.
- Data-table sorting, selection and paging are callbacks from later feature work. No bulk mutation behavior is supplied.

Admin components use the enterprise console surface and crimson token group; they do not import storefront navigation or data services.

## Boundaries and accessibility

These are presentation components. No service or service-role module is imported by `components/`. Components consume props/callbacks for data and state and do not create products, mutate stock, submit orders/payments, or claim a backend operation succeeded.

Interactive targets meet 44px minimum on touch paths; controls have labels, `aria-pressed`, table header scope, text status labels, semantic landmarks, native disclosure/dialog keyboard behavior and visible focus styles. Meaningful images require caller-supplied alt text. Reduced-motion settings are supported. No browser-based interaction test was run in this task; accessibility was reviewed in component markup and responsive styles were validated at CSS breakpoints.

## shadcn/ui setup and remaining gaps

The repo had no shadcn setup, local font files or icon package. The official CLI help/init invocation stalled while resolving the package over the restricted npm network, so no CLI-generated component or theme files were allowed to overwrite the project. `components.json` was added manually for the existing Tailwind 4 CSS path, `@/*` aliases and `components/ui` directory; native, local primitives implement only the needed foundation. No new npm dependency was installed. The CLI can be rerun in a network-enabled environment if generated Radix-based components are later needed.

Remaining decisions/gaps: owner approval of the editorial serif and canonical palette; source customer DESIGN.md is missing; repository admin folder count differs from the brief; there are no component test dependencies, so no tests were installed; active catalogue data and durable component callbacks are deferred to later tasks.
