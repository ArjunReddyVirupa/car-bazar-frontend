"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CarFront, Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/src/store/useStore";

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { user, hydrateAuth } = useStore();
  useEffect(() => {
    if (!useStore.getState().authChecked) void hydrateAuth();
  }, [hydrateAuth]);
  const nav = [
    { href: "/cars", label: "Browse Cars" },
    { href: "/#why-us", label: "Why Car Bazar" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 text-white shadow-lg shadow-orange-200">
            <CarFront size={23} />
          </span>
          <span className="text-xl font-black tracking-tight">
            Car<span className="text-orange-500">Bazar</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-bold text-slate-600 transition hover:text-orange-500"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
              >
                <LayoutDashboard size={16} /> Admin
              </Link>
            </>
          ) : (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-orange-300 hover:text-orange-600"
            >
              <LogIn size={16} /> Admin Login
            </Link>
          )}
        </div>
        <button
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white p-4 md:hidden">
          <div className="container-page grid gap-2">
            {nav.map((n) => (
              <Link
                key={n.href}
                onClick={() => setOpen(false)}
                href={n.href}
                className="rounded-xl px-4 py-3 font-semibold hover:bg-orange-50"
              >
                {n.label}
              </Link>
            ))}
            {user ? (
              <Link
                onClick={() => setOpen(false)}
                href="/admin"
                className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"
              >
                Admin Dashboard
              </Link>
            ) : (
              <Link
                onClick={() => setOpen(false)}
                href="/admin/login"
                className="rounded-xl bg-orange-500 px-4 py-3 font-bold text-white"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
