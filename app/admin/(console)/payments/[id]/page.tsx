import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Payment detail and verification" description="This page follows the approved Payment detail and verification flow. Feature implementation is pending." permission={["payments.view"]} />;
}