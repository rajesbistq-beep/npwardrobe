import { AdminRoutePage } from "@/components/admin/admin-route-page";

export default function RoutePage() {
  return <AdminRoutePage title="Review moderation" description="This page follows the approved Review moderation flow. Feature implementation is pending." permission={["reviews.moderate"]} />;
}