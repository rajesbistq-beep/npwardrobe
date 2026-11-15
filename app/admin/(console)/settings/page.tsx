import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Store, integration and security settings" description="This page follows the approved Store, integration and security settings flow. Feature implementation is pending." permission={["settings.manage"]} />;
}