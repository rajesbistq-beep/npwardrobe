import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Inventory overview" description="This page follows the approved Inventory overview flow. Feature implementation is pending." permission={["inventory.view"]} />;
}