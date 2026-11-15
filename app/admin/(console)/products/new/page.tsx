import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Product creation wizard" description="This page follows the approved Product creation wizard flow. Feature implementation is pending." permission={["products.manage"]} />;
}