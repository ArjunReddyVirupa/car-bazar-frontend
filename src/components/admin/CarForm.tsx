"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { useStore } from "@/src/store/useStore";
import { Button } from "@/src/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/src/components/ui/Input";
import type { Car } from "@/src/types";
import { api } from "@/src/lib/api";
import type { VehicleCatalogItem } from "@/src/lib/api";

const MAX_PHOTOS = 20;
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_COMPRESSED_IMAGE_BYTES = 3.5 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 2000;
const MAX_IMAGE_HEIGHT = 1500;
const INITIAL_WEBP_QUALITY = 0.82;
const MIN_WEBP_QUALITY = 0.55;
const WEBP_QUALITY_STEP = 0.05;
const PHOTO_COMPRESSION_CONCURRENCY = 3;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const base = {
  brand: "",
  model: "",
  variant: "",
  year: new Date().getFullYear(),
  price: "",
  kmDriven: "",
  fuelType: "DIESEL",
  transmission: "MANUAL",
  ownerCount: "1",
  location: "Kurnool",
  description: "",
  //   registrationNumber: "",
  //   registrationState: "",
  color: "",
  ownerType: "INDIVIDUAL",

  rcAvailable: false,
  rcTransferAvailable: false,
  originalRcAvailable: false,
  rcNotes: "",

  insuranceAvailable: false,
  insuranceType: "COMPREHENSIVE",
  insuranceValidUntil: "",
  insuranceCompany: "",
  insurancePolicyNumber: "",

  pucAvailable: false,
  pucValidUntil: "",

  buyerFinanceAvailable: false,
  existingFinance: false,
  financeCompany: "",
  financeOutstanding: "",
  financeClosed: false,

  serviceHistoryAvailable: false,
  serviceHistoryNotes: "",
  lastServiceDate: "",
  lastServiceKm: "",

  accidentHistory: false,
  accidentHistoryNotes: "",
  conditionNotes: "",

  warrantyAvailable: false,
  warrantyValidUntil: "",
  warrantyNotes: "",

  status: "AVAILABLE",
  featured: false,
};

type PhotoPreview = {
  id: string;
  file: File;
  url: string;
};

export function CarForm({
  initial,
  mode = "create",
}: {
  initial?: Car;
  mode?: "create" | "edit";
}) {
  const router = useRouter();

  const { createCar, updateCar, uploadImagesFast } = useStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<Record<string, any>>(() => {
    if (!initial) {
      return base;
    }

    return {
      ...base,

      brand: initial.brand ?? "",
      model: initial.model ?? "",
      variant: initial.variant ?? "",

      year: initial.year ?? new Date().getFullYear(),

      price: initial.price != null ? String(initial.price) : "",

      kmDriven: initial.kmDriven != null ? String(initial.kmDriven) : "",

      fuelType: initial.fuelType ?? "DIESEL",

      transmission: initial.transmission ?? "MANUAL",

      ownerCount: initial.ownerCount != null ? String(initial.ownerCount) : "1",

      location: "Kurnool", //initial.location ?? "Kurnool",

      description: initial.description ?? "",

      color: initial.color ?? "",

      ownerType: initial.ownerType ?? "INDIVIDUAL",

      rcAvailable: initial.rcAvailable ?? false,
      rcTransferAvailable: initial.rcTransferAvailable ?? false,
      originalRcAvailable: initial.originalRcAvailable ?? false,
      rcNotes: initial.rcNotes ?? "",

      insuranceAvailable: initial.insuranceAvailable ?? false,

      insuranceType: initial.insuranceType ?? "COMPREHENSIVE",

      insuranceValidUntil: initial.insuranceValidUntil?.slice(0, 10) ?? "",

      insuranceCompany: initial.insuranceCompany ?? "",

      insurancePolicyNumber: initial.insurancePolicyNumber ?? "",

      pucAvailable: initial.pucAvailable ?? false,

      pucValidUntil: initial.pucValidUntil?.slice(0, 10) ?? "",

      buyerFinanceAvailable: initial.buyerFinanceAvailable ?? false,

      existingFinance: initial.existingFinance ?? false,

      financeCompany: initial.financeCompany ?? "",

      financeOutstanding:
        initial.financeOutstanding != null
          ? String(initial.financeOutstanding)
          : "",

      financeClosed: initial.financeClosed ?? false,

      serviceHistoryAvailable: initial.serviceHistoryAvailable ?? false,

      serviceHistoryNotes: initial.serviceHistoryNotes ?? "",

      lastServiceDate: initial.lastServiceDate?.slice(0, 10) ?? "",

      lastServiceKm:
        initial.lastServiceKm != null ? String(initial.lastServiceKm) : "",

      accidentHistory: initial.accidentHistory ?? false,

      accidentHistoryNotes: initial.accidentHistoryNotes ?? "",

      conditionNotes: initial.conditionNotes ?? "",

      warrantyAvailable: initial.warrantyAvailable ?? false,

      warrantyValidUntil: initial.warrantyValidUntil?.slice(0, 10) ?? "",

      warrantyNotes: initial.warrantyNotes ?? "",

      status: initial.status ?? "AVAILABLE",

      featured: initial.featured ?? false,
    };
  });

  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [brands, setBrands] = useState<VehicleCatalogItem[]>([]);
  const [models, setModels] = useState<VehicleCatalogItem[]>([]);
  const [variants, setVariants] = useState<VehicleCatalogItem[]>([]);

  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, index) => currentYear - index
  );

  useEffect(() => {
    let cancelled = false;

    const loadCatalogForEdit = async () => {
      try {
        const response = await api.getVehicleBrands();

        if (cancelled) return;

        const loadedBrands = response.data;

        setBrands(loadedBrands);

        // Create mode
        if (!initial?.brand) {
          return;
        }

        // Find existing brand by name
        const selectedBrand = loadedBrands.find(
          (brand) => brand.name.toLowerCase() === initial.brand.toLowerCase()
        );

        if (!selectedBrand) {
          return;
        }

        setBrandId(selectedBrand.id);

        // Load models for the existing brand
        const modelsResponse = await api.getVehicleModels(selectedBrand.id);

        if (cancelled) return;

        const loadedModels = modelsResponse.data;

        setModels(loadedModels);

        if (!initial.model) {
          return;
        }

        // Find existing model by name
        const selectedModel = loadedModels.find(
          (model) => model.name.toLowerCase() === initial.model.toLowerCase()
        );

        if (!selectedModel) {
          return;
        }

        setModelId(selectedModel.id);

        // Load variants for the existing model
        const variantsResponse = await api.getVehicleVariants(selectedModel.id);

        if (cancelled) return;

        setVariants(variantsResponse.data);
      } catch (error) {
        if (cancelled) return;

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load vehicle catalog."
        );
      }
    };

    void loadCatalogForEdit();

    return () => {
      cancelled = true;
    };
  }, [initial?.brand, initial?.model]);

  const set = (key: string, value: any) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /**
   * Create preview objects for newly selected images.
   */
  const createPhotoPreviews = (files: File[]) => {
    return files.map((file) => ({
      id: `${file.name}-${file.size}-${
        file.lastModified
      }-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
    }));
  };

  /**
   * Clean up object URLs when previews are removed/unmounted.
   */
  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.url);
      });
    };
  }, []);

  /**
   * Validate and add files.
   */
  const addPhotos = async (incomingFiles: File[]) => {
    if (!incomingFiles.length) {
      return;
    }

    setError("");

    const validationErrors: string[] = [];

    const validFiles = incomingFiles.filter((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        validationErrors.push(`${file.name}: unsupported image format`);
        return false;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        validationErrors.push(`${file.name}: exceeds ${MAX_FILE_SIZE_MB} MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      setError(validationErrors.join(" • "));
      return;
    }

    setBusy(true);

    try {
      /*
       * Compress images concurrently.
       *
       * This makes selecting 10-20 large photos much faster
       * than compressing them one by one.
       */
      const compressedFiles: File[] = [];

      for (
        let start = 0;
        start < validFiles.length;
        start += PHOTO_COMPRESSION_CONCURRENCY
      ) {
        const batch = validFiles.slice(
          start,
          start + PHOTO_COMPRESSION_CONCURRENCY
        );

        const results = await Promise.allSettled(
          batch.map((file) => compressImageForUpload(file))
        );

        results.forEach((result, index) => {
          const originalFile = batch[index];

          if (result.status === "fulfilled") {
            compressedFiles.push(result.value);
          } else {
            console.error(
              `Failed to compress ${originalFile.name}:`,
              result.reason
            );

            validationErrors.push(
              `${originalFile.name}: unable to prepare image for upload`
            );
          }
        });
      }

      if (compressedFiles.length === 0) {
        setError(
          validationErrors.length
            ? validationErrors.join(" • ")
            : "Unable to prepare images for upload."
        );
        return;
      }

      setPhotos((current) => {
        const availableSlots = Math.max(MAX_PHOTOS - current.length, 0);

        if (availableSlots === 0) {
          validationErrors.push(`Only ${MAX_PHOTOS} photos can be selected.`);

          return current;
        }

        const filesToAdd = compressedFiles.slice(0, availableSlots);

        if (compressedFiles.length > availableSlots) {
          validationErrors.push(`Only ${MAX_PHOTOS} photos can be selected.`);
        }

        return [...current, ...createPhotoPreviews(filesToAdd)];
      });
    } finally {
      setBusy(false);
    }

    if (validationErrors.length) {
      setError(validationErrors.join(" • "));
    }
  };
  /**
   * File input handler.
   */
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    addPhotos(files);

    // Allows selecting the same file again later.
    event.target.value = "";
  };

  const handleModelChange = async (modelId: string) => {
    setModelId(modelId);

    const model = models.find((item) => item.id === modelId);

    setForm((current) => ({
      ...current,
      model: model?.name ?? "",
      variant: "",
    }));

    setVariants([]);

    if (!modelId) return;

    try {
      const response = await api.getVehicleVariants(modelId);
      setVariants(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load vehicle variants."
      );
    }
  };

  const handleBrandChange = async (brandId: string) => {
    setBrandId(brandId);

    const brand = brands.find((item) => item.id === brandId);

    setForm((current) => ({
      ...current,
      brand: brand?.name ?? "",
      model: "",
      variant: "",
    }));

    setModels([]);
    setVariants([]);
    setModelId("");

    if (!brandId) return;

    try {
      const response = await api.getVehicleModels(brandId);
      setModels(response.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load vehicle models."
      );
    }
  };

  /**
   * Drag enter.
   */
  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  async function compressImageForUpload(file: File): Promise<File> {
    const objectUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () => {
          reject(new Error(`Unable to decode image "${file.name}".`));
        };

        img.src = objectUrl;
      });

      const originalWidth = image.naturalWidth;
      const originalHeight = image.naturalHeight;

      if (!originalWidth || !originalHeight) {
        throw new Error(`Invalid image dimensions for "${file.name}".`);
      }

      const scale = Math.min(
        1,
        MAX_IMAGE_WIDTH / originalWidth,
        MAX_IMAGE_HEIGHT / originalHeight
      );

      const width = Math.max(1, Math.round(originalWidth * scale));
      const height = Math.max(1, Math.round(originalHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create image canvas.");
      }

      context.drawImage(image, 0, 0, width, height);

      const canvasToWebP = (quality: number): Promise<Blob> =>
        new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Unable to create WebP image."));
                return;
              }

              resolve(blob);
            },
            "image/webp",
            quality
          );
        });

      let quality = INITIAL_WEBP_QUALITY;
      let blob = await canvasToWebP(quality);

      while (
        blob.size > MAX_COMPRESSED_IMAGE_BYTES &&
        quality > MIN_WEBP_QUALITY
      ) {
        quality = Math.max(MIN_WEBP_QUALITY, quality - WEBP_QUALITY_STEP);

        blob = await canvasToWebP(quality);
      }

      if (blob.size > MAX_COMPRESSED_IMAGE_BYTES) {
        throw new Error(
          `Image "${file.name}" could not be compressed below 3.5 MB.`
        );
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");

      return new File([blob], `${baseName}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  /**
   * Drag leave.
   */
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  /**
   * Drop files.
   */
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const files = Array.from(event.dataTransfer.files);

    addPhotos(files);
  };

  /**
   * Remove a single selected photo.
   */
  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const photo = current.find((item) => item.id === id);

      if (photo) {
        URL.revokeObjectURL(photo.url);
      }

      return current.filter((item) => item.id !== id);
    });
  };

  /**
   * Remove all newly selected photos.
   */
  const clearPhotos = () => {
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.url);
    });

    setPhotos([]);
    setError("");
  };

  /**
   * Keep selected photos ordered.
   */
  const photoCountLabel = useMemo(() => {
    if (photos.length === 0) {
      return "No new photos selected";
    }

    return `${photos.length} new photo${
      photos.length === 1 ? "" : "s"
    } selected`;
  }, [photos.length]);

  /**
   * Submit vehicle.
   */
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (busy) {
      return;
    }

    setBusy(true);
    setError("");
    setUploadProgress({
      current: 0,
      total: 0,
    });

    try {
      const body = {
        ...form,

        year: Number(form.year),

        price: Number(form.price),

        kmDriven: Number(form.kmDriven),

        ownerCount: Number(form.ownerCount),

        financeOutstanding:
          form.financeOutstanding === ""
            ? null
            : Number(form.financeOutstanding),

        lastServiceKm:
          form.lastServiceKm === "" ? null : Number(form.lastServiceKm),

        insuranceValidUntil: form.insuranceValidUntil || null,
        pucValidUntil: form.pucValidUntil || null,
        lastServiceDate: form.lastServiceDate || null,
        warrantyValidUntil: form.warrantyValidUntil || null,
        variant: form.variant || null,
        description: form.description || null,
      };

      let car: Car;

      if (mode === "create") {
        car = await createCar(body as Partial<Car>);
      } else {
        if (!initial?.id) {
          throw new Error("Car ID is missing. Unable to update this car.");
        }

        car = await updateCar(initial.id, body as Partial<Car>);
      }

      /**
       * Upload all selected images in one operation.
       */
      if (photos.length > 0) {
        const files = photos.map((photo) => photo.file);

        setUploadProgress({
          current: 0,
          total: files.length,
        });

        car = await uploadImagesFast(car.id, files, (completed, total) => {
          setUploadProgress({
            current: completed,
            total,
          });
        });
      }
      router.replace(`/cars`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save car."
      );
    } finally {
      setBusy(false);
      setUploadProgress({
        current: 0,
        total: 0,
      });
    }
  };

  const bool = (key: string, label: string) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold transition hover:border-orange-200 hover:bg-orange-50/50">
      <input
        type="checkbox"
        checked={!!form[key]}
        onChange={(event) => set(key, event.target.checked)}
        className="size-4 accent-orange-500"
      />

      {label}
    </label>
  );

  const formatIndianNumber = (value: string | number) => {
    const digits = String(value).replace(/\D/g, "");

    if (!digits) return "";

    return Number(digits).toLocaleString("en-IN");
  };

  const parseIndianNumber = (value: string) => {
    return value.replace(/,/g, "").replace(/\D/g, "");
  };

  return (
    <form onSubmit={submit} className="grid gap-7">
      {/* Vehicle details */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-xl font-black">Vehicle details</h2>

        <p className="mt-1 text-sm text-slate-500">
          The information customers see first.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Brand">
            <Select
              required
              value={brandId}
              onChange={(event) => {
                void handleBrandChange(event.target.value);
              }}
            >
              <option value="">Select brand</option>

              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Model">
            <Select
              required
              disabled={!brandId}
              value={modelId}
              onChange={(event) => {
                void handleModelChange(event.target.value);
              }}
            >
              <option value="">
                {brandId ? "Select model" : "Select brand first"}
              </option>

              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Variant">
            <Select
              required
              disabled={!modelId}
              value={form.variant}
              onChange={(event) => {
                set("variant", event.target.value);
              }}
            >
              <option value="">
                {modelId ? "Select variant" : "Select model first"}
              </option>

              {variants.map((variant) => (
                <option key={variant.id} value={variant.name}>
                  {variant.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Year">
            <Select
              required
              value={String(form.year)}
              onChange={(event) => set("year", event.target.value)}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Price (₹)">
            <Input
              required
              type="text"
              inputMode="numeric"
              value={formatIndianNumber(form.price)}
              onChange={(event) => {
                set("price", parseIndianNumber(event.target.value));
              }}
              placeholder="Please enter price"
            />
          </Field>

          <Field label="Kilometres">
            <Input
              required
              type="text"
              inputMode="numeric"
              value={formatIndianNumber(form.kmDriven)}
              onChange={(event) => {
                set("kmDriven", parseIndianNumber(event.target.value));
              }}
              placeholder="Please enter kms"
            />
          </Field>

          <Field label="Fuel">
            <Select
              value={form.fuelType}
              onChange={(event) => set("fuelType", event.target.value)}
            >
              {["DIESEL", "PETROL", "CNG", "ELECTRIC", "HYBRID", "LPG"].map(
                (value) => (
                  <option key={value}>{value}</option>
                )
              )}
            </Select>
          </Field>

          <Field label="Transmission">
            <Select
              value={form.transmission}
              onChange={(event) => set("transmission", event.target.value)}
            >
              {["MANUAL", "AUTOMATIC", "AMT", "CVT", "DCT"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </Select>
          </Field>

          <Field label="Owner count">
            <Input
              type="number"
              min="1"
              max="20"
              value={form.ownerCount}
              onChange={(event) => set("ownerCount", event.target.value)}
            />
          </Field>

          <Field label="Location">
            <Input
              required
              value={form.location}
              onChange={(event) => set("location", event.target.value)}
              placeholder="Kurnool"
              readOnly
            />
          </Field>

          <Field label="Colour">
            <Input
              value={form.color}
              onChange={(event) => set("color", event.target.value)}
              placeholder="Pearl White"
            />
          </Field>

          <Field label="Owner type">
            <Select
              value={form.ownerType}
              onChange={(event) => set("ownerType", event.target.value)}
            >
              <option>INDIVIDUAL</option>
              <option>COMPANY</option>
              <option>OTHER</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description">
            <Textarea
              rows={5}
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              placeholder="Describe condition, features, usage and notable details..."
            />
          </Field>
        </div>
      </section>

      {/* Documents */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-xl font-black">Documents & ownership</h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bool("rcAvailable", "RC available")}

          {bool("rcTransferAvailable", "RC transfer available")}

          {bool("originalRcAvailable", "Original RC available")}
        </div>

        <div className="mt-4">
          <Field label="RC notes">
            <Textarea
              rows={3}
              value={form.rcNotes}
              onChange={(event) => set("rcNotes", event.target.value)}
              placeholder="Any transfer/document notes..."
            />
          </Field>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            {bool("insuranceAvailable", "Insurance available")}
          </div>

          <Field label="Insurance type">
            <Select
              value={form.insuranceType}
              onChange={(event) => set("insuranceType", event.target.value)}
            >
              {["COMPREHENSIVE", "THIRD_PARTY", "ZERO_DEP", "NONE"].map(
                (value) => (
                  <option key={value}>{value}</option>
                )
              )}
            </Select>
          </Field>

          <Field label="Insurance company">
            <Input
              value={form.insuranceCompany}
              onChange={(event) => set("insuranceCompany", event.target.value)}
            />
          </Field>

          <Field label="Insurance valid until">
            <Input
              type="date"
              value={form.insuranceValidUntil}
              onChange={(event) =>
                set("insuranceValidUntil", event.target.value)
              }
            />
          </Field>

          <Field label="Policy number">
            <Input
              value={form.insurancePolicyNumber}
              onChange={(event) =>
                set("insurancePolicyNumber", event.target.value)
              }
            />
          </Field>

          <div>{bool("pucAvailable", "PUC available")}</div>

          <Field label="PUC valid until">
            <Input
              type="date"
              value={form.pucValidUntil}
              onChange={(event) => set("pucValidUntil", event.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Finance / service / condition */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-xl font-black">Finance, service & condition</h2>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bool("buyerFinanceAvailable", "Buyer finance available")}

          {bool("existingFinance", "Existing finance")}

          {bool("financeClosed", "Finance closed")}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Finance company">
            <Input
              value={form.financeCompany}
              onChange={(event) => set("financeCompany", event.target.value)}
            />
          </Field>

          <Field label="Outstanding amount (₹)">
            <Input
              type="text"
              inputMode="numeric"
              value={formatIndianNumber(form.financeOutstanding)}
              onChange={(event) => {
                set(
                  "financeOutstanding",
                  parseIndianNumber(event.target.value)
                );
              }}
              placeholder="2,50,000"
            />
          </Field>

          <Field label="Last service date">
            <Input
              type="date"
              value={form.lastServiceDate}
              onChange={(event) => set("lastServiceDate", event.target.value)}
            />
          </Field>

          {/* <Field label="Last service km">
            <Input
              type="number"
              min="0"
              value={form.lastServiceKm}
              onChange={(event) => set("lastServiceKm", event.target.value)}
            />
          </Field> */}

          <div>
            {bool("serviceHistoryAvailable", "Service history available")}
          </div>

          <div>{bool("accidentHistory", "Accident history")}</div>
        </div>

        {/* <div className="mt-4 grid gap-4"> */}
        {/* <Field label="Service history notes">
            <Textarea
              rows={3}
              value={form.serviceHistoryNotes}
              onChange={(event) =>
                set("serviceHistoryNotes", event.target.value)
              }
            />
          </Field> */}

        {/* <Field label="Accident history notes">
            <Textarea
              rows={3}
              value={form.accidentHistoryNotes}
              onChange={(event) =>
                set("accidentHistoryNotes", event.target.value)
              }
            />
          </Field>

          <Field label="Condition notes">
            <Textarea
              rows={3}
              value={form.conditionNotes}
              onChange={(event) => set("conditionNotes", event.target.value)}
            />
          </Field> */}

        {/* <div className="grid gap-3 sm:grid-cols-2">
            {bool("warrantyAvailable", "Warranty available")}

            <Field label="Warranty valid until">
              <Input
                type="date"
                value={form.warrantyValidUntil}
                onChange={(event) =>
                  set("warrantyValidUntil", event.target.value)
                }
              />
            </Field>
          </div> */}

        {/* <Field label="Warranty notes">
            <Textarea
              rows={3}
              value={form.warrantyNotes}
              onChange={(event) => set("warrantyNotes", event.target.value)}
            />
          </Field>
        </div> */}
      </section>

      {/* Photos */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black">Photos</h2>

            <p className="mt-1 text-sm text-slate-500">
              Select multiple photos at once, or keep adding more photos.
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-400">
              Maximum {MAX_PHOTOS} photos · Maximum {MAX_FILE_SIZE_MB} MB per
              image · Images are automatically compressed before upload
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-black text-orange-700 transition hover:bg-orange-100">
            <ImagePlus size={17} />
            Add photos
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              hidden
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Drop zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={[
            "mt-6 cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition",
            dragActive
              ? "border-orange-500 bg-orange-50"
              : "border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/40",
          ].join(" ")}
        >
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-orange-500 shadow-sm">
            <Upload size={25} />
          </div>

          <p className="mt-4 font-black text-slate-800">
            {dragActive ? "Drop your photos here" : "Drag & drop photos here"}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            or click to browse your computer
          </p>

          <p className="mt-3 text-xs font-semibold text-slate-400">
            JPG, PNG, WebP or AVIF
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {/* Selection summary */}
        {photos.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black">{photoCountLabel}</p>

                <p className="mt-1 text-xs text-slate-500">
                  These photos will be uploaded when you save the car.
                </p>
              </div>

              <button
                type="button"
                onClick={clearPhotos}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:bg-red-50 hover:text-red-600 sm:self-auto"
              >
                <X size={15} />
                Clear all
              </button>
            </div>

            {/* Preview grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  <img
                    src={photo.url}
                    alt={`Selected photo ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/95 text-red-600 opacity-100 shadow transition hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <X size={15} />
                  </button>

                  {/* Photo number */}
                  <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-slate-950/80 text-[10px] font-black text-white">
                    {index + 1}
                  </span>

                  {/* File info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 pt-7">
                    <p className="truncate text-[11px] font-bold text-white">
                      {photo.file.name}
                    </p>

                    <p className="text-[10px] text-white/80">
                      {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Save bar */}
      <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="hidden text-sm font-bold text-slate-500 sm:block">
            Only administrators can save inventory changes.
          </p>

          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="soft"
              disabled={busy}
              onClick={() => router.back()}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {uploadProgress.total > 0
                    ? `Uploading photos ${uploadProgress.current}/${uploadProgress.total}…`
                    : "Saving…"}
                </>
              ) : (
                <>
                  <Save size={16} />

                  {mode === "create" ? "Create listing" : "Save changes"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* {error && (
          <p className="mt-2 rounded-xl bg-red-50 p-2 text-sm font-bold text-red-700">
            {error}
          </p>
        )} */}
      </div>
    </form>
  );
}
