import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Cancellation/return/exchange queue" description="This page follows the approved Cancellation/return/exchange queue flow. Feature implementation is pending." permission={["orders.cancel", "returns.manage"]} />;
}