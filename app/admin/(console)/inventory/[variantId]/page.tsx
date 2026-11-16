import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorizationContext } from "@/lib/auth/authorization";
import { PageHeader } from "@/components/admin/page-header";
import { InventoryAdjustmentForm } from "@/components/admin/inventory/inventory-forms";
import { getInventoryVariantDetails } from "@/services/inventory.service";

export default async function InventoryVariantPage({ params }: { params: Promise<{ variantId: string }> }) {
  const { variantId } = await params;
  const [details, authorization] = await Promise.all([
    getInventoryVariantDetails(variantId),
    getAuthorizationContext(),
  ]);
  if (!details) notFound();
  const canAdjust = authorization && "permissions" in authorization && authorization.permissions.includes("inventory.adjust");
  const canManageProducts = authorization && "permissions" in authorization && authorization.permissions.includes("products.manage");

  return (
    <div className="admin-content-container">
      <PageHeader
        title={details.product.name}
        description={`Variant ${details.variant.sku} · ${details.variant.status}`}
        breadcrumbs={["Commerce", "Inventory", "Variant stock"]}
        action={canManageProducts ? <Link className="ui-button ui-button--secondary" href={`/admin/products/${details.product.id}`}>Edit product</Link> : undefined}
      />
      <section className="inventory-variant__levels" aria-labelledby="variant-stock-heading">
        <h2 id="variant-stock-heading">Location stock</h2>
        {details.levels.length ? <div className="inventory-levels__list">
          {details.levels.map((level) => (
            <article className="inventory-level" key={level.inventory_level_id}>
              <div className="inventory-level__product">
                <strong>{level.location?.name ?? "Unavailable location"}</strong>
                <span>{level.location?.code ?? ""}</span>
              </div>
              <div className="inventory-level__metric"><span>On hand</span><strong>{level.on_hand_quantity}</strong></div>
              <div className="inventory-level__metric"><span>Reserved</span><strong>{level.reserved_quantity}</strong></div>
              <div className="inventory-level__metric"><span>Available</span><strong>{level.available_quantity}</strong></div>
            </article>
          ))}
        </div> : <p className="inventory-empty">No active inventory locations have stock records for this variant.</p>}
      </section>

      {canAdjust
        ? <InventoryAdjustmentForm variantId={variantId} locations={details.activeLocations} />
        : <p className="inventory-notice">Your role can view stock but cannot post adjustments.</p>}

      <section className="inventory-movements" aria-labelledby="stock-movements-heading">
        <h2 id="stock-movements-heading">Recent stock movements</h2>
        {details.movements.length ? <ol>{details.movements.map((movement) => (
          <li key={movement.id}>
            <span>{movement.movement_type.replaceAll("_", " ")}</span>
            <strong>{movement.on_hand_delta > 0 ? "+" : ""}{movement.on_hand_delta}</strong>
            <span>{movement.reason}</span>
            <time dateTime={movement.created_at}>{new Date(movement.created_at).toLocaleString()}</time>
          </li>
        ))}</ol> : <p className="inventory-empty">No stock movements have been recorded for this variant.</p>}
      </section>
    </div>
  );
}
