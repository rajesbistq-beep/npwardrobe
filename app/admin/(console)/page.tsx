import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { getAdminDashboardSummary } from "@/services/admin-dashboard.service";

export default async function AdminDashboardPage() {
  const summary = await getAdminDashboardSummary();
  const metrics = [
    ...(summary.canManageProducts ? [
      { label: "Published products", value: summary.publishedProducts ?? 0, href: "/admin/products?status=published", description: "Visible in the storefront" },
      { label: "Draft products", value: summary.draftProducts ?? 0, href: "/admin/products?status=draft", description: "Private until published" },
    ] : []),
    ...(summary.canViewInventory ? [
      { label: "Inventory records", value: summary.inventoryRecords ?? 0, href: "/admin/inventory", description: "Variant and location stock levels" },
    ] : []),
    ...(summary.canViewOrders ? [
      { label: "Pending orders", value: summary.pendingOrders ?? 0, href: "/admin/orders", description: "Orders awaiting processing" },
    ] : []),
  ];

  return (
    <div className="admin-content-container">
      <PageHeader title="Admin dashboard" description="A live snapshot of the commerce areas available to your staff role." breadcrumbs={["Overview", "Dashboard"]} />
      {metrics.length ? <section className="admin-dashboard__metrics" aria-label="Commerce summary">
        {metrics.map((metric) => (
          <Link className="admin-dashboard__metric" href={metric.href} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value.toLocaleString()}</strong>
            <small>{metric.description}</small>
          </Link>
        ))}
      </section> : <p className="product-editor__muted">Your role does not currently include dashboard metric permissions.</p>}
      <section className="admin-dashboard__actions" aria-labelledby="admin-dashboard-actions">
        <h2 id="admin-dashboard-actions">Quick actions</h2>
        <div>
          {summary.canManageProducts && <Link className="ui-button ui-button--primary" href="/admin/products/new">Add product</Link>}
          {summary.canManageProducts && <Link className="ui-button ui-button--secondary" href="/admin/products">Manage catalogue</Link>}
          {summary.canViewInventory && <Link className="ui-button ui-button--secondary" href="/admin/inventory">Review inventory</Link>}
          {summary.canViewOrders && <Link className="ui-button ui-button--secondary" href="/admin/orders">Review orders</Link>}
        </div>
      </section>
    </div>
  );
}
