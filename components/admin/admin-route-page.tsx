import { AccessDenied } from "@/components/shared/access-denied";
import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { AdminBreadcrumbs } from "@/components/admin/layout/admin-breadcrumbs";
import { AdminContentContainer } from "@/components/admin/layout/admin-content-container";
import { getAuthorizationContext } from "@/lib/auth/authorization";

type AdminRoutePageProps = {
  title: string;
  description: string;
  permission?: string | string[];
};

export async function AdminRoutePage({ title, description, permission }: AdminRoutePageProps) {
  const context = await getAuthorizationContext();
  const required = permission ? (Array.isArray(permission) ? permission : [permission]) : [];
  if (required.length && (!context || !("permissions" in context) || !required.some((item) => context.permissions.includes(item)))) {
    return <AdminContentContainer><AdminBreadcrumbs title={title} /><AccessDenied /></AdminContentContainer>;
  }
  return <AdminContentContainer><AdminBreadcrumbs title={title} /><PagePlaceholder title={title} description={description} /></AdminContentContainer>;
}
