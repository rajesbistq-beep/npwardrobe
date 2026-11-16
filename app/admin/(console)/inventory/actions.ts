"use server";

import { revalidatePath } from "next/cache";
import { AppError, throwDatabaseError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";
import { adjustInventory } from "@/services/inventory.service";
import { inventoryAdjustmentSchema, inventoryLocationSchema } from "@/lib/validations/inventory";

export type InventoryActionState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function createInventoryLocationAction(
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const parsed = inventoryLocationSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    locationType: formData.get("locationType"),
  });
  if (!parsed.success) return { status: "error", message: "Enter a valid location name, code, and type." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("create_inventory_location", {
      p_code: parsed.data.code,
      p_name: parsed.data.name,
      p_location_type: parsed.data.locationType,
    });
    if (error) throwDatabaseError(error);
    revalidatePath("/admin/inventory");
    return { status: "success", message: "Inventory location created. Active variants are ready for stock adjustments." };
  } catch (error) {
    if (error instanceof AppError) return { status: "error", message: error.message };
    throw error;
  }
}

export async function adjustInventoryAction(
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const quantityDelta = typeof formData.get("quantityDelta") === "string" ? Number(formData.get("quantityDelta")) : Number.NaN;
  const parsed = inventoryAdjustmentSchema.safeParse({
    variantId: formData.get("variantId"),
    locationId: formData.get("locationId"),
    quantityDelta,
    reasonCode: formData.get("reasonCode"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { status: "error", message: "Enter a non-zero whole-unit adjustment and a reason." };

  try {
    await adjustInventory(parsed.data);
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${parsed.data.variantId}`);
    return { status: "success", message: "Stock adjustment posted." };
  } catch (error) {
    if (error instanceof AppError) return { status: "error", message: error.message };
    throw error;
  }
}
