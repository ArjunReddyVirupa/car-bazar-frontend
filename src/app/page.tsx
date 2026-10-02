"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  ShieldCheck,
  Sparkles,
  Search,
  Phone,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { CarCard } from "@/components/cars/CarCard";

type Feature = {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Documentation first",
    description:
      "RC, insurance, PUC and service information can be recorded with each listing.",
  },
  {
    icon: BadgeCheck,
    title: "Clear information",
    description:
      "Know the price, kilometres, ownership and condition before you call.",
  },
  {
    icon: Phone,
    title: "Human support",
    description:
      "Ask about a car, request a test drive or send an enquiry directly.",
  },
];

export default function Home() {
  const cars = useStore((state) => state.cars);
  const loadCars = useStore((state) => state.loadCars);
  const loading = useStore((state) => state.loading);

  const [q, setQ] = useState("");

  useEffect(() => {
    if (!cars.length) {
      void loadCars();
    }
  }, [cars.length, loadCars]);

  const featured = useMemo(
    () => cars.filter((car) => car.featured).slice(0, 6),
    [cars]
  );

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();

    const source = featured.length ? featured : cars;

    if (!query) {
      return source.slice(0, 6);
    }

    return source
      .filter((car) =>
        `${car.brand} ${car.model} ${car.variant ?? ""}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 6);
  }, [cars, featured, q]);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(249,115,22,.35),transparent_30%),radial-gradient(circle_at_90%_30%,rgba(236,72,153,.25),transparent_30%)]" />

        <div className="hero-grid absolute inset-0 opacity-30" />

        <div className="container-page relative grid min-h-[620px] items-center gap-10 py-20 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-orange-200">
              <Sparkles size={14} />
              Trusted pre-owned cars
            </span>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Your next car is{" "}
              <span className="text-gradient">closer than you think.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Browse hand-picked used cars with transparent details,
              documentation checks and a simple way to talk to our team.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/cars"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 font-black shadow-xl shadow-orange-950/30 transition hover:-translate-y-0.5"
              >
                Explore cars
                <ArrowRight size={18} />
              </Link>

              <a
                href="#why-us"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Why Car Bazar
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-white/10 pt-6">
              <div>
                <p className="text-2xl font-black">100%</p>
                <p className="text-xs text-slate-400">
                  Detail-focused listings
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">Easy</p>
                <p className="text-xs text-slate-400">
                  Enquiry &amp; test drive
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">Local</p>
                <p className="text-xs text-slate-400">Personal support</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-orange-500/20 to-pink-500/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">
              <div className="grid aspect-[4/3] place-items-center rounded-[28px] bg-gradient-to-br from-orange-400 via-pink-500 to-violet-700">
                <CarFront
                  size={150}
                  strokeWidth={1.1}
                  className="text-white/90 drop-shadow-2xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 p-3">
                <span className="rounded-2xl bg-white/10 p-3 text-center text-xs font-bold">
                  Verified details
                </span>

                <span className="rounded-2xl bg-white/10 p-3 text-center text-xs font-bold">
                  Clear pricing
                </span>

                <span className="rounded-2xl bg-white/10 p-3 text-center text-xs font-bold">
                  Quick enquiry
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="container-page relative z-10 -mt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-300/30 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />

              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Search by brand, model or variant..."
                className="w-full rounded-2xl bg-slate-50 py-4 pl-12 pr-4 font-semibold outline-none transition focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <Link
              href="/cars"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-4 font-black text-white transition hover:bg-orange-600"
            >
              View all cars
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="container-page py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase tracking-widest text-orange-500">
              Featured collection
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Cars worth a closer look
            </h2>
          </div>

          <Link
            href="/cars"
            className="hidden items-center gap-1 font-black text-orange-600 transition hover:text-orange-700 sm:flex"
          >
            See all
            <ArrowRight size={17} />
          </Link>
        </div>

        {loading && !cars.length ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-96 animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        ) : shown.length ? (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow">
            <CarFront className="mx-auto text-slate-300" size={48} />

            <h3 className="mt-4 text-xl font-black text-slate-900">
              No cars listed yet
            </h3>

            <p className="mt-2 text-slate-500">
              Check back soon for our latest pre-owned cars.
            </p>
          </div>
        )}
      </section>

      {/* Why Us */}
      <section id="why-us" className="bg-white">
        <div className="container-page py-20">
          <div className="max-w-2xl">
            <p className="font-black uppercase tracking-widest text-orange-500">
              The Car Bazar promise
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              A calmer way to buy a used car.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-100 bg-slate-50 p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-orange-600">
                  <Icon size={24} />
                </span>

                <h3 className="mt-5 text-xl font-black">{title}</h3>

                <p className="mt-2 leading-7 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
