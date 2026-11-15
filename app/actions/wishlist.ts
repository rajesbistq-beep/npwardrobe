"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthorizationContext } from "@/lib/auth/authorization";
import { wishlistItemSchema } from "@/lib/validations/wishlist";

export type WishlistActionResult = { status: "guest" | "saved" | "removed" | "failed"; items?: { productId: string; variantId: string | null }[] };

export async function setCustomerWishlistItem(input: unknown, saved: boolean): Promise<WishlistActionResult> {
  const parsed = wishlistItemSchema.safeParse(input);
  if (!parsed.success) return { status: "failed" };
  try {
    const context = await getAuthorizationContext();
    if (!context) return { status: "guest" };
    if (context.kind !== "customer") return { status: "failed" };
    const supabase = await createClient();
    const { productId, variantId } = parsed.data;
    const { data: product, error: productError } = await supabase.from("products").select("id").eq("id", productId).eq("status", "published").is("deleted_at", null).or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`).maybeSingle();
    if (productError || !product) return { status: "failed" };
    if (variantId) {
      const { data: variant, error } = await supabase.from("product_variants").select("id").eq("id", variantId).eq("product_id", productId).eq("status", "active").is("deleted_at", null).maybeSingle();
      if (error || !variant) return { status: "failed" };
    }
    const existingWishlist = await supabase.from("wishlists").select("id").eq("customer_id", context.userId).maybeSingle();
    let wishlist = existingWishlist.data;
    if (existingWishlist.error) return { status: "failed" };
    if (!wishlist && saved) {
      const created = await supabase.from("wishlists").insert({ customer_id: context.userId }).select("id").single();
      wishlist = created.data;
      if (!wishlist && created.error?.code === "23505") {
        const retry = await supabase.from("wishlists").select("id").eq("customer_id", context.userId).maybeSingle();
        wishlist = retry.data;
      } else if (created.error) return { status: "failed" };
    }
    if (!wishlist) return { status: saved ? "failed" : "removed" };
    const existingQuery = supabase.from("wishlist_items").select("id").eq("wishlist_id", wishlist.id).eq("product_id", productId);
    const existing = await (variantId ? existingQuery.eq("variant_id", variantId) : existingQuery.is("variant_id", null)).maybeSingle();
    if (existing.error) return { status: "failed" };
    if (saved && !existing.data) {
      const inserted = await supabase.from("wishlist_items").insert({ wishlist_id: wishlist.id, product_id: productId, variant_id: variantId });
      if (inserted.error && inserted.error.code !== "23505") return { status: "failed" };
    } else if (!saved && existing.data) {
      const deleteQuery = supabase.from("wishlist_items").delete().eq("id", existing.data.id).eq("wishlist_id", wishlist.id);
      const deleted = await deleteQuery;
      if (deleted.error) return { status: "failed" };
    }
    return { status: saved ? "saved" : "removed" };
  } catch { return { status: "failed" }; }
}
