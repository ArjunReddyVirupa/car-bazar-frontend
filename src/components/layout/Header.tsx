"use client";

import Link from "next/link";
import { CarFront, Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/src/store/useStore";
import InstallAppButton from "@/src/components/InstallAppButton";

export function Header() {
  const [open, setOpen] = useState(false);

  const { user, hydrateAuth } = useStore();

  useEffect(() => {
    if (!useStore.getState().authChecked) {
      void hydrateAuth();
    }
  }, [hydrateAuth]);

  const nav = [
    {
      href: "/cars",
      label: "Browse Cars",
    },
    {
      href: "/#why-us",
      label: "Why Car Bazar",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        {/* =========================
            LOGO
        ========================== */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
          aria-label="Guru Datta Car Bazar home"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 text-white shadow-lg shadow-orange-200">
            <CarFront size={23} strokeWidth={2.3} />
          </span>

          <span className="text-xl font-black tracking-tight text-slate-900">
            Car<span className="text-orange-500">Bazar</span>
          </span>
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-slate-600 transition hover:text-orange-500"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* =========================
            DESKTOP ACTIONS
        ========================== */}
        <div className="hidden items-center gap-2 md:flex">
          {/* PWA INSTALL */}
          <InstallAppButton />

          {/* ADMIN */}
          {user ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              <LayoutDashboard size={16} />
              Admin
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              <LogIn size={16} />
              Admin Login
            </Link>
          )}
        </div>

        {/* =========================
            MOBILE MENU BUTTON
        ========================== */}
        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl text-slate-700 transition hover:bg-orange-50 hover:text-orange-500 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* =========================
          MOBILE MENU
      ========================== */}
      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="container-page grid gap-2 p-4">
            {/* Navigation */}
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="my-1 border-t border-slate-100" />

            {/* Install App */}
            <div className="pt-1">
              <InstallAppButton />
            </div>

            {/* Admin */}
            {user ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                <LayoutDashboard size={17} />
                Admin Dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                <LogIn size={17} />
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
