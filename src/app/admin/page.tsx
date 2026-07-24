import { redirect } from "next/navigation";

import AdminLogin from "@/components/admin-login";
import { getAdminIdentity } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { assets } from "@/lib/site-data";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const identity = await getAdminIdentity();
  const requestedReturnTo = (await searchParams).returnTo;
  const returnTo =
    requestedReturnTo?.startsWith("/admin/") &&
    !requestedReturnTo.startsWith("//")
      ? requestedReturnTo
      : "/admin/fr";

  if (identity) {
    redirect(returnTo);
  }

  return (
    <AdminLogin
      configured={isSupabaseConfigured()}
      logo={assets.headerLogo}
      returnTo={returnTo}
    />
  );
}
