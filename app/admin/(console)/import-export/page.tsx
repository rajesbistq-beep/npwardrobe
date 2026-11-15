import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Product import/export" description="This page follows the approved Product import/export flow. Feature implementation is pending." permission={["products.manage"]} />;
}