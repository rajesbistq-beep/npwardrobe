import Link from "next/link";
import { getAuthorizationContext } from "@/lib/auth/authorization";
import { PageHeader } from "@/components/admin/page-header";
import { InventoryLocationForm } from "@/components/admin/inventory/inventory-forms";
import { getAdminInventoryOverview, getInventoryLocations } from "@/services/inventory.service";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const PAGE_SIZE = 50;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, Number(first(params.page)) || 1);
  const [inventory, locations, authorization] = await Promise.all([
    getAdminInventoryOverview({ offset: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE }),
    getInventoryLocations(),
    getAuthorizationContext(),
  ]);
  const canAdjust = authorization && "permissions" in authorization && authorization.permissions.includes("inventory.adjust");

  return (
    <div className="admin-content-container">
      <PageHeader title="Inventory" description="Review available, reserved and on-hand stock by product variant and location." breadcrumbs={["Commerce", "Inventory"]} />
      {!locations.length && <div className="inventory-notice"><strong>No inventory locations are configured.</strong><span>Stock cannot be adjusted until an owner-configured location is added.</span></div>}
      {canAdjust && <InventoryLocationForm />}
      {locations.length > 0 && (
        <section className="inventory-locations" aria-labelledby="inventory-locations-heading">
          <h2 id="inventory-locations-heading">Configured locations</h2>
          <ul>{locations.map((location) => <li key={location.id}><strong>{location.name}</strong><span>{location.code} · {location.location_type}</span><span className={location.is_active ? "inventory-location__active" : "inventory-location__inactive"}>{location.is_active ? "Active" : "Inactive"}</span></li>)}</ul>
        </section>
      )}
      <section className="inventory-levels" aria-labelledby="inventory-levels-heading">
        <div className="inventory-levels__heading">
          <div><h2 id="inventory-levels-heading">Stock by variant</h2><p>Showing up to {PAGE_SIZE} location-level records per page.</p></div>
        </div>
        {inventory.rows.length ? <div className="inventory-levels__list">
          {inventory.rows.map((row) => (
            <article className="inventory-level" key={row.inventory_level_id}>
              <div className="inventory-level__product">
                {row.sku
                  ? <Link href={`/admin/inventory/${row.variant_id}`}><strong>{row.productName ?? "Product details unavailable"}</strong><span>SKU {row.sku}</span></Link>
                  : <><strong>Restricted catalogue item</strong><span>Variant {row.variant_id.slice(0, 8)}</span></>}
              </div>
              <div className="inventory-level__location"><span>Location</span><strong>{row.locationName}</strong><small>{row.locationCode}</small></div>
              <div className="inventory-level__metric"><span>On hand</span><strong>{row.on_hand_quantity}</strong></div>
              <div className="inventory-level__metric"><span>Reserved</span><strong>{row.reserved_quantity}</strong></div>
              <div className="inventory-level__metric"><span>Available</span><strong>{row.available_quantity}</strong></div>
              <time className="inventory-level__updated" dateTime={row.updated_at}>{new Date(row.updated_at).toLocaleDateString()}</time>
            </article>
          ))}
        </div> : <p className="inventory-empty">Stock records appear after variants and inventory locations have been configured.</p>}
        <nav className="product-catalog__pagination" aria-label="Inventory pages">
          {page > 1 ? <Link className="ui-button ui-button--secondary ui-button--small" href={`/admin/inventory?page=${page - 1}`}>Previous</Link> : <span />}
          <span>Page {page}</span>
          {inventory.hasNextPage ? <Link className="ui-button ui-button--secondary ui-button--small" href={`/admin/inventory?page=${page + 1}`}>Next</Link> : <span />}
        </nav>
      </section>
    </div>
  );
}
