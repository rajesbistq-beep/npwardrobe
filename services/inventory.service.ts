import "server-only";

import { requirePermission } from "@/lib/auth/authorization";
import { throwDatabaseError, validationError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { inventoryAdjustmentSchema, inventoryReadFilterSchema } from "@/lib/validations/inventory";

export async function getInventoryAvailability(input: unknown = {}) {
  const parsed = inventoryReadFilterSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("inventory.view");
  const supabase = await createClient();
  let query = supabase
    .from("v_inventory_availability")
    .select("inventory_level_id, variant_id, location_id, on_hand_quantity, reserved_quantity, available_quantity, updated_at")
    .order("updated_at", { ascending: false });
  if (parsed.data.variantId) query = query.eq("variant_id", parsed.data.variantId);
  if (parsed.data.locationId) query = query.eq("location_id", parsed.data.locationId);
  const { data, error } = await query.range(parsed.data.offset, parsed.data.offset + parsed.data.limit - 1);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getInventoryLevels(input: unknown = {}) {
  const parsed = inventoryReadFilterSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("inventory.view");
  const supabase = await createClient();
  let query = supabase
    .from("inventory_levels")
    .select("id, variant_id, location_id, on_hand_quantity, version, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (parsed.data.variantId) query = query.eq("variant_id", parsed.data.variantId);
  if (parsed.data.locationId) query = query.eq("location_id", parsed.data.locationId);
  const { data, error } = await query.range(parsed.data.offset, parsed.data.offset + parsed.data.limit - 1);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getInventoryMovements(input: unknown = {}) {
  const parsed = inventoryReadFilterSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("inventory.view");
  const supabase = await createClient();
  let query = supabase
    .from("inventory_movements")
    .select("id, inventory_level_id, variant_id, location_id, movement_type, on_hand_delta, reserved_delta, reason, actor_user_id, created_at")
    .order("created_at", { ascending: false });
  if (parsed.data.variantId) query = query.eq("variant_id", parsed.data.variantId);
  if (parsed.data.locationId) query = query.eq("location_id", parsed.data.locationId);
  const { data, error } = await query.range(parsed.data.offset, parsed.data.offset + parsed.data.limit - 1);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getStockReservations(input: unknown = {}) {
  const parsed = inventoryReadFilterSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("inventory.view");
  const supabase = await createClient();
  let query = supabase
    .from("stock_reservations")
    .select("id, order_id, status, idempotency_key, expires_at, committed_at, released_at, expired_at, release_reason, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (parsed.data.orderId) query = query.eq("order_id", parsed.data.orderId);
  const { data, error } = await query.range(parsed.data.offset, parsed.data.offset + parsed.data.limit - 1);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getStockReservationItems(input: unknown) {
  const parsed = inventoryReadFilterSchema.safeParse(input);
  if (!parsed.success || !parsed.data.reservationId) throw validationError();
  await requirePermission("inventory.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_reservation_items")
    .select("id, reservation_id, order_item_id, variant_id, location_id, quantity, created_at")
    .eq("reservation_id", parsed.data.reservationId)
    .order("created_at", { ascending: true });
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function adjustInventory(input: unknown) {
  const parsed = inventoryAdjustmentSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("inventory.adjust");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("post_inventory_adjustment", {
    p_variant_id: parsed.data.variantId,
    p_location_id: parsed.data.locationId,
    p_quantity_delta: parsed.data.quantityDelta,
    p_reason_code: parsed.data.reasonCode,
    p_reason: parsed.data.reason,
  });
  if (error) throwDatabaseError(error);
  return { adjustmentId: data };
}
