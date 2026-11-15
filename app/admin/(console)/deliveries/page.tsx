import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Delivery/dispatch queue" description="This page follows the approved Delivery/dispatch queue flow. Feature implementation is pending." permission={["deliveries.view"]} />;
}