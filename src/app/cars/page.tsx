"use client";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { CarCard } from "@/components/cars/CarCard";
import { Select, Input } from "@/components/ui/Input";
import { useStore } from "@/store/useStore";
import type { FuelType, Transmission } from "@/types";
const fuels: [FuelType, string][] = [
  ["PETROL", "Petrol"],
  ["DIESEL", "Diesel"],
  ["CNG", "CNG"],
  ["ELECTRIC", "Electric"],
  ["HYBRID", "Hybrid"],
  ["LPG", "LPG"],
];
export default function CarsPage() {
  const { cars, loadCars, loading } = useStore();
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [mobileFilter, setMobileFilter] = useState(false);

  useEffect(() => {
    void loadCars();
  }, [loadCars]);

  const brands = useMemo(
    () => Array.from(new Set(cars.map((c) => c.brand))).sort(),
    [cars]
  );
  const filtered = cars.filter((c) => {
    const text = `${c.brand} ${c.model} ${c.variant ?? ""} ${
      c.location
    }`.toLowerCase();
    return (
      (!search || text.includes(search.toLowerCase())) &&
      (!brand || c.brand === brand) &&
      (!fuel || c.fuelType === fuel) &&
      (!transmission || c.transmission === transmission) &&
      (!maxPrice || c.price <= Number(maxPrice)) &&
      (!maxKm || c.kmDriven <= Number(maxKm))
    );
  });
  const clear = () => {
    setSearch("");
    setBrand("");
    setFuel("");
    setTransmission("");
    setMaxPrice("");
    setMaxKm("");
  };
  const controls = (
    <div className="grid gap-4">
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
        Brand
        <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </Select>
      </label>
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
        Fuel
        <Select value={fuel} onChange={(e) => setFuel(e.target.value)}>
          <option value="">Any fuel</option>
          {fuels.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </label>
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
        Transmission
        <Select
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
        >
          <option value="">Any transmission</option>
          {["MANUAL", "AUTOMATIC", "AMT", "CVT", "DCT"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </Select>
      </label>
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
        Max price
        <Input
          type="number"
          min="0"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="₹ 10,00,000"
        />
      </label>
      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
        Max kilometres
        <Input
          type="number"
          min="0"
          value={maxKm}
          onChange={(e) => setMaxKm(e.target.value)}
          placeholder="100000"
        />
      </label>
      <button
        onClick={clear}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600"
      >
        <X size={16} /> Clear filters
      </button>
    </div>
  );
  return (
    <main className="min-h-screen">
      <section className="bg-gradient-to-br from-orange-50 via-white to-pink-50 py-12">
        <div className="container-page">
          <p className="font-black uppercase tracking-widest text-orange-500">
            Inventory
          </p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            Find a car you’ll love.
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Search our available inventory by brand, fuel, transmission, budget
            and kilometres.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={19}
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-2xl py-4 pl-11"
                placeholder="Search Toyota, Swift, Creta..."
              />
            </div>
            <button
              onClick={() => setMobileFilter(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 font-black text-white lg:hidden"
            >
              <SlidersHorizontal size={18} /> Filters
            </button>
          </div>
        </div>
      </section>
      <section className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="hidden rounded-3xl border border-slate-200 bg-white p-5 lg:block">
            <div className="mb-5 flex items-center gap-2 text-lg font-black">
              <Filter size={18} className="text-orange-500" /> Filters
            </div>
            {controls}
          </aside>
          <div>
            {loading && !cars.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-96 animate-pulse rounded-3xl bg-slate-200"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <p className="font-bold text-slate-500">
                    <span className="text-slate-900">{filtered.length}</span>{" "}
                    cars available
                  </p>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                    Live inventory
                  </span>
                </div>
                {filtered.length ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((c) => (
                      <CarCard key={c.id} car={c} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white p-14 text-center shadow">
                    <div className="mx-auto grid size-14 place-items-center rounded-full bg-orange-50 text-orange-500">
                      <Search />
                    </div>
                    <h2 className="mt-4 text-xl font-black">
                      No matching cars
                    </h2>
                    <p className="mt-2 text-slate-500">
                      Try removing one or two filters.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
      {mobileFilter && (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 p-4 lg:hidden">
          <div className="ml-auto h-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Filters</h2>
              <button
                onClick={() => setMobileFilter(false)}
                className="rounded-full bg-slate-100 p-2"
              >
                <X size={18} />
              </button>
            </div>
            {controls}
            <button
              onClick={() => setMobileFilter(false)}
              className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-black text-white"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
