# NP Wardrobe — Product Requirements Document (PRD)

**Document status:** Approved discovery baseline  
**Version:** 1.0  
**Date:** 13 November 2026  
**Product:** NP Wardrobe ecommerce website and administration system  
**Primary market:** Nepal  
**Primary currency:** Nepalese Rupees (NPR), displayed with `रु.`

---

## 1. Executive summary

NP Wardrobe is a premium women's fashion ecommerce business serving customers across Nepal. The product will be a mobile-first online store supported by an administration system for products, inventory, orders, customers, payments, delivery, promotions and business operations.

Customers must be able to discover products, select variants such as size and colour, add items to a persistent cart, check out as a guest or signed-in customer, select Cash on Delivery (COD) or eSewa, and submit an order. Every successfully submitted order must first be recorded in the website. The customer is then offered a WhatsApp handoff containing a pre-filled order summary so the business can communicate with and manually confirm the order.

The product will be delivered in phases. Phase 1 prioritizes a reliable, secure shopping and order-management operation. Phase 2 expands automation, analytics, marketing, courier integrations and other advanced capabilities. The architecture and product decisions should avoid blocking those future capabilities.

This PRD defines **what the product must do and how success will be evaluated**. It intentionally does not prescribe a technology stack, database schema, API design or detailed implementation sequence; those belong in the TRD, BACKEND_SCHEMA and IMPLEMENTATION_PLAN documents.

## 2. Business and brand context

| Item | Approved direction |
|---|---|
| Brand | NP Wardrobe |
| Business | Women's clothing and fashion |
| Target customers | Women aged 18–45 |
| Product range | Western wear, ethnic wear, casual wear, partywear and accessories |
| Initial catalogue | Approximately 11–30 products |
| Typical price range | रु. 3,000–6,000 |
| Currency | NPR; display amounts using `रु.` |
| Delivery coverage | Nationwide Nepal |
| Brand position | Premium and luxurious |
| Brand personality | Elegant, feminine, sophisticated, modern and trustworthy |
| Visual direction | Cream + Rose Gold; soft, feminine typography |
| Design reference | H&M's clean, simple, easy-to-shop experience; do not copy its branding or assets |
| Preferred fonts | Cormorant Garamond headings and DM Sans body text, subject to final design validation |
| Preferred domain | `www.npwardrobe.com.np` (registration and availability not yet confirmed) |
| Main support channel | WhatsApp Business: `+977 9740258617` |
| Initial sales target | 20–50 orders per month during the first three months |

The approved UI direction is mobile-first. Approximately 90% of customers are expected to use phones. The interface must therefore prioritize small-screen usability without compromising desktop quality.

## 3. Product vision

Build a complete online fashion business that:

1. Attracts customers with a premium, trustworthy shopping experience.
2. Makes it easy to discover and compare fashion products.
3. Converts browsing into properly recorded orders.
4. Makes WhatsApp communication and manual order confirmation straightforward.
5. Gives the owner clear control over products, stock, orders, payments and delivery.
6. Creates a foundation for repeat purchases and future business growth.

### 3.1 Product principles

- **Mobile first:** Design and test the main shopping journeys on phones first.
- **Trust before friction:** Show clear product, size, payment, delivery and return information.
- **Record before handoff:** Save an order before opening WhatsApp.
- **Stock accuracy:** Prevent overselling through variant-level inventory and reservations.
- **Payment integrity:** Never mark a payment successful merely because a customer selected a payment method or opened a payment screen.
- **Owner control:** Routine store operations should be manageable from the admin dashboard without code changes.
- **Phased delivery:** Launch the essential commerce operation first; add advanced automation after the core workflow is stable.
- **No invented policies:** Unknown prices, delivery estimates, return conditions and merchant details must remain configurable placeholders until the owner supplies them.

## 4. Goals, outcomes and success measures

### 4.1 Business goals

- Launch a functioning ecommerce storefront for customers across Nepal.
- Reach an initial target of 20–50 orders per month during the first three months.
- Establish customer trust in the NP Wardrobe brand.
- Reduce manual effort spent recording and tracking orders.
- Maintain accurate stock across product sizes and colours.
- Provide a foundation for larger product catalogues, more staff and additional sales channels.

### 4.2 Product success measures

| Measure | Initial target or requirement | How it is assessed |
|---|---|---|
| Monthly orders | 20–50 orders/month in the first three months | Admin order report |
| Order recording | 100% of successful checkout submissions have an order record | Compare submitted checkouts with stored orders |
| Cart persistence | Cart survives refresh and normal return visits on the same browser | Manual and automated acceptance tests |
| Inventory accuracy | No overselling of available variants through concurrent checkout | Inventory concurrency tests and order audits |
| Mobile usability | All key journeys work on common phone screen sizes | Responsive and device testing |
| Payment integrity | Unverified eSewa payments are never shown as paid | Payment-state audit and test cases |
| Admin usability | Owner can complete routine product and order tasks without developer help | Owner acceptance testing |
| Order communication | WhatsApp handoff contains the correct order summary | End-to-end checkout test |

Analytics such as conversion rate, abandoned-cart rate, repeat purchase rate, average order value and campaign performance should be captured when the relevant tracking is implemented. Baselines and numeric targets for these measures are still to be agreed.

## 5. Users and roles

### 5.1 Customer segments

- Women aged 18–45 shopping for Western, ethnic, casual, partywear and accessory products.
- Customers shopping on mobile phones, including customers on slower connections.
- Customers who prefer to order through WhatsApp or pay by COD.
- Customers who prefer eSewa and customers who want to track previous purchases.

### 5.2 User roles

| Role | Main needs |
|---|---|
| Guest shopper | Browse, search, save a temporary wishlist, use cart and place an order without registration |
| Registered customer | Shop, view orders, track status, manage profile and addresses, maintain wishlist and request cancellations/returns |
| Store owner / administrator | Full access to products, stock, orders, customers, payments, delivery, promotions, content, reports and settings |
| Staff member | Access only the operational areas assigned by the owner |
| Customer support staff | View relevant customer/order information and handle support tasks, subject to permissions |
| Inventory staff | Manage products, variants and stock within assigned permissions |
| Order staff | Process orders and update permitted order statuses |
| Marketing/content staff | Manage permitted promotions, homepage content and campaigns |

The owner requires multiple staff accounts, configurable roles and permissions, staff activity history and the ability to disable accounts. The detailed permission matrix will be defined in the TRD and backend schema.

## 6. Scope and release strategy

### 6.1 Phase 1 — essential launch

Phase 1 must provide a complete and safe core shopping operation.

**Customer-facing scope**
- Responsive storefront and all agreed core pages.
- Product/category browsing, product details, search and essential filters.
- Size and colour selection where applicable.
- Persistent cart with quantity changes and item removal.
- Guest checkout.
- Customer account foundation and agreed login options, subject to provider configuration.
- COD and manual eSewa payment workflow.
- Order saved in the website before WhatsApp handoff.
- WhatsApp contact and order message.
- Basic order tracking and customer order history.
- Essential wishlist functionality.
- Product reviews may be enabled once verified-purchase rules are available.

**Admin-facing scope**
- Secure owner/admin access.
- Product, category and variant management.
- Variant-level stock control and stock reservation.
- Order viewing, manual confirmation and status management.
- Customer details and order history.
- Payment status and manual eSewa verification.
- Delivery charge settings and manual courier/tracking details.
- Basic return, exchange and cancellation request handling.
- Essential homepage content controls.
- Essential reports for orders and sales.
- Essential staff permissions if more than one operator is enabled.
- Backup and recovery capability.

**Launch quality requirements**
- SEO metadata on every public page.
- Accessible, mobile-friendly interface.
- Image optimization and lazy loading.
- Secure handling of customer and order data.
- Tested checkout, stock and payment-state behaviour.

### 6.2 Phase 2 — advanced growth capabilities

The following capabilities are planned for the expansion phase. They should be considered in product and architecture decisions but must not delay the essential launch unless the owner explicitly reprioritizes them.

- Automated WhatsApp notifications through an approved WhatsApp Business messaging integration.
- Expanded email and in-site notification preferences and templates.
- Official eSewa gateway integration and automatic payment verification.
- Advanced analytics, customer behaviour and campaign reports.
- Advanced marketing rules, scheduled campaigns and promotion combinations.
- Advanced visual homepage/page management and content scheduling.
- Full courier-provider integrations where providers offer suitable integrations.
- Advanced customer recommendations and personalization.
- Advanced team management and detailed activity controls.
- Multilingual management beyond the initial English and Nepali support.
- PWA installation and expanded offline-friendly experiences.
- Advanced return/refund automation and additional operational workflows.

### 6.3 Scope exclusions and boundaries

Unless separately approved, the product does not initially include:
- A native iOS or Android app; the initial product is a responsive website, with PWA capabilities planned as an enhancement.
- A multi-vendor marketplace; NP Wardrobe is a single-brand store.
- Automatic courier integrations before a provider and integration method are selected.
- Automatic eSewa verification before merchant onboarding and gateway configuration are complete.
- Automatic WhatsApp messaging before an approved messaging provider, templates and customer-consent workflow are configured.
- Unconfirmed business policies, delivery prices, delivery promises, return windows or refund timelines.
- Fake or sample merchant credentials, QR codes, tracking numbers, customer reviews or product claims in production.

## 7. Information architecture and pages

The storefront must include the following pages or page templates:

1. **Home:** Hero, promotional banner, featured categories, new arrivals, best sellers, curated collections, brand content, reviews/social gallery and footer.
2. **Shop / All Products:** Product listing, search, filters, sorting and pagination or progressive loading.
3. **Category and subcategory pages:** Western Wear, Ethnic Wear, Casual Wear, Partywear, Accessories and admin-created categories.
4. **Collection pages:** New Arrivals, Best Sellers, Trending, seasonal and admin-created collections.
5. **Product details:** Images, description, price, size/colour variants, stock availability, size guide, quantity, cart action, shipping/returns information, reviews and related products.
6. **Cart:** Items, variants, quantity controls, removal, subtotal, delivery estimate/charge when known, total and checkout action.
7. **Checkout:** Customer details, delivery address, payment choice, order summary and order submission.
8. **Order confirmation / WhatsApp handoff state:** Order reference, saved-order confirmation and next steps to contact the store.
9. **Order tracking:** Lookup by order ID and phone number, with privacy-protective validation.
10. **Customer account:** Profile, order history, order status, saved addresses, wishlist and account settings.
11. **About Us:** Brand story and fashion philosophy.
12. **Contact:** WhatsApp support and contact guidance.
13. **FAQ:** Shopping, sizing, ordering, payments, delivery, returns and exchanges.
14. **Size Guide:** Configurable measurement guidance and charts.
15. **Shipping & Returns:** Owner-managed delivery, return and exchange policies.
16. **Authentication pages/states:** Registration, login, OTP verification, password reset and Google sign-in where configured.
17. **System states:** Empty cart, empty wishlist, no search results, out-of-stock variant, validation errors, payment pending, order lookup failure and service/network errors.

The admin application must provide clearly separated sections for dashboard, products, variants/inventory, categories/collections, orders, customers, payments, delivery/couriers, returns/exchanges, cancellations, promotions, reviews, homepage/content, reports, staff/roles, settings and audit activity. The final navigation labels may be refined during UX design.

## 8. Functional requirements

Priority definitions:
- **P0 — Launch blocker:** Required for a safe and usable Phase 1 launch.
- **P1 — Important:** Expected in Phase 1 where feasible; otherwise explicitly scheduled and accepted before launch.
- **P2 — Expansion:** Planned for Phase 2.

### 8.1 Storefront and navigation

| ID | Priority | Requirement |
|---|---|---|
| FR-001 | P0 | The storefront shall provide responsive layouts, prioritizing mobile screens. |
| FR-002 | P0 | The mobile site shall provide a clear hamburger navigation and accessible tap targets. |
| FR-003 | P0 | Important buttons and controls shall be at least 44px high where practical. |
| FR-004 | P0 | The site shall display products in NPR using the `रु.` symbol consistently. |
| FR-005 | P0 | The site shall provide the agreed public pages and clear navigation between them. |
| FR-006 | P0 | A persistent floating WhatsApp contact action shall be available on public storefront pages without covering essential controls. |
| FR-007 | P1 | English and Nepali language selection shall be supported. English is the initial default. |
| FR-008 | P2 | The product shall support adding further languages through managed translations. |

### 8.2 Product catalogue and discovery

| ID | Priority | Requirement |
|---|---|---|
| FR-010 | P0 | Customers shall browse published products and categories. |
| FR-011 | P0 | Product details shall show name, description, price, photographs, applicable variants and availability. |
| FR-012 | P0 | Customers shall select required size and colour variants before adding a variant-controlled product to cart. |
| FR-013 | P0 | Unavailable variants shall be clearly marked and cannot be ordered. |
| FR-014 | P1 | Customers shall search products by relevant text such as product name and category. |
| FR-015 | P1 | Customers shall filter and sort products by category, size, colour, price and availability where applicable. |
| FR-016 | P1 | The catalogue shall support categories, subcategories and collections managed by administrators. |
| FR-017 | P1 | Product records shall support multiple photos, SKU, material/fabric, care instructions, measurements, tags, SEO fields and related products. |
| FR-018 | P1 | Product variants shall support independent SKU, size, colour, price (where applicable) and stock. |
| FR-019 | P1 | Admin shall be able to create, edit, publish, unpublish and duplicate products. |
| FR-020 | P1 | Admin shall be able to add products individually and import/export catalogue data using supported CSV/Excel formats with validation feedback. |
| FR-021 | P2 | The store shall support trending searches, recently viewed products and personalized recommendations. |
| FR-022 | P2 | Admin shall be able to bulk edit products and variants and generate SKU values automatically. |

### 8.3 Cart

| ID | Priority | Requirement |
|---|---|---|
| FR-030 | P0 | Customers shall add available product variants to cart. |
| FR-031 | P0 | Customers shall increase or decrease item quantities and remove items. |
| FR-032 | P0 | Cart totals shall update correctly when quantities or items change. |
| FR-033 | P0 | The cart shall show product, selected variant, unit price, quantity, line total, subtotal and applicable delivery charge/total when known. |
| FR-034 | P0 | Cart contents shall persist through page refreshes and normal return visits on the same browser using local storage or an equivalent approved persistence mechanism. |
| FR-035 | P0 | The cart count shall remain consistent across storefront pages. |
| FR-036 | P0 | The system shall re-check product availability and current price before order creation; stale cart data must not bypass stock or price rules. |
| FR-037 | P1 | Guest cart contents shall be merged or retained safely when a guest signs in, avoiding unintended duplicate quantities. |
| FR-038 | P1 | A clear empty-cart state and route back to shopping shall be provided. |

### 8.4 Checkout and order creation

| ID | Priority | Requirement |
|---|---|---|
| FR-040 | P0 | Guest customers shall be able to submit an order without creating an account. |
| FR-041 | P0 | Checkout shall collect customer full name, phone number and complete delivery address. |
| FR-042 | P0 | Checkout shall show an order summary with products, selected variants, quantities, prices, subtotal, delivery charge and final total. |
| FR-043 | P0 | Checkout shall allow an available payment method to be selected: COD or eSewa. |
| FR-044 | P0 | On valid submission, the system shall validate current prices, stock, delivery eligibility and required customer fields. |
| FR-045 | P0 | The system shall create and persist an order record before attempting to open WhatsApp. |
| FR-046 | P0 | The system shall generate a unique order reference and show it to the customer. |
| FR-047 | P0 | The system shall generate a pre-filled WhatsApp message containing order reference, customer name, phone, delivery address, products, variants, quantities, item prices, subtotal, delivery charge, total and selected payment method. |
| FR-048 | P0 | The WhatsApp handoff shall use `https://wa.me/9779740258617` and safely encode the message. |
| FR-049 | P0 | If WhatsApp cannot open, the saved order must remain available and the customer must see the order reference and alternative instructions to contact the store. |
| FR-050 | P0 | The site shall not claim that WhatsApp opened, that a message was sent, or that an order was manually confirmed unless the corresponding action/status is actually known. |
| FR-051 | P1 | Signed-in customers shall be able to see the order in their account after successful submission. |
| FR-052 | P1 | The system shall prevent accidental duplicate submissions, for example by disabling repeat submission while the request is processing and using a safe order-submission identifier. |

### 8.5 Order management

| ID | Priority | Requirement |
|---|---|---|
| FR-060 | P0 | Admin shall be able to view, search and filter orders. |
| FR-061 | P0 | Admin shall be able to manually confirm or reject/cancel pending orders and record an internal note. |
| FR-062 | P0 | Admin shall be able to update order status through configured lifecycle states. |
| FR-063 | P0 | The system shall maintain order status history with timestamp and actor. |
| FR-064 | P0 | Order details shall retain a snapshot of product name, SKU/variant, quantities and prices at the time the order was placed. |
| FR-065 | P0 | Admin shall be able to view customer contact and delivery details needed to fulfil the order. |
| FR-066 | P1 | Customers shall be able to look up an order using order ID and phone number. |
| FR-067 | P1 | Signed-in customers shall be able to view order history and status in their account. |
| FR-068 | P1 | Admin shall be able to assign a courier, enter a tracking number and update delivery status manually. |
| FR-069 | P2 | Courier status and tracking information shall be synchronized through selected courier integrations where available. |

### 8.6 Inventory and stock reservations

| ID | Priority | Requirement |
|---|---|---|
| FR-070 | P0 | Inventory shall be tracked by sellable product variant, including size and colour where applicable. |
| FR-071 | P0 | The system shall calculate available stock while accounting for active reservations. |
| FR-072 | P0 | When a valid order is submitted, the required quantities shall be reserved atomically so simultaneous orders cannot oversell the same variant. |
| FR-073 | P0 | When an order is confirmed, the reservation shall be committed to the sale without double-decrementing stock. |
| FR-074 | P0 | When an eligible pending order is cancelled or its reservation expires, the reservation shall be released. |
| FR-075 | P0 | Reservation expiry shall be configurable; the actual duration must be selected by the owner before launch. |
| FR-076 | P0 | Admin shall be able to make and audit manual stock adjustments with a reason. |
| FR-077 | P1 | Admin shall receive configurable low-stock alerts and see out-of-stock variants. |
| FR-078 | P1 | Admin shall be able to view stock history and inventory valuation. |
| FR-079 | P1 | The system shall define how approved cancellations, returns and exchanges affect sellable stock; shipped/used/damaged items must not automatically become available stock without an explicit restock decision. |

### 8.7 Payments

| ID | Priority | Requirement |
|---|---|---|
| FR-080 | P0 | COD shall be available only when enabled for the customer's location, order amount and product conditions. |
| FR-081 | P0 | Admin shall be able to configure COD availability, limits and optional advance-payment rules. |
| FR-082 | P0 | The initial eSewa workflow shall display owner-provided merchant details, payment instructions and a genuine QR code once supplied. |
| FR-083 | P0 | The initial eSewa workflow shall allow a payment reference and/or payment proof to be submitted if that method is chosen by the owner. |
| FR-084 | P0 | Admin shall be able to mark manual eSewa payment as pending verification, verified/paid or rejected, with an audit trail. |
| FR-085 | P0 | An eSewa order shall not be marked paid until the owner/admin verifies payment or a trusted gateway confirmation is received. |
| FR-086 | P1 | The system shall maintain payment status separately from order fulfilment status. |
| FR-087 | P2 | The product shall support official eSewa gateway integration and automatic verification after merchant onboarding, credentials and required configuration are available. |
| FR-088 | P2 | The system shall support additional payment methods only after they are explicitly approved and configured. |

### 8.8 Delivery and shipping

| ID | Priority | Requirement |
|---|---|---|
| FR-090 | P0 | The store shall support delivery across Nepal, subject to owner-configured serviceability rules. |
| FR-091 | P0 | Admin shall configure delivery charges by location/area. |
| FR-092 | P0 | Admin shall configure free-delivery thresholds and promotional free-shipping rules. |
| FR-093 | P0 | Admin shall be able to apply an authorized custom delivery charge to an order and retain the reason/audit record. |
| FR-094 | P0 | Checkout shall show the applicable delivery charge before final order submission whenever the customer's location is sufficient to calculate it. |
| FR-095 | P0 | If a delivery charge cannot be determined automatically, the customer must see a clear notice and the order must follow an owner-defined confirmation process; the site must not invent a fee. |
| FR-096 | P1 | Admin shall record courier name, assigned service, tracking number, dispatch date and delivery status. |
| FR-097 | P2 | Selected courier integrations may create labels or synchronize tracking when supported and approved. |

### 8.9 Accounts, authentication and customer profile

| ID | Priority | Requirement |
|---|---|---|
| FR-100 | P0 | Guest checkout shall remain available and registration shall not be mandatory for purchases. |
| FR-101 | P1 | Customers shall be able to create an account and sign in using configured phone OTP, email/password and Google sign-in options. |
| FR-102 | P1 | Phone OTP and Google sign-in shall not be represented as active until their service/provider setup is completed and tested. |
| FR-103 | P1 | Registered customers shall have a profile, order history, order status, saved addresses, wishlist and account settings. |
| FR-104 | P1 | Customers shall be able to manage their saved delivery addresses. |
| FR-105 | P2 | Guest wishlist items shall persist locally and be merged/synchronized to a customer account on sign-in according to defined merge rules. |

### 8.10 Wishlist and reviews

| ID | Priority | Requirement |
|---|---|---|
| FR-110 | P1 | Customers shall be able to add and remove products from a wishlist. |
| FR-111 | P1 | Customers shall be able to move an available wishlist product to cart. |
| FR-112 | P1 | Signed-in customer wishlists shall be available across devices. |
| FR-113 | P1 | Guest wishlist items shall persist in the same browser. |
| FR-114 | P1 | Only customers with a qualifying purchase of the relevant product shall be eligible for a verified-purchase review. |
| FR-115 | P1 | Reviews shall support a 1–5 star rating and written feedback. |
| FR-116 | P1 | Customer photo uploads shall be supported subject to file validation and moderation. |
| FR-117 | P1 | Reviews shall require admin approval before public display. |
| FR-118 | P1 | The product page shall show approved reviews and an average rating when reviews exist. |

### 8.11 Returns, exchanges and cancellations

| ID | Priority | Requirement |
|---|---|---|
| FR-120 | P1 | Customers shall be able to submit a return, exchange or cancellation request through an available website/account/order lookup workflow. |
| FR-121 | P1 | A request shall capture the related order/item, request type, reason, customer note and any required evidence. |
| FR-122 | P1 | Admin shall be able to approve, reject or request more information and record a reason. |
| FR-123 | P1 | Customers shall be able to view request status. |
| FR-124 | P1 | Cancellation eligibility shall depend on order status and owner-configured rules. |
| FR-125 | P1 | Approval of an eligible pre-shipment cancellation shall release applicable stock reservations. |
| FR-126 | P1 | Refund status and amount shall be recorded; actual transfer/refund processing shall follow the selected payment channel and owner procedure. |
| FR-127 | P1 | Returned items shall only be restocked after an explicit condition/inspection decision. |
| FR-128 | P1 | The website shall display owner-approved return, exchange and cancellation policies; no unapproved policy shall be invented. |

### 8.12 Promotions and discounts

| ID | Priority | Requirement |
|---|---|---|
| FR-130 | P1 | Admin shall be able to set a sale price or discount for an individual product or variant. |
| FR-131 | P1 | The system shall support coupon codes with configurable validity and eligibility rules. |
| FR-132 | P1 | The system shall support festival/seasonal offers, limited-time promotions and minimum-order discounts. |
| FR-133 | P1 | The system shall support free-shipping promotions. |
| FR-134 | P2 | The system shall support buy-one-get-one and more advanced promotion combinations after precedence rules are defined. |
| FR-135 | P1 | Admin shall be able to set promotion start/end times, enable/disable offers and review usage. |
| FR-136 | P0 | The checkout shall clearly show applied discounts and calculate totals consistently; expired or ineligible offers shall not apply. |

### 8.13 Homepage and content management

| ID | Priority | Requirement |
|---|---|---|
| FR-140 | P0 | Admin shall be able to update the essential homepage hero/banner, promotional text and featured products without editing code. |
| FR-141 | P1 | Admin shall be able to manage homepage sections, images, text, collection links and section order. |
| FR-142 | P2 | Admin shall be able to schedule content/campaign publication and preview unpublished changes before release. |
| FR-143 | P1 | Admin shall be able to manage About, FAQ, Size Guide, Contact, Shipping and Returns content. |

### 8.14 Notifications and communication

| ID | Priority | Requirement |
|---|---|---|
| FR-150 | P0 | Order submission shall show a clear saved-order confirmation and WhatsApp next step. |
| FR-151 | P0 | Admin shall be able to contact customers manually through the provided WhatsApp details. |
| FR-152 | P1 | The system shall support configurable email and in-site notification events where the relevant provider is configured. |
| FR-153 | P2 | Automated WhatsApp notifications shall use an approved WhatsApp Business messaging integration and approved templates/consent rules. |
| FR-154 | P2 | Admin shall be able to choose which automated notification types are active and manage message templates. |
| FR-155 | P1 | Notification failures shall not erase or reverse a saved order; the admin/customer shall have a clear fallback where practical. |

### 8.15 Admin, staff and reporting

| ID | Priority | Requirement |
|---|---|---|
| FR-160 | P0 | The owner/admin shall have a protected dashboard for essential store operations. |
| FR-161 | P0 | The admin shall manage products, variants, stock and orders. |
| FR-162 | P1 | The admin shall manage customer records, delivery, payments, returns, reviews and promotions. |
| FR-163 | P1 | The admin shall view order counts and sales totals by selectable date ranges. |
| FR-164 | P1 | The system shall support staff accounts with role-based permissions. |
| FR-165 | P1 | The system shall record important administrative actions with actor and timestamp. |
| FR-166 | P1 | Admin shall be able to export permitted reports and catalogue/order data to CSV or Excel. |
| FR-167 | P2 | Advanced analytics shall include product performance, estimated profit/expenses, inventory valuation, customer growth, payment performance, abandoned carts and campaign performance. |
| FR-168 | P2 | Admin shall be able to configure granular roles, custom permissions and more detailed activity monitoring. |

### 8.16 SEO and sharing

| ID | Priority | Requirement |
|---|---|---|
| FR-170 | P0 | Every public page shall have a unique HTML title and meta description. |
| FR-171 | P0 | Public pages shall provide Open Graph metadata for social and WhatsApp sharing, including title, description and share image. |
| FR-172 | P0 | Meaningful images shall have descriptive alt text; decorative images shall be marked appropriately. |
| FR-173 | P0 | Pages shall use a logical heading hierarchy and semantic content structure. |
| FR-174 | P1 | Product and category pages shall have editable SEO titles, descriptions and clean share metadata. |
| FR-175 | P1 | Canonical URLs and an XML sitemap shall be configured for the confirmed production domain. |
| FR-176 | P1 | Search engine indexing controls shall prevent private account, admin, checkout and other non-public/private pages from being indexed. |

### 8.17 Performance, accessibility and resilience

| ID | Priority | Requirement |
|---|---|---|
| FR-180 | P0 | All key customer journeys shall work on common mobile screen sizes and modern desktop browsers. |
| FR-181 | P0 | Images shall be appropriately sized and optimized; below-the-fold imagery should load lazily where appropriate. |
| FR-182 | P0 | Important controls shall have clear focus, accessible labels and usable tap targets. |
| FR-183 | P0 | The site shall show loading, empty, validation, success and error states for key flows. |
| FR-184 | P0 | Poor network or third-party service failure shall not cause a saved order to disappear. |
| FR-185 | P1 | Performance shall be tested on representative lower-end mobile devices and slower network conditions. |
| FR-186 | P2 | The product shall support an installable PWA and selected offline-friendly experiences, with clear limits on actions requiring a network connection. |

### 8.18 Security, privacy and backup

| ID | Priority | Requirement |
|---|---|---|
| FR-190 | P0 | Admin routes and sensitive actions shall require authentication and authorization. |
| FR-191 | P0 | Staff shall only access data/actions permitted by their assigned roles. |
| FR-192 | P0 | Customer and order information shall not be exposed to unauthorized users. |
| FR-193 | P0 | Secrets, passwords and payment credentials shall not be exposed in public pages or client-side source. |
| FR-194 | P0 | Important order, payment, inventory and admin actions shall be auditable. |
| FR-195 | P1 | Two-step verification shall be supported for administrator accounts. |
| FR-196 | P1 | Automated database backups and a documented restore process shall be available before launch. |
| FR-197 | P1 | Backup restoration shall be tested periodically and after significant system changes. |
| FR-198 | P2 | Advanced login monitoring, alerting and security administration shall be added as the system grows. |

## 9. Core customer journeys

### 9.1 Browse and purchase as a guest

1. Customer opens the homepage on a phone.
2. Customer browses a category or searches for a product.
3. Customer opens a product page and reviews images, description, size guide, price and stock.
4. Customer selects a size/colour and quantity.
5. Customer adds the item to the cart.
6. Customer reviews the cart and changes quantity or removes items if needed.
7. Customer proceeds to checkout without creating an account.
8. Customer enters name, phone and delivery address.
9. Customer selects COD or eSewa, subject to availability.
10. Website validates price, stock, delivery and payment conditions.
11. Website saves the order and reserves stock.
12. Website displays the order reference and opens WhatsApp with the complete pre-filled order message.
13. Admin reviews the order and manually confirms it.

### 9.2 eSewa manual payment

1. Customer chooses eSewa at checkout.
2. Website displays the configured merchant ID, instructions and genuine QR code.
3. Customer pays using the configured eSewa method.
4. Customer enters the payment reference and/or uploads proof if enabled.
5. Order remains in an unpaid/pending-verification payment state.
6. Admin checks the payment and records verification or rejection.
7. Only after verification does the payment state become paid.

### 9.3 Admin fulfilment

1. Admin signs in.
2. Admin opens the new order queue.
3. Admin reviews customer, products, variants, stock, payment method and delivery details.
4. Admin confirms or rejects/cancels the order.
5. On confirmation, the stock reservation is committed.
6. Admin processes the order, assigns a courier and enters tracking information when available.
7. Admin updates shipped and delivered states.
8. Customer can check progress through the available tracking method.

### 9.4 Cancellation and return

1. Customer opens the order or tracking page and submits a request.
2. System checks whether the order state permits the requested action under the configured policy.
3. Admin reviews and approves, rejects or requests more information.
4. Approved eligible pre-shipment cancellation releases the reservation.
5. Return requests are inspected; items are only restocked after an explicit condition decision.
6. Any applicable refund is recorded and processed according to the payment channel and owner procedure.

## 10. Business rules

1. **Currency:** All customer-facing product prices and order totals use NPR and the `रु.` symbol.
2. **Price snapshot:** An order retains the prices and product/variant descriptions that applied when it was submitted; later catalogue edits do not rewrite historical orders.
3. **Order creation:** The order must be saved before WhatsApp is opened.
4. **WhatsApp limitation:** Opening WhatsApp does not prove the customer sent the message or that the store confirmed the order.
5. **Manual confirmation:** New orders are subject to owner/staff confirmation unless a later approved workflow changes this rule.
6. **Stock reservation:** Submission reserves available variant stock. Confirmation commits the reservation. Eligible cancellation or expiry releases it.
7. **Reservation expiry:** The duration and customer/admin warning behaviour must be configured before launch.
8. **Payment state:** Payment status is independent from fulfilment status.
9. **eSewa verification:** Manual eSewa payments remain unverified until an authorized admin records successful verification; gateway payments require trusted confirmation.
10. **COD availability:** COD eligibility is determined by configured location, order amount, product and optional advance-payment rules.
11. **Delivery fees:** Checkout must use configured location rules or explicitly disclose that the charge needs confirmation. It must not invent fees.
12. **Discounts:** The system must validate coupon dates, usage limits and eligibility at checkout. Promotion stacking/precedence must be explicitly configured.
13. **Reviews:** A verified-purchase badge is allowed only when the reviewer has a qualifying purchase of that product. Public reviews require moderation approval.
14. **Cancellations:** Eligibility depends on order status and the owner-approved cancellation policy.
15. **Returns/restocking:** Returned products are not automatically returned to sellable stock; an authorized inspection/restock decision is required.
16. **Guest data:** Guests can purchase without registration. Guest order lookup must verify enough information to prevent casual access to another customer's order.
17. **Content accuracy:** Product photos, stock, measurements, delivery times, fees and policies must be accurate or clearly marked as placeholders until confirmed.
18. **Permissions:** Staff actions must be limited by role and recorded for sensitive operations.

## 11. Non-functional requirements

### 11.1 Usability and responsive design

- Mobile-first layouts for the main customer and admin workflows.
- Responsive behaviour across phone, tablet and desktop widths.
- Mobile hamburger navigation.
- Primary buttons and controls at least 44px tall where practical.
- Readable typography, adequate contrast and clear focus states.
- No horizontal overflow on supported screen sizes.
- Forms must have clear labels, inline validation and useful error messages.
- Important actions must not be obstructed by the floating WhatsApp control.

### 11.2 Performance

- Optimize product and hero images and provide responsive image sizes.
- Lazy-load non-critical below-the-fold imagery.
- Minimize unnecessary scripts, animations and network requests.
- Test on slower mobile network conditions and representative lower-end devices.
- Define measurable performance budgets in the TRD/implementation plan before release.

### 11.3 Reliability and data integrity

- Cart state must survive page refreshes in the same browser.
- Checkout must prevent duplicate order creation from repeated clicks or network retries.
- Inventory reservations must be concurrency-safe.
- Notification or WhatsApp handoff failure must not delete an order.
- Payment and order status changes must be auditable.
- Backup and restore procedures must be tested.

### 11.4 Accessibility

- Use semantic headings, labels and controls.
- Provide descriptive text alternatives for informative images.
- Ensure keyboard access and visible focus for interactive controls.
- Do not rely on colour alone to convey errors, stock or payment state.
- Maintain sufficient text/background contrast.

### 11.5 Privacy and security

- Collect only customer data needed for fulfilment and support.
- Restrict customer/order visibility to authorized roles.
- Protect account credentials and authentication flows.
- Keep payment secrets and integration credentials server-side.
- Apply validation to user input and uploaded files.
- Provide appropriate privacy and policy content before public launch.
- Define data retention, deletion and access procedures in the technical/legal launch checklist.

## 12. Acceptance criteria for launch-critical features

The following criteria must pass before Phase 1 is considered ready.

### 12.1 Product and variant

- Given a product with size/colour variants, when a customer selects an available variant, the selected variant is shown in the cart.
- Given an unavailable variant, when a customer attempts to add it, the system prevents the addition and explains why.
- Given a product price or stock update after the customer added it to cart, when the customer checks out, the system revalidates current information and asks the customer to review any change.

### 12.2 Cart

- Given a customer adds an item, when they refresh or navigate between store pages, the item remains in the cart.
- Given a customer changes quantity or removes an item, line totals, subtotal and cart count update correctly.
- Given an empty cart, the customer sees an empty state and a route back to shopping.

### 12.3 Checkout and WhatsApp

- Given valid customer details and available stock, when the customer submits checkout once, the system creates one order record and a unique order reference.
- The saved order includes customer details, product/variant snapshots, quantities, amounts, delivery details and selected payment method.
- The WhatsApp message contains the same order reference and order totals as the saved order.
- The WhatsApp URL is correctly encoded and uses the approved business number.
- If WhatsApp cannot open, the order remains saved and the customer sees the order reference and next steps.
- Invalid or incomplete required fields prevent submission and show clear messages.
- Repeated taps or retries do not create duplicate orders for the same submission.

### 12.4 Inventory

- Given limited stock for a variant, when two customers attempt to order the last unit at nearly the same time, no more than one order can reserve it.
- A pending order reservation reduces available-to-sell quantity.
- Confirming the order commits the reservation without subtracting the same unit twice.
- Cancelling an eligible pending order releases its reservation.
- An expired reservation is released according to the configured timeout and is recorded in the inventory/order history.

### 12.5 Payments

- COD is only offered when the configured rules permit it.
- An eSewa payment submitted with a reference/proof is marked pending verification, not paid.
- Only an authorized admin or trusted gateway confirmation can mark an eSewa payment paid.
- Payment status changes are recorded with actor, time and method.

### 12.6 Admin and delivery

- An authorized admin can locate an order, review details, confirm/cancel it and update the order status.
- Staff cannot access an admin function outside their assigned permissions.
- Delivery charge shown at checkout matches the configured rule or is clearly marked for confirmation.
- Admin can record courier and tracking information without changing the original order contents.

### 12.7 SEO and responsive experience

- Each public page has a unique title and meta description.
- Social sharing metadata is present and appropriate to the page.
- Informative images have useful alt text.
- Core journeys work on supported mobile and desktop sizes.
- Navigation and primary controls are usable by touch and keyboard.

## 13. Risks, dependencies and mitigations

| Risk/dependency | Impact | Mitigation / decision needed |
|---|---|---|
| Domain is not yet confirmed | Production URL and SEO launch could be delayed | Register/check `npwardrobe.com.np`; confirm ownership and DNS before launch |
| Product data/photos incomplete | Poor product trust and inaccurate listings | Prepare a product catalogue, actual prices, sizes, measurements and real photos; label temporary images clearly |
| eSewa merchant onboarding/details unavailable | Manual payments cannot be safely completed | Obtain merchant details and genuine QR; test payment and admin verification before enabling eSewa |
| eSewa gateway setup unavailable | Automatic payment verification cannot launch | Keep manual verification; schedule gateway integration for Phase 2 |
| WhatsApp integration not configured | Automated messages cannot be sent | Use click-to-chat pre-filled messages for initial launch; evaluate approved Business messaging integration later |
| Courier providers/charges unknown | Delivery fee or ETA may be uncertain | Select provider(s), coverage, rate rules and service estimates before publishing delivery promises |
| Stock reservation rules incomplete | Stock may be held too long or released incorrectly | Owner must select reservation duration and define expiry handling before launch |
| Return/refund policies not finalized | Customer disputes and operational ambiguity | Owner must approve eligibility, timelines, conditions and refund process before launch |
| OTP/Google provider setup incomplete | Some login methods unavailable | Keep guest checkout; configure and test identity providers before enabling each login method |
| Advanced scope is large | Phase 1 may be delayed by feature creep | Enforce phased release and P0/P1/P2 priorities |
| Poor mobile connectivity | Abandoned or failed checkout | Optimize assets, retain order records across WhatsApp failures and test on slower connections |
| Payment/order state confusion | Incorrect fulfilment or false paid status | Keep payment and fulfilment statuses separate and audit every change |

## 14. Open decisions and launch inputs still required

The discovery interview approved the product direction, but the following operational details have not yet been supplied. They must be confirmed before the relevant feature is enabled in production.

### Business setup
- Registered business/legal details and the public business address, if required.
- Confirmed production domain registration and DNS access.
- Final logo files, brand assets and approved Stitch design/export.
- Final product catalogue with real prices, SKU rules, variants, stock and photographs.

### Payments
- eSewa merchant ID and verified merchant details.
- Genuine eSewa QR code and approved customer instructions.
- Whether payment proof upload, payment reference, or both are required.
- COD advance-payment rules and amount/percentage, if any.

### Delivery
- Courier provider(s) and areas served.
- Delivery charge by location.
- Free-shipping threshold and promotion rules.
- Expected delivery windows by area, once verified.
- Process for orders whose delivery charge cannot be calculated automatically.

### Inventory and orders
- Initial stock quantities for every size/colour variant.
- Reservation expiry duration.
- Whether all orders require manual confirmation (current assumption: yes).
- Exact status transitions and staff permissions.

### Policies and customer communications
- Return/exchange eligibility, time window and product condition rules.
- Cancellation deadline and rules for shipped orders.
- Refund process and expected processing time.
- Privacy policy, terms, shipping policy and customer consent language.
- Whether customers must explicitly opt in to promotional messages.

### Accounts and notifications
- OTP provider and sender configuration.
- Google sign-in project/configuration.
- Email sending provider and sender address.
- Whether automated WhatsApp messaging will be enabled in Phase 2 and which approved provider will be used.

### Reporting
- Whether profit reporting should use product cost, shipping cost, discounts and other expenses; these cost fields must be supplied before profit can be calculated meaningfully.
- Sales targets beyond the initial 20–50 orders/month goal.

## 15. Definition of done

Phase 1 is considered complete only when:

1. The approved storefront pages are implemented and responsive.
2. The owner can manage products, variants, stock and essential content.
3. Customers can browse, search, select variants and use the cart.
4. Cart contents persist after refresh on the same browser.
5. Guest checkout works and collects the required details.
6. Valid checkout creates a persistent order before WhatsApp handoff.
7. WhatsApp receives a correctly formatted pre-filled message when opened by the customer.
8. COD and manual eSewa workflows operate according to configured settings.
9. Payment states cannot be falsely marked successful.
10. Stock reservations prevent overselling and release appropriately.
11. Admin can confirm, process, cancel and fulfil orders.
12. Delivery prices are configured or transparently confirmed rather than invented.
13. Customer order information is protected by authentication and permissions.
14. SEO metadata, social sharing metadata and image alt text are present.
15. Backups and a tested recovery procedure are in place.
16. Critical mobile, accessibility, security and failure-state tests pass.
17. Owner acceptance testing is completed using real products, real payment details and real delivery rules.

## 16. Glossary

| Term | Meaning |
|---|---|
| SKU | A unique code used to identify a product or product variant |
| Variant | A purchasable version of a product, such as a particular size and colour |
| Available stock | Sellable quantity after subtracting active reservations |
| Reservation | Temporary hold on stock for a submitted order awaiting confirmation |
| Commit reservation | Convert a reserved quantity into a confirmed sale without double-counting stock |
| COD | Cash on Delivery |
| OTP | One-time password used to verify a phone number or sign-in attempt |
| PWA | Progressive Web App; a website that can offer app-like installation and selected offline features |
| Verified purchase | A review linked to a qualifying completed purchase of the reviewed product |
| Phase 1 | Essential release required to operate the store safely |
| Phase 2 | Advanced capabilities planned after the essential release |

## 17. Document governance

- This PRD is the approved product-discovery baseline for NP Wardrobe.
- Changes to scope, priorities, workflows or business rules should be recorded as revisions rather than silently assumed.
- The TRD must translate these requirements into technical choices without changing the approved product behaviour.
- APP_FLOW must describe the screens and transitions for the user journeys in this document.
- UI_UX_DESIGN must align with the approved Cream + Rose Gold premium brand direction and the mobile-first requirement.
- BACKEND_SCHEMA must support the entities, relationships, status histories, stock reservations, payment records, permissions and audit requirements described here.
- IMPLEMENTATION_PLAN must sequence work according to Phase 1/Phase 2 priorities and the acceptance criteria in this PRD.

---

**End of PRD — NP Wardrobe**
