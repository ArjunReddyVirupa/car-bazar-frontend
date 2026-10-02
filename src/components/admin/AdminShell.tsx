"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CarFront,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Inbox,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/src/store/useStore";
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, authChecked, hydrateAuth, logout } = useStore();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const isLogin = path === "/admin/login";
  useEffect(() => {
    if (!authChecked && !isLogin) void hydrateAuth();
  }, [authChecked, hydrateAuth, isLogin]);
  useEffect(() => {
    if (authChecked && !user && !isLogin) router.replace("/admin/login");
  }, [authChecked, user, router, isLogin]);
  if (isLogin) return <>{children}</>;
  if (!authChecked || !user)
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="size-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
      </div>
    );
  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cars/new", label: "Add car", icon: PlusCircle },
    { href: "/admin#enquiries", label: "Enquiries", icon: Inbox },
  ];
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 p-5 text-white transition-transform lg:static lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500">
                <CarFront />
              </span>
              <span className="font-black">Car Bazar</span>
            </Link>
            <button className="lg:hidden" onClick={() => setOpen(false)}>
              <X />
            </button>
          </div>
          <div className="mt-8 grid gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                  path === href
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
          <div className="absolute bottom-5 left-5 right-5 grid gap-2">
            <Link
              href="/"
              className="rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white"
            >
              View marketplace
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.replace("/admin/login");
              }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-7">
            <button className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu />
            </button>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-black">{user.name}</p>
                <p className="text-xs font-bold text-slate-400">
                  Administrator
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-full bg-orange-100 font-black text-orange-700">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          </header>
          <div className="p-4 sm:p-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
