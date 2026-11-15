import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Staff directory/invitations" description="This page follows the approved Staff directory/invitations flow. Feature implementation is pending." permission={["staff.manage"]} />;
}