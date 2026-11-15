import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="CMS pages and sections" description="This page follows the approved CMS pages and sections flow. Feature implementation is pending." permission={["content.manage"]} />;
}