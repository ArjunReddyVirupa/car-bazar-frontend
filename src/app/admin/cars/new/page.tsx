import { CarForm } from "@/src/components/admin/CarForm";
export default function NewCar() {
  return (
    <div className="mx-auto max-w-6xl">
      <p className="font-black uppercase tracking-widest text-orange-500">
        Inventory
      </p>
      <h1 className="mt-1 text-3xl font-black">Add a car</h1>
      <p className="mt-2 mb-7 text-slate-500">
        Create a listing and optionally upload its photos in the same step.
      </p>
      <CarForm />
    </div>
  );
}
