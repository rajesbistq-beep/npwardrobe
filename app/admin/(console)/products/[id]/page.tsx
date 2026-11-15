import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Product editor" description="This page follows the approved Product editor flow. Feature implementation is pending." permission={["products.manage"]} />;
}