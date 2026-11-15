import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Payment queues" description="This page follows the approved Payment queues flow. Feature implementation is pending." permission={["payments.view"]} />;
}