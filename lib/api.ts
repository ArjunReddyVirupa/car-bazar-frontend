const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 204) return undefined as T;
  const payload = await res.json().catch(() => null);
  if (!res.ok)
    throw new ApiError(
      res.status,
      payload?.error?.message ?? payload?.message ?? "Something went wrong.",
      payload?.error?.code ?? payload?.code
    );
  return payload as T;
}

export type VehicleCatalogItem = {
  id: string;
  name: string;
};

export const api = {
  getCars: (params: URLSearchParams = new URLSearchParams()) =>
    request<{
      success: true;
      data: import("@/types").Car[];
      meta: import("@/types").Paginated<import("@/types").Car>["meta"];
    }>(`/cars?${params}`),
  getCar: (id: string) =>
    request<{ success: true; data: import("@/types").Car }>(`/cars/${id}`),
  getVehicleBrands: () =>
    request<{
      success: true;
      data: VehicleCatalogItem[];
    }>("/vehicle-catalog/brands"),

  getVehicleModels: (brandId: string) =>
    request<{
      success: true;
      data: VehicleCatalogItem[];
    }>(`/vehicle-catalog/brands/${brandId}/models`),

  getVehicleVariants: (modelId: string) =>
    request<{
      success: true;
      data: VehicleCatalogItem[];
    }>(`/vehicle-catalog/models/${modelId}/variants`),
  login: (email: string, password: string) =>
    request<{ success: true; data: { user: import("@/types").User } }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  me: () =>
    request<{ success: true; data: import("@/types").User }>("/auth/me"),
  logout: () => request<{ success: true }>("/auth/logout", { method: "POST" }),
  createCar: (body: Partial<import("@/types").Car>) =>
    request<{ success: true; data: import("@/types").Car }>("/cars", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateCar: (id: string, body: Partial<import("@/types").Car>) =>
    request<{ success: true; data: import("@/types").Car }>(`/cars/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteCar: (id: string) => request<void>(`/cars/${id}`, { method: "DELETE" }),
  updateStatus: (id: string, status: import("@/types").CarStatus) =>
    request<{ success: true; data: import("@/types").Car }>(
      `/cars/${id}/status`,
      { method: "PATCH", body: JSON.stringify({ status }) }
    ),
  uploadImages: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));
    return request<{ success: true; data: import("@/types").Car }>(
      `/cars/${id}/images`,
      { method: "POST", body: fd }
    );
  },
  deleteImage: (carId: string, imageId: string) =>
    request<void>(`/cars/${carId}/images/${imageId}`, { method: "DELETE" }),
  // uploadDocument: (
  //   carId: string,
  //   file: File,
  //   documentType: import("@/types").DocumentType,
  //   documentNumber?: string,
  //   validUntil?: string,
  //   notes?: string
  // ) => {
  //   const fd = new FormData();
  //   fd.append("document", file);
  //   fd.append("documentType", documentType);
  //   if (documentNumber) fd.append("documentNumber", documentNumber);
  //   if (validUntil) fd.append("validUntil", validUntil);
  //   if (notes) fd.append("notes", notes);
  //   return request<{ success: true; data: import("@/types").Document }>(
  //     `/cars/${carId}/documents`,
  //     { method: "POST", body: fd }
  //   );
  // },
  // getDocuments: (carId: string) =>
  //   request<{ success: true; data: import("@/types").Document[] }>(
  //     `/cars/${carId}/documents`
  //   ),
  // deleteDocument: (carId: string, documentId: string) =>
  //   request<void>(`/cars/${carId}/documents/${documentId}`, {
  //     method: "DELETE",
  //   }),
  dashboard: () =>
    request<{
      success: true;
      data: {
        totalCars: number;
        availableCars: number;
        reservedCars: number;
        soldCars: number;
        enquiries: number;
      };
    }>("/admin/dashboard"),
  enquiries: () =>
    request<{
      success: true;
      data: import("@/types").Enquiry[];
      meta: import("@/types").Paginated<import("@/types").Enquiry>["meta"];
    }>("/admin/enquiries?page=1&pageSize=50"),
  createEnquiry: (body: {
    carId?: string;
    customerName: string;
    phone: string;
    message?: string;
  }) =>
    request<{ success: true; data: { id: string; message: string } }>(
      "/enquiries",
      { method: "POST", body: JSON.stringify(body) }
    ),
};
