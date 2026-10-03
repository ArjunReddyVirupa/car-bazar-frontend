"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  //   FileText,
  Trash2,
  //   UploadCloud,
  ImageIcon,
} from "lucide-react";
import { api } from "@/src/lib/api";
import type { Car, Document, DocumentType } from "@/src/types";
import { CarForm } from "@/src/components/admin/CarForm";
// import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/src/components/ui/Input";
// import { CarFormSkeleton } from "@/src/components/admin/CarFormSkeleton";
export default function EditCar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [car, setCar] = useState<Car | null>(null);
  //   const [docs, setDocs] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<DocumentType>("RC");
  const [number, setNumber] = useState("");
  const [valid, setValid] = useState("");
  const [notes, setNotes] = useState("");
  //   const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void params.then(({ id }) => {
      api
        .getCar(id)
        .then((response) => {
          setCar(response.data);
        })
        .catch((error) => {
          setError(
            error instanceof Error ? error.message : "Unable to load car."
          );
        })
        .finally(() => {
          setLoading(false);
        });
    });
  }, [params]);

  if (!car)
    return (
      <div className="mx-auto max-w-6xl py-10">
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
        )}
      </div>
    );
  //   const upload = async () => {
  //     if (!file) return;
  //     setBusy(true);
  //     setError("");
  //     try {
  //       const { data } = await api.uploadDocument(
  //         car.id,
  //         file,
  //         type,
  //         number,
  //         valid,
  //         notes
  //       );
  //       setDocs((d) => [data, ...d]);
  //       setFile(null);
  //       setNumber("");
  //       setValid("");
  //       setNotes("");
  //     } catch (e) {
  //       setError(e instanceof Error ? e.message : "Upload failed.");
  //     } finally {
  //       setBusy(false);
  //     }
  //   };
  //   const delDoc = async (id: string) => {
  //     if (!confirm("Delete this document?")) return;
  //     await api.deleteDocument(car.id, id);
  //     setDocs((d) => d.filter((x) => x.id !== id));
  //   };
  const delImage = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await api.deleteImage(car.id, id);
      setCar((c) =>
        c ? { ...c, images: c.images.filter((x) => x.id !== id) } : c
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete photo.");
    }
  };
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="font-black uppercase tracking-widest text-orange-500">
            Manage listing
          </p>
          <h1 className="mt-1 text-3xl font-black">
            {car.brand} {car.model}
          </h1>
        </div>
        <Link
          href={`/cars/${car.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white"
        >
          <ExternalLink size={16} /> View public page
        </Link>
      </div>
      <CarForm initial={car} mode="edit" />
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-black">Current photos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Remove individual photos here. Add new ones from the Photos section
            above and save.
          </p>
        </div>
        {car.images.length ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {car.images.map((im, i) => (
              <div
                key={im.id}
                className="group relative overflow-hidden rounded-2xl bg-slate-100"
              >
                <img
                  src={im.publicUrl}
                  alt={`Car photo ${i + 1}`}
                  className="aspect-square w-full object-cover"
                />
                <button
                  onClick={() => delImage(im.id)}
                  className="absolute right-2 top-2 rounded-xl bg-white/95 p-2 text-red-600 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/80 px-2.5 py-1 text-[10px] font-black text-white">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
            <ImageIcon className="mx-auto mb-2" />
            No photos uploaded.
          </div>
        )}
      </section>
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-black">Private documents</h2>
          <p className="mt-1 text-sm text-slate-500">
            Documents are stored in the private Supabase bucket and opened with
            short-lived signed URLs.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Document type">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
            >
              {["RC", "INSURANCE", "PUC", "SERVICE_HISTORY", "OTHER"].map(
                (v) => (
                  <option key={v}>{v}</option>
                )
              )}
            </Select>
          </Field>
          <Field label="Document number">
            <Input value={number} onChange={(e) => setNumber(e.target.value)} />
          </Field>
          <Field label="Valid until">
            <Input
              type="date"
              value={valid}
              onChange={(e) => setValid(e.target.value)}
            />
          </Field>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            File
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
          </label>
        </div>
        <div className="mt-4">
          <Field label="Notes">
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>
        </div>
        {/* <div className="mt-4 flex justify-end">
          <Button disabled={!file || busy} onClick={upload}>
            <UploadCloud size={16} /> {busy ? "Uploading…" : "Upload document"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </p>
        )}
        <div className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {docs.length ? (
            docs.map((d) => (
              <div
                key={d.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                    <FileText size={18} />
                  </span>
                  <div>
                    <p className="font-black">{d.documentType}</p>
                    <p className="text-xs text-slate-500">
                      {d.originalName || "Document"}
                      {d.validUntil
                        ? ` · valid until ${new Date(
                            d.validUntil
                          ).toLocaleDateString("en-IN")}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={d.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black"
                  >
                    Open
                  </a>
                  <button
                    onClick={() => delDoc(d.id)}
                    className="rounded-xl bg-red-50 p-2 text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              No private documents uploaded.
            </div>
          )}
        </div> */}
      </section>
    </div>
  );
}
