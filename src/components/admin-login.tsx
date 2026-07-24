"use client";

import Image from "next/image";
import { ArrowRight, SpinnerGap } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLogin({
  configured,
  logo,
  returnTo,
}: {
  configured: boolean;
  logo: string;
  returnTo: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || pending) return;

    setPending(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.replace(returnTo);
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(228,197,143,0.08),transparent_42%)]" />
      <form
        className="relative w-full max-w-sm"
        onSubmit={handleSubmit}
        noValidate
      >
        <Image
          src={logo}
          width={1724}
          height={513}
          alt="Groupe Pure"
          priority
          className="mx-auto h-9 w-auto"
        />
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-[#171a18] shadow-2xl shadow-black/20">
          <label className="sr-only" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="h-14 w-full border-0 border-b border-white/10 bg-transparent px-5 text-base text-white outline-none placeholder:text-white/35 focus:bg-white/[0.025]"
          />
          <label className="sr-only" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="h-14 w-full border-0 bg-transparent px-5 text-base text-white outline-none placeholder:text-white/35 focus:bg-white/[0.025]"
          />
        </div>
        <button
          type="submit"
          disabled={!configured || pending || !email || !password}
          aria-label="Sign in"
          className="mt-4 flex h-13 w-full items-center justify-center rounded-xl bg-[#e4c58f] text-[#101211] transition hover:bg-[#eed4a5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <SpinnerGap className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
        {!configured ? (
          <p className="mt-4 text-center text-sm text-white/45">
            Add the Supabase keys to enable sign in.
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 text-center text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}
