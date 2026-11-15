import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Audit/activity history" description="This page follows the approved Audit/activity history flow. Feature implementation is pending." permission={["audit.view"]} />;
}