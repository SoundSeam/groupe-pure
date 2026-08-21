import AdminPages from "@/components/admin-pages";
import { requireAdminIdentity } from "@/lib/auth";
import { loadSiteVisibility } from "@/lib/cms/page-visibility.server";

export default async function AdminPagesPage() {
  const identity = await requireAdminIdentity("/admin/pages");
  const visibility = await loadSiteVisibility();

  return <AdminPages email={identity.email} initialVisibility={visibility} />;
}
