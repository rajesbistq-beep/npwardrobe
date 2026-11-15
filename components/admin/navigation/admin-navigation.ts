export type AdminNavigationItem = { href: string; label: string };
export type AdminNavigationGroup = { label: string; items: AdminNavigationItem[] };

export const ADMIN_NAVIGATION: AdminNavigationGroup[] = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
  { label: "Commerce", items: [{ href: "/admin/orders", label: "Orders" }, { href: "/admin/products", label: "Products" }, { href: "/admin/inventory", label: "Inventory" }, { href: "/admin/import-export", label: "Import / Export" }, { href: "/admin/payments", label: "Payments" }, { href: "/admin/deliveries", label: "Deliveries" }, { href: "/admin/requests", label: "Requests" }, { href: "/admin/customers", label: "Customers" }] },
  { label: "Experience", items: [{ href: "/admin/reviews", label: "Reviews" }, { href: "/admin/content", label: "Content" }, { href: "/admin/campaigns", label: "Campaigns" }, { href: "/admin/reports", label: "Reports" }] },
  { label: "Administration", items: [{ href: "/admin/staff", label: "Staff" }, { href: "/admin/roles", label: "Roles & permissions" }, { href: "/admin/activity", label: "Activity" }, { href: "/admin/settings", label: "Settings" }] },
];
