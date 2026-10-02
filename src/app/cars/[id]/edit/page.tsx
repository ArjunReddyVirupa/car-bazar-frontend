"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Trash2,
  UploadCloud,
  ImageIcon,
} from "lucide-react";

import { api } from "@/src/lib/api";
import type { Car, Document, DocumentType } from "@/src/types";
import { CarForm } from "@/src/components/admin/CarForm";
import { Button } from "@/src/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/src/components/ui/Input";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditCarPage({ params }: PageProps) {
  const { id } = use(params);

  const [car, setCar] = useState<Car | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [type, setType] = useState<DocumentType>("RC");
  const [number, setNumber] = useState("");
  const [valid, setValid] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [carResponse] = await Promise.all([
          api.getCar(id),
          // api.getDocuments(id),
        ]);

        if (cancelled) {
          return;
        }

        setCar(carResponse.data);
        // setDocs(documentsResponse.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error ? error.message : "Unable to load the car."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // async function uploadDocument() {
  //   if (!file || !car) {
  //     return;
  //   }

  //   try {
  //     setBusy(true);
  //     setError("");

  //     const response = await api.uploadDocument(
  //       car.id,
  //       file,
  //       type,
  //       number || undefined,
  //       valid || undefined,
  //       notes || undefined
  //     );

  //     setDocs((current) => [response.data, ...current]);

  //     setFile(null);
  //     setNumber("");
  //     setValid("");
  //     setNotes("");

  //     const input = document.getElementById(
  //       "document-file"
  //     ) as HTMLInputElement | null;

  //     if (input) {
  //       input.value = "";
  //     }
  //   } catch (error) {
  //     setError(
  //       error instanceof Error ? error.message : "Document upload failed."
  //     );
  //   } finally {
  //     setBusy(false);
  //   }
  // }

  // async function deleteDocument(documentId: string) {
  //   if (!car) {
  //     return;
  //   }

  //   const confirmed = window.confirm(
  //     "Delete this document? This cannot be undone."
  //   );

  //   if (!confirmed) {
  //     return;
  //   }

  //   try {
  //     setError("");

  //     await api.deleteDocument(car.id, documentId);

  //     setDocs((current) =>
  //       current.filter((document) => document.id !== documentId)
  //     );
  //   } catch (error) {
  //     setError(
  //       error instanceof Error ? error.message : "Unable to delete document."
  //     );
  //   }
  // }

  async function deleteImage(imageId: string) {
    if (!car) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this photo? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.deleteImage(car.id, imageId);

      setCar((current) =>
        current
          ? {
              ...current,
              images: current.images.filter((image) => image.id !== imageId),
            }
          : current
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete photo."
      );
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />

        <div className="mt-7 h-[500px] animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
          <h1 className="text-2xl font-black text-red-800">
            Unable to load car
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "The requested car could not be found."}
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-black uppercase tracking-widest text-orange-500">
            Manage listing
          </p>

          <h1 className="mt-1 text-3xl font-black">
            {car.brand} {car.model}
          </h1>

          {car.variant && (
            <p className="mt-1 text-sm font-medium text-slate-500">
              {car.variant}
            </p>
          )}
        </div>

        <Link
          href={`/cars/${car.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition hover:bg-orange-600"
        >
          <ExternalLink size={16} />
          View public page
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Main car form */}
      <CarForm initial={car} mode="edit" />

      {/* Photos */}
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-black">Current photos</h2>

          <p className="mt-1 text-sm text-slate-500">
            Remove individual photos here. Add new photos from the Photos
            section above.
          </p>
        </div>

        {car.images.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {car.images.map((image, index) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-2xl bg-slate-100"
              >
                <img
                  src={image.publicUrl}
                  alt={`${car.brand} ${car.model} photo ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => void deleteImage(image.id)}
                  className="absolute right-2 top-2 rounded-xl bg-white/95 p-2 text-red-600 opacity-0 shadow transition group-hover:opacity-100"
                  aria-label="Delete photo"
                >
                  <Trash2 size={15} />
                </button>

                {index === 0 && (
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

      {/* Private Documents */}
      <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div>
          <h2 className="text-xl font-black">Private documents</h2>

          <p className="mt-1 text-sm text-slate-500">
            RC, insurance, PUC and service documents are stored privately in
            Supabase.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Document type">
            <Select
              value={type}
              onChange={(event) => setType(event.target.value as DocumentType)}
            >
              {["RC", "INSURANCE", "PUC", "SERVICE_HISTORY", "OTHER"].map(
                (value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                )
              )}
            </Select>
          </Field>

          <Field label="Document number">
            <Input
              value={number}
              onChange={(event) => setNumber(event.target.value)}
            />
          </Field>

          <Field label="Valid until">
            <Input
              type="date"
              value={valid}
              onChange={(event) => setValid(event.target.value)}
            />
          </Field>

          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            File
            <input
              id="document-file"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/avif"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
            />
          </label>
        </div>

        <div className="mt-4">
          <Field label="Notes">
            <Textarea
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
        </div>

        {/* <div className="mt-4 flex justify-end">
          <Button
            disabled={!file || busy}
            onClick={() => void uploadDocument()}
          >
            <UploadCloud size={16} />

            {busy ? "Uploading…" : "Upload document"}
          </Button>
        </div> */}

        {/* <div className="mt-7 divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {docs.length > 0 ? (
            docs.map((document) => (
              <div
                key={document.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-600">
                    <FileText size={18} />
                  </span>

                  <div>
                    <p className="font-black">{document.documentType}</p>

                    <p className="text-xs text-slate-500">
                      {document.originalName || "Document"}

                      {document.validUntil
                        ? ` · valid until ${new Date(
                            document.validUntil
                          ).toLocaleDateString("en-IN")}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={document.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black transition hover:bg-slate-200"
                  >
                    Open
                  </a>

                  <button
                    type="button"
                    onClick={() => void deleteDocument(document.id)}
                    className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                    aria-label="Delete document"
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
