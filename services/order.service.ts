import "server-only";

import { requireAuthenticatedUser, requirePermission } from "@/lib/auth/authorization";
import { AppError, throwDatabaseError, validationError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { adminOrderFiltersSchema, customerOrderLookupSchema, transitionOrderSchema } from "@/lib/validations/orders";

const orderColumns = "id, public_reference, customer_id, status, payment_status, currency_code, subtotal, discount_total, shipping_fee, tax_total, grand_total, delivery_address_snapshot, selected_payment_method_code, created_at, updated_at, confirmed_at, shipped_at, delivered_at, cancelled_at";

export async function getCustomerOrder(input: unknown) {
  const parsed = customerOrderLookupSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  const actor = await requireAuthenticatedUser();
  const supabase = await createClient();
  let query = supabase.from("orders").select(orderColumns).eq("customer_id", actor.userId);
  if (parsed.data.orderId) query = query.eq("id", parsed.data.orderId);
  else if (parsed.data.publicReference) query = query.eq("public_reference", parsed.data.publicReference);
  const { data, error } = await query.maybeSingle();
  if (error) throwDatabaseError(error);
  if (!data) throw new AppError("NOT_FOUND", "Order not found.");
  return data;
}

export async function getCustomerOrderHistory(input: unknown = {}) {
  const parsed = adminOrderFiltersSchema.pick({ page: true, pageSize: true }).safeParse(input);
  if (!parsed.success) throw validationError();
  const actor = await requireAuthenticatedUser();
  const supabase = await createClient();
  const from = (parsed.data.page - 1) * parsed.data.pageSize;
  const { data, error, count } = await supabase
    .from("orders")
    .select(orderColumns, { count: "exact" })
    .eq("customer_id", actor.userId)
    .order("created_at", { ascending: false })
    .range(from, from + parsed.data.pageSize - 1);
  if (error) throwDatabaseError(error);
  return { items: data ?? [], page: parsed.data.page, pageSize: parsed.data.pageSize, total: count ?? 0 };
}

export async function getCustomerOrderItems(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success) throw validationError();
  const order = await getCustomerOrder({ orderId: parsed.data.orderId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("id, product_id, variant_id, product_name_snapshot, variant_name_snapshot, sku_snapshot, attributes_snapshot, unit_price, unit_discount, quantity, line_subtotal, line_discount, line_total, currency_code")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getCustomerOrderStatusHistory(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success) throw validationError();
  const order = await getCustomerOrder({ orderId: parsed.data.orderId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_status_history")
    .select("id, from_status, to_status, reason, actor_type, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminOrderStatusHistory(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success || !parsed.data.orderId) throw validationError();
  await requirePermission("orders.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_status_history")
    .select("id, order_id, from_status, to_status, reason, actor_user_id, actor_type, request_id, created_at")
    .eq("order_id", parsed.data.orderId)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getCustomerOrderPaymentSummary(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success) throw validationError();
  const order = await getCustomerOrder({ orderId: parsed.data.orderId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, provider_code, currency_code, amount, status, paid_at, verified_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getCustomerOrderShipments(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success) throw validationError();
  const order = await getCustomerOrder({ orderId: parsed.data.orderId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("id, shipment_reference, tracking_number, status, dispatched_at, delivered_at, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminOrderShipments(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success) throw validationError();
  if (!parsed.data.orderId) throw validationError();
  await requirePermission("deliveries.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shipments")
    .select("id, order_id, courier_id, shipment_reference, tracking_number, status, shipping_fee, currency_code, dispatched_at, delivered_at, delivery_exception, created_at, updated_at")
    .eq("order_id", parsed.data.orderId)
    .order("created_at", { ascending: false });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminOrders(input: unknown = {}) {
  const parsed = adminOrderFiltersSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("orders.view");
  const supabase = await createClient();
  let query = supabase.from("orders").select(`${orderColumns}, guest_name, guest_phone_e164, guest_email`, { count: "exact" });
  if (parsed.data.status) query = query.eq("status", parsed.data.status);
  if (parsed.data.paymentStatus) query = query.eq("payment_status", parsed.data.paymentStatus);
  if (parsed.data.search) {
    const escaped = parsed.data.search.replace(/[\\%_]/g, "\\$&");
    query = query.ilike("public_reference", `%${escaped}%`);
  }
  const from = (parsed.data.page - 1) * parsed.data.pageSize;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + parsed.data.pageSize - 1);
  if (error) throwDatabaseError(error);
  return { items: data ?? [], page: parsed.data.page, pageSize: parsed.data.pageSize, total: count ?? 0 };
}

export async function getAdminOrder(input: unknown) {
  const parsed = customerOrderLookupSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("orders.view");
  const supabase = await createClient();
  let query = supabase.from("orders").select(`${orderColumns}, guest_name, guest_phone_e164, guest_email`);
  if (parsed.data.orderId) query = query.eq("id", parsed.data.orderId);
  else if (parsed.data.publicReference) query = query.eq("public_reference", parsed.data.publicReference);
  const { data, error } = await query.maybeSingle();
  if (error) throwDatabaseError(error);
  if (!data) throw new AppError("NOT_FOUND", "Order not found.");
  return data;
}

export async function getAdminOrderItems(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success) throw validationError();
  const order = await getAdminOrder({ orderId: parsed.data.orderId });
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("order_items")
    .select("id, product_id, variant_id, product_name_snapshot, variant_name_snapshot, sku_snapshot, attributes_snapshot, unit_price, unit_discount, quantity, line_subtotal, line_discount, line_total, currency_code")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminOrderPaymentSummary(orderId: unknown) {
  const parsed = customerOrderLookupSchema.safeParse({ orderId });
  if (!parsed.success) throw validationError();
  if (!parsed.data.orderId) throw validationError();
  await requirePermission("payments.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, payment_method_id, provider_code, currency_code, amount, status, customer_reference, rejection_reason, paid_at, verified_at, verified_by, created_at, updated_at")
    .eq("order_id", parsed.data.orderId)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function transitionOrder(input: unknown) {
  const parsed = transitionOrderSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("orders.transition");
  if (parsed.data.targetStatus === "cancelled") await requirePermission("orders.cancel");
  const supabase = await createClient();
  const { error } = await supabase.rpc("transition_order", {
    p_order_id: parsed.data.orderId,
    p_target_status: parsed.data.targetStatus,
    p_reason: parsed.data.reason ?? undefined,
    p_request_id: parsed.data.requestId ?? undefined,
  });
  if (error) throwDatabaseError(error);
}
