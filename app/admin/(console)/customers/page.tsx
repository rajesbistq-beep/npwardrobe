import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Customer directory" description="This page follows the approved Customer directory flow. Feature implementation is pending." permission={["customers.view"]} />;
}