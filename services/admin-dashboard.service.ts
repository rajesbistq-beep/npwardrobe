import "server-only";

import { getAuthorizationContext } from "@/lib/auth/authorization";
import { AppError, throwDatabaseError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardSummary() {
  const context = await getAuthorizationContext();
  if (!context || !("permissions" in context)) {
    throw new AppError("FORBIDDEN", "You are not allowed to view the admin dashboard.");
  }
  const permissions = new Set(context.permissions);
  const supabase = await createClient();
  const [publishedProducts, draftProducts, inventoryRecords, pendingOrders] = await Promise.all([
    permissions.has("products.manage")
      ? supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "published").is("deleted_at", null)
      : Promise.resolve({ count: null, error: null }),
    permissions.has("products.manage")
      ? supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "draft").is("deleted_at", null)
      : Promise.resolve({ count: null, error: null }),
    permissions.has("inventory.view")
      ? supabase.from("v_inventory_availability").select("inventory_level_id", { count: "exact", head: true })
      : Promise.resolve({ count: null, error: null }),
    permissions.has("orders.view")
      ? supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending")
      : Promise.resolve({ count: null, error: null }),
  ]);
  if (publishedProducts.error) throwDatabaseError(publishedProducts.error);
  if (draftProducts.error) throwDatabaseError(draftProducts.error);
  if (inventoryRecords.error) throwDatabaseError(inventoryRecords.error);
  if (pendingOrders.error) throwDatabaseError(pendingOrders.error);
  return {
    canManageProducts: permissions.has("products.manage"),
    canViewInventory: permissions.has("inventory.view"),
    canViewOrders: permissions.has("orders.view"),
    publishedProducts: publishedProducts.count,
    draftProducts: draftProducts.count,
    inventoryRecords: inventoryRecords.count,
    pendingOrders: pendingOrders.count,
  };
}
