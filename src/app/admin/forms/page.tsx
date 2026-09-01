import AdminForms from "@/components/admin-forms";
import { requireAdminIdentity } from "@/lib/auth";
import { defaultFormsDocument } from "@/lib/cms/forms.server";

export default async function AdminFormsPage() {
  const [identity, initialConfig] = await Promise.all([
    requireAdminIdentity("/admin/forms"),
    defaultFormsDocument(),
  ]);

  return <AdminForms email={identity.email} initialConfig={initialConfig} />;
}
