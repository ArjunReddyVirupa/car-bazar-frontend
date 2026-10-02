import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Fuel, Gauge, MapPin, Settings2, Star } from "lucide-react";
import type { Car } from "@/types";
const fuel=(x:string)=>x.charAt(0)+x.slice(1).toLowerCase();
export function CarCard({car}:{car:Car}){const img=car.images[0]?.publicUrl;return <Link href={`/cars/${car.id}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white card-shadow transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
 <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">{img?<Image src={img} alt={`${car.brand} ${car.model}`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105"/>:<div className="grid h-full place-items-center bg-gradient-to-br from-slate-100 to-orange-50 text-slate-300"><Gauge size={52}/></div>}
  {car.featured&&<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-orange-600 shadow"><Star size={13} fill="currentColor"/> Featured</span>}
  <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white">{car.year}</span>
 </div>
 <div className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black text-slate-900">{car.brand} {car.model}</p><p className="mt-0.5 text-sm text-slate-500">{car.variant||"Premium Variant"}</p></div><p className="whitespace-nowrap text-lg font-black text-orange-600">₹{car.price.toLocaleString("en-IN")}</p></div>
 <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 sm:grid-cols-4"><span className="flex items-center gap-1.5"><Gauge size={14} className="text-orange-500"/>{car.kmDriven.toLocaleString("en-IN")} km</span><span className="flex items-center gap-1.5"><Fuel size={14} className="text-orange-500"/>{fuel(car.fuelType)}</span><span className="flex items-center gap-1.5"><Settings2 size={14} className="text-orange-500"/>{fuel(car.transmission)}</span><span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-500"/>{car.location}</span></div></div>
 </Link>}
