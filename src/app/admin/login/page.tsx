"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CarFront,
  LockKeyhole,
  Mail,
  // ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useStore } from "@/src/store/useStore";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
export default function Login() {
  const router = useRouter();
  const { user, login, hydrateAuth } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (!useStore.getState().authChecked) void hydrateAuth();
  }, [hydrateAuth]);
  useEffect(() => {
    if (user) router.replace("/admin");
  }, [user, router]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid credentials.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="grid min-h-[calc(100vh-72px)] place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white">
            <CarFront />
          </span>
          <div>
            <p className="font-black">Car Bazar</p>
            <p className="text-xs font-bold text-slate-400">Admin Console</p>
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-black">Welcome back.</h1>
        <p className="mt-2 text-slate-500">
          Sign in to manage inventory, photos and enquiries.
        </p>
        <form onSubmit={submit} className="mt-7 grid gap-5">
          <label className="grid gap-2 text-sm font-black text-slate-700">
            <span className="flex items-center gap-2">
              <Mail size={15} /> Email
            </span>
            <Input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-black text-slate-700">
            <span className="flex items-center gap-2">
              <LockKeyhole size={15} /> Password
            </span>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-11"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy} className="w-full py-3.5">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        {/* <div className="mt-6 flex items-start gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold leading-5 text-emerald-800">
          <ShieldCheck size={17} className="mt-0.5 shrink-0" /> Authentication
          is handled by the backend using an HttpOnly cookie. The browser never
          stores your JWT.
        </div> */}
        <Link
          href="/"
          className="mt-6 block text-center text-sm font-bold text-slate-500 hover:text-orange-600"
        >
          ← Back to marketplace
        </Link>
      </div>
    </main>
  );
}
