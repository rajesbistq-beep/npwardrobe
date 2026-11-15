import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Admin Order Details" description="This page follows the approved Admin Order Details flow. Feature implementation is pending." permission={["orders.view"]} />;
}