import "server-only";

import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminIdentity = {
  id: string;
  email: string;
};

function isAllowedAdmin(email: string) {
  const allowlist = process.env.ADMIN_EMAILS?.split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return !allowlist?.length || allowlist.includes(email.toLowerCase());
}

export async function getAdminIdentity(): Promise<AdminIdentity | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims?.sub;
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;

  if (error || !subject || !email || !isAllowedAdmin(email)) {
    return null;
  }

  return { id: subject, email };
}

export async function requireAdminIdentity(returnTo = "/admin") {
  const identity = await getAdminIdentity();

  if (!identity) {
    redirect(`/admin?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return identity;
}
