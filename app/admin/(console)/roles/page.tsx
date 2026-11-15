import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Role and permission editor" description="This page follows the approved Role and permission editor flow. Feature implementation is pending." permission={["staff.manage"]} />;
}