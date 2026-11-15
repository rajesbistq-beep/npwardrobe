import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Request resolution" description="This page follows the approved Request resolution flow. Feature implementation is pending." permission={["orders.cancel", "returns.manage"]} />;
}