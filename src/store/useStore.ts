"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, ApiError } from "@/src/lib/api";
import type { Car, CarStatus, User } from "@/src/types";
import { supabase } from "@/src/lib/supabase";

interface Store {
  cars: Car[];
  cacheAt: number;
  loading: boolean;
  error: string | null;
  user: User | null;
  authChecked: boolean;
  setUser: (user: User | null) => void;
  hydrateAuth: () => Promise<User | null>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loadCars: (force?: boolean) => Promise<void>;
  upsertCar: (car: Car) => void;
  removeCar: (id: string) => void;
  createCar: (body: Partial<Car>) => Promise<Car>;
  updateCar: (id: string, body: Partial<Car>) => Promise<Car>;
  updateStatus: (id: string, status: CarStatus) => Promise<Car>;
  deleteCar: (id: string) => Promise<void>;
  uploadImages: (id: string, files: File[]) => Promise<Car>;
  deleteImage: (carId: string, imageId: string) => Promise<void>;
  resetError: () => void;
  uploadImagesFast: (
    id: string,
    files: File[],
    onProgress?: (completed: number, total: number) => void
  ) => Promise<Car>;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cars: [],
      cacheAt: 0,
      loading: false,
      error: null,
      user: null,
      authChecked: false,
      setUser: (user) => set({ user }),
      hydrateAuth: async () => {
        try {
          const { data } = await api.me();
          set({ user: data, authChecked: true });
          return data;
        } catch {
          set({ user: null, authChecked: true });
          return null;
        }
      },
      login: async (email, password) => {
        const { data } = await api.login(email, password);
        set({ user: data.user, authChecked: true });
        return data.user;
      },
      logout: async () => {
        await api.logout().catch(() => undefined);
        set({ user: null, authChecked: true });
      },
      loadCars: async (force = false) => {
        const fresh = Date.now() - get().cacheAt < 5 * 60 * 1000;
        if (!force && get().cars.length && fresh) return;
        set({ loading: true, error: null });
        try {
          const r = await api.getCars();
          set({ cars: r.data, cacheAt: Date.now(), loading: false });
        } catch (e) {
          set({
            loading: false,
            error: e instanceof ApiError ? e.message : "Unable to load cars.",
          });
        }
      },
      upsertCar: (car) =>
        set((s) => ({
          cars: s.cars.some((c) => c.id === car.id)
            ? s.cars.map((c) => (c.id === car.id ? car : c))
            : [car, ...s.cars],
          cacheAt: Date.now(),
        })),

      removeCar: (id) =>
        set((s) => ({
          cars: s.cars.filter((c) => c.id !== id),
          cacheAt: Date.now(),
        })),
      createCar: async (body) => {
        const { data } = await api.createCar(body);
        get().upsertCar(data);
        return data;
      },
      updateCar: async (id, body) => {
        const { data } = await api.updateCar(id, body);
        get().upsertCar(data);
        return data;
      },
      updateStatus: async (id, status) => {
        const { data } = await api.updateStatus(id, status);
        get().upsertCar(data);
        return data;
      },
      uploadImages: async (id, files) => {
        const { data } = await api.uploadImages(id, files);
        get().upsertCar(data);
        return data;
      },
      deleteCar: async (id) => {
        await api.deleteCar(id);
        get().removeCar(id);
      },
      deleteImage: async (carId, imageId) => {
        await api.deleteImage(carId, imageId);
        const car = get().cars.find((c) => c.id === carId);
        if (car)
          get().upsertCar({
            ...car,
            images: car.images.filter((i) => i.id !== imageId),
            updatedAt: new Date().toISOString(),
          });
      },
      resetError: () => set({ error: null }),
      uploadImagesFast: async (id, files, onProgress) => {
        const CONCURRENCY = 3;

        const { data } = await api.prepareImageUploads(
          id,
          files.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          }))
        );

        const uploads = data.uploads;

        let completed = 0;

        const results: typeof uploads = [];

        let nextIndex = 0;

        const worker = async () => {
          while (true) {
            const index = nextIndex++;

            if (index >= uploads.length) {
              return;
            }

            const target = uploads[index];
            const file = files[index];

            const { data, error } = await supabase.storage
              .from("car-images")
              .uploadToSignedUrl(target.path, target.token, file);

            if (error) {
              throw new Error(error.message);
            }

            results[index] = {
              ...target,
              sizeBytes: file.size,
            };

            completed += 1;

            onProgress?.(completed, files.length);
          }
        };

        await Promise.all(
          Array.from(
            {
              length: Math.min(CONCURRENCY, uploads.length),
            },
            () => worker()
          )
        );

        const { data: car } = await api.completeImageUploads(
          id,
          results.map((image) => ({
            path: image.path,
            publicUrl: image.publicUrl,
            originalName: image.originalName,
            mimeType: "image/webp",
            sizeBytes: image.sizeBytes,
            displayOrder: image.displayOrder,
          }))
        );

        get().upsertCar(car);

        return car;
      },
    }),
    {
      name: "carbazar-cache",
      partialize: (s) => ({ cars: s.cars, cacheAt: s.cacheAt }),
    }
  )
);
