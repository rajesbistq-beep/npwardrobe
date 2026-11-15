import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Variant stock detail/history" description="This page follows the approved Variant stock detail/history flow. Feature implementation is pending." permission={["inventory.view"]} />;
}