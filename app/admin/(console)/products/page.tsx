import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Product catalogue" description="This page follows the approved Product catalogue flow. Feature implementation is pending." permission={["products.manage"]} />;
}