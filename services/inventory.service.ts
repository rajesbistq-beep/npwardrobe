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

export async function getInventoryLocations() {
  await requirePermission("inventory.view");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_locations")
    .select("id, code, name, location_type, is_active, created_at, updated_at")
    .order("name")
    .limit(200);
  if (error) throwDatabaseError(error);
  return data ?? [];
}

export async function getAdminInventoryOverview(input: { offset?: number; limit?: number } = {}) {
  const parsed = inventoryReadFilterSchema.safeParse(input);
  if (!parsed.success) throw validationError();
  await requirePermission("inventory.view");
  const supabase = await createClient();
  const availability = await getInventoryAvailability({ offset: parsed.data.offset, limit: parsed.data.limit });
  const variantIds = [...new Set(availability.map(({ variant_id }) => variant_id))];
  const locationIds = [...new Set(availability.map(({ location_id }) => location_id))];
  const [variantsResult, locationsResult] = await Promise.all([
    variantIds.length
      ? supabase.from("product_variants").select("id, product_id, sku").in("id", variantIds)
      : Promise.resolve({ data: [], error: null }),
    locationIds.length
      ? supabase.from("inventory_locations").select("id, code, name").in("id", locationIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (variantsResult.error) throwDatabaseError(variantsResult.error);
  if (locationsResult.error) throwDatabaseError(locationsResult.error);
  const productIds = [...new Set((variantsResult.data ?? []).map(({ product_id }) => product_id))];
  const productsResult = productIds.length
    ? await supabase.from("products").select("id, name, slug").in("id", productIds)
    : { data: [], error: null };
  if (productsResult.error) throwDatabaseError(productsResult.error);
  const variants = new Map((variantsResult.data ?? []).map((variant) => [variant.id, variant]));
  const locations = new Map((locationsResult.data ?? []).map((location) => [location.id, location]));
  const products = new Map((productsResult.data ?? []).map((product) => [product.id, product]));
  return {
    rows: availability.map((row) => {
      const variant = variants.get(row.variant_id);
      const product = variant ? products.get(variant.product_id) : null;
      return {
        ...row,
        sku: variant?.sku ?? null,
        productName: product?.name ?? null,
        productSlug: product?.slug ?? null,
        locationName: locations.get(row.location_id)?.name ?? "Unavailable location",
        locationCode: locations.get(row.location_id)?.code ?? "",
      };
    }),
    hasNextPage: availability.length === parsed.data.limit,
    offset: parsed.data.offset,
    limit: parsed.data.limit,
  };
}

export async function getInventoryVariantDetails(variantId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(variantId)) return null;
  await requirePermission("inventory.view");
  const supabase = await createClient();
  const { data: variant, error } = await supabase
    .from("product_variants")
    .select("id, product_id, sku, status, option_signature")
    .eq("id", variantId)
    .maybeSingle();
  if (error) throwDatabaseError(error);
  if (!variant) return null;
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, slug")
    .eq("id", variant.product_id)
    .maybeSingle();
  if (productError) throwDatabaseError(productError);
  if (!product) return null;
  const [availability, movements, locations] = await Promise.all([
    getInventoryAvailability({ variantId, limit: 100 }),
    getInventoryMovements({ variantId, limit: 100 }),
    getInventoryLocations(),
  ]);
  const locationById = new Map(locations.map((location) => [location.id, location]));
  return {
    variant,
    product,
    levels: availability.map((level) => ({
      ...level,
      location: locationById.get(level.location_id) ?? null,
    })),
    movements,
    activeLocations: locations.filter(({ is_active }) => is_active),
  };
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
