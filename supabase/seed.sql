-- Safe baseline seed only. No products, prices, stock, shipping fees, merchant
-- credentials, customer accounts or fabricated Nepal geography are inserted.

insert into public.attributes (code, name, attribute_type, is_variant_defining, is_filterable, sort_order)
values
  ('size', 'Size', 'size', true, true, 10),
  ('colour', 'Colour', 'colour_swatch', true, true, 20),
  ('material', 'Material', 'select', false, true, 30),
  ('fit', 'Fit', 'select', false, true, 40),
  ('length', 'Length', 'select', false, true, 50),
  ('sleeve', 'Sleeve', 'select', false, true, 60),
  ('pattern', 'Pattern', 'select', false, true, 70),
  ('occasion', 'Occasion', 'select', false, true, 80)
on conflict (code) do nothing;

insert into public.payment_methods (code, display_name, provider_code, phase, is_enabled, configuration, sort_order)
values
  ('cod', 'Cash on Delivery', 'cod', 'phase_1', false, '{}'::jsonb, 10),
  ('esewa_manual', 'eSewa QR / Manual Verification', 'esewa_manual', 'phase_1', false, '{}'::jsonb, 20),
  ('esewa_gateway', 'eSewa Official Gateway', 'esewa', 'phase_2', false, '{}'::jsonb, 30)
on conflict (code) do nothing;

insert into public.roles (code, name, description, is_system_role)
values
  ('owner', 'Owner', 'Business owner; highest approval authority.', true),
  ('administrator', 'Administrator', 'Operational administrator with broad delegated access.', true),
  ('order_manager', 'Order Manager', 'Order review, transitions, cancellations and delivery coordination.', true),
  ('inventory_manager', 'Inventory Manager', 'Inventory adjustments, locations and stock operations.', true),
  ('payment_verifier', 'Payment Verifier', 'Manual payment verification and COD collection recording.', true),
  ('customer_support', 'Customer Support', 'Customer/order lookup and support request processing.', true),
  ('content_manager', 'Content / Marketing Manager', 'CMS content, campaigns and promotional merchandising.', true)
on conflict (code) do nothing;

insert into public.permissions (code, module, action, description)
values
  ('products.manage','products','manage','Create and manage catalogue records and variants.'),
  ('content.manage','content','manage','Manage and publish CMS content, banners, FAQs and size guides.'),
  ('customers.view','customers','view','View customer records and permitted contact data.'),
  ('orders.view','orders','view','View orders and order history.'),
  ('orders.transition','orders','transition','Perform permitted order-state transitions.'),
  ('orders.cancel','orders','cancel','Execute eligible cancellations.'),
  ('payments.view','payments','view','View payments and private payment evidence.'),
  ('payments.verify','payments','verify','Approve or reject manual payment verification.'),
  ('payments.cod_collect','payments','cod_collect','Record verified COD collection.'),
  ('refunds.approve','refunds','approve','Approve refunds within the approved policy.'),
  ('inventory.view','inventory','view','View inventory quantities, reservations and movement history.'),
  ('inventory.adjust','inventory','adjust','Post authorized stock adjustments and transfers.'),
  ('deliveries.view','deliveries','view','View courier and shipment records.'),
  ('deliveries.manage','deliveries','manage','Assign couriers and manage shipment records.'),
  ('returns.manage','returns','manage','Review cancellation, return and exchange requests.'),
  ('returns.inspect','returns','inspect','Inspect returned items and approve restocking decisions.'),
  ('reviews.moderate','reviews','moderate','Moderate customer product reviews.'),
  ('reviews.view_reports','reviews','view_reports','Review reports against product reviews.'),
  ('promotions.manage','promotions','manage','Manage promotions, coupons and redemptions.'),
  ('settings.manage','settings','manage','Manage non-secret site settings.'),
  ('staff.manage','staff','manage','Manage staff profiles, roles and assignments.'),
  ('audit.view','audit','view','Read append-only audit history.'),
  ('integrations.manage','integrations','manage','Manage provider configuration metadata and integration events.'),
  ('notifications.manage','notifications','manage','Manage templates and inspect delivery attempts.')
on conflict (code) do nothing;

-- Owner and Administrator receive the full permission set. This does NOT
-- assign either role to any auth.users account. Explicit owner provisioning is
-- a separate security-reviewed operation after MFA is configured.
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r cross join public.permissions p
where r.code in ('owner','administrator')
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any(array[
  'orders.view','orders.transition','orders.cancel','deliveries.view','deliveries.manage','customers.view','returns.manage'
])
where r.code = 'order_manager'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any(array['inventory.view','inventory.adjust'])
where r.code = 'inventory_manager'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any(array['payments.view','payments.verify','payments.cod_collect'])
where r.code = 'payment_verifier'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any(array['customers.view','orders.view','payments.view','returns.manage'])
where r.code = 'customer_support'
on conflict do nothing;

insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code = any(array['content.manage','promotions.manage','reviews.moderate','reviews.view_reports'])
where r.code = 'content_manager'
on conflict do nothing;
