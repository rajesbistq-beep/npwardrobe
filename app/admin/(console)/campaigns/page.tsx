import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Promotions/campaigns" description="This page follows the approved Promotions/campaigns flow. Feature implementation is pending." permission={["promotions.manage"]} />;
}