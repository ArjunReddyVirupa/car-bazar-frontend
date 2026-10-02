"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CarFront,
  Clock3,
  IndianRupee,
  MessageSquare,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useStore } from "@/src/store/useStore";
import { api } from "@/src/lib/api";
import { Button } from "@/src/components/ui/Button";
import type { Enquiry } from "@/src/types";
export default function Dashboard() {
  const { cars, loadCars, removeCar, updateStatus } = useStore();
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    reservedCars: 0,
    soldCars: 0,
    enquiries: 0,
  });
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [busy, setBusy] = useState("");
  const refresh = async () => {
    const [d, e] = await Promise.all([api.dashboard(), api.enquiries()]);
    setStats(d.data);
    setEnquiries(e.data);
  };
  useEffect(() => {
    void loadCars();
    void refresh();
  }, [loadCars]);
  const del = async (id: string) => {
    if (!confirm("Delete this car and its photos? This cannot be undone."))
      return;
    setBusy(id);
    try {
      await api.deleteCar(id);
      const target = cars.find((c) => c.id === id);
      removeCar(id);
      setStats((s) => ({
        ...s,
        totalCars: Math.max(0, s.totalCars - 1),
        availableCars:
          target?.status === "AVAILABLE"
            ? Math.max(0, s.availableCars - 1)
            : s.availableCars,
        reservedCars:
          target?.status === "RESERVED"
            ? Math.max(0, s.reservedCars - 1)
            : s.reservedCars,
        soldCars:
          target?.status === "SOLD" ? Math.max(0, s.soldCars - 1) : s.soldCars,
      }));
    } finally {
      setBusy("");
    }
  };
  const status = async (
    id: string,
    value: "AVAILABLE" | "RESERVED" | "SOLD" | "INACTIVE"
  ) => {
    setBusy(id);
    try {
      await updateStatus(id, value);
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-black uppercase tracking-widest text-orange-500">
            Admin console
          </p>
          <h1 className="mt-1 text-3xl font-black">Good morning 👋</h1>
          <p className="mt-2 text-slate-500">
            Manage your inventory without leaving the dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="cursor-pointer" variant="soft" onClick={refresh}>
            <RefreshCw size={16} /> Refresh
          </Button>
          <Link
            href="/admin/cars/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-200"
          >
            <Plus size={17} /> Add car
          </Link>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [
            CarFront,
            "Total cars",
            stats.totalCars,
            "bg-orange-50 text-orange-600",
          ],
          [
            CarFront,
            "Available",
            stats.availableCars,
            "bg-emerald-50 text-emerald-600",
          ],
          [
            Clock3,
            "Reserved",
            stats.reservedCars,
            "bg-amber-50 text-amber-600",
          ],
          [IndianRupee, "Sold", stats.soldCars, "bg-violet-50 text-violet-600"],
          [
            MessageSquare,
            "Enquiries",
            stats.enquiries,
            "bg-pink-50 text-pink-600",
          ],
        ].map(([I, l, v, c]) => {
          const Icon = I as typeof CarFront;
          return (
            <div
              key={l as string}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div
                className={`grid size-10 place-items-center rounded-xl ${c}`}
              >
                <Icon size={19} />
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">
                {l as string}
              </p>
              <p className="mt-1 text-3xl font-black">{v as number}</p>
            </div>
          );
        })}
      </div>
      <section
        className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"
        id="inventory"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-xl font-black">Inventory</h2>
            <p className="text-sm text-slate-500">
              Changes update local state immediately.
            </p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {cars.length ? (
            cars.map((car) => (
              <div
                key={car.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-black">
                    {car.brand} {car.model}{" "}
                    <span className="font-medium text-slate-400">
                      {car.variant}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    ₹{car.price.toLocaleString("en-IN")} ·{" "}
                    {car.kmDriven.toLocaleString("en-IN")} km · {car.location}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={car.status}
                    disabled={busy === car.id}
                    onChange={(e) =>
                      status(
                        car.id,
                        e.target.value as
                          | "AVAILABLE"
                          | "RESERVED"
                          | "SOLD"
                          | "INACTIVE"
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black"
                  >
                    <option>AVAILABLE</option>
                    <option>RESERVED</option>
                    <option>SOLD</option>
                    <option>INACTIVE</option>
                  </select>
                  <Link
                    href={`/admin/cars/${car.id}/edit`}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    Manage
                  </Link>
                  <button
                    disabled={busy === car.id}
                    onClick={() => del(car.id)}
                    className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500">
              No cars yet. Add your first listing.
            </div>
          )}
        </div>
      </section>
      <section
        id="enquiries"
        className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white"
      >
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-black">Recent enquiries</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {enquiries.length ? (
            enquiries.map((e) => (
              <div
                key={e.id}
                className="grid gap-2 p-5 sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-black">
                    {e.customerName}{" "}
                    <span className="font-medium text-slate-400">
                      · {e.phone}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {e.car
                      ? `${e.car.brand} ${e.car.model}`
                      : "General enquiry"}
                    {e.message ? ` — ${e.message}` : ""}
                  </p>
                </div>
                <p className="text-xs font-bold text-slate-400">
                  {new Date(e.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-500">
              No enquiries yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
