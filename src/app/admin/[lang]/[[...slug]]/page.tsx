import { notFound } from "next/navigation";

import AdminEditor from "@/components/admin-editor";
import { requireAdminIdentity } from "@/lib/auth";
import { getDictionary } from "@/lib/dictionaries";
import { hasLocale } from "@/lib/i18n";
import { isEditablePagePath } from "@/lib/cms/pages";

export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{ lang: string; slug?: string[] }>;
}) {
  const { lang, slug = [] } = await params;
  const route = slug.join("/");
  const pagePath = `/${lang}${route ? `/${route}` : ""}`;

  if (!hasLocale(lang) || !isEditablePagePath(pagePath)) {
    notFound();
  }

  const identity = await requireAdminIdentity(`/admin${pagePath}`);
  const dictionary = route === "projects" ? await getDictionary(lang) : null;

  return (
    <AdminEditor
      email={identity.email}
      initialPath={pagePath}
      initialProjects={dictionary?.projects}
      locale={lang}
    />
  );
}
