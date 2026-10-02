export type FuelType =
  | "PETROL"
  | "DIESEL"
  | "CNG"
  | "ELECTRIC"
  | "HYBRID"
  | "LPG";
export type Transmission = "MANUAL" | "AUTOMATIC" | "AMT" | "CVT" | "DCT";
export type CarStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "INACTIVE";
export type OwnerType = "INDIVIDUAL" | "COMPANY" | "OTHER";
export type InsuranceType =
  | "COMPREHENSIVE"
  | "THIRD_PARTY"
  | "ZERO_DEP"
  | "NONE";
export type DocumentType =
  | "RC"
  | "INSURANCE"
  | "PUC"
  | "SERVICE_HISTORY"
  | "OTHER";

export interface CarImage {
  id: string;
  storagePath: string;
  publicUrl: string;
  originalName?: string | null;
  mimeType: string;
  sizeBytes: number;
  displayOrder: number;
  createdAt?: string;
}
export interface Car {
  id: string;
  brand: string;
  model: string;
  variant?: string | null;
  year: number;
  price: number;
  kmDriven: number;
  fuelType: FuelType;
  transmission: Transmission;
  ownerCount: number;
  location: string;
  description?: string | null;
  registrationNumber?: string | null;
  registrationState?: string | null;
  color?: string | null;
  ownerType: OwnerType;
  rcAvailable: boolean;
  rcTransferAvailable: boolean;
  originalRcAvailable: boolean;
  rcNotes?: string | null;
  insuranceAvailable: boolean;
  insuranceType?: InsuranceType | null;
  insuranceValidUntil?: string | null;
  insuranceCompany?: string | null;
  insurancePolicyNumber?: string | null;
  pucAvailable: boolean;
  pucValidUntil?: string | null;
  buyerFinanceAvailable: boolean;
  existingFinance: boolean;
  financeCompany?: string | null;
  financeOutstanding?: number | null;
  financeClosed: boolean;
  serviceHistoryAvailable: boolean;
  serviceHistoryNotes?: string | null;
  lastServiceDate?: string | null;
  lastServiceKm?: number | null;
  accidentHistory: boolean;
  accidentHistoryNotes?: string | null;
  conditionNotes?: string | null;
  warrantyAvailable: boolean;
  warrantyValidUntil?: string | null;
  warrantyNotes?: string | null;
  status: CarStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  images: CarImage[];
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
}
export interface Enquiry {
  id: string;
  carId?: string | null;
  customerName: string;
  phone: string;
  message?: string | null;
  createdAt: string;
  car?: Pick<Car, "id" | "brand" | "model" | "variant" | "price"> | null;
}
export interface Document {
  id: string;
  carId: string;
  documentType: DocumentType;
  storagePath: string;
  originalName?: string | null;
  mimeType: string;
  sizeBytes: number;
  documentNumber?: string | null;
  validUntil?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  signedUrl: string;
}
export interface Paginated<T> {
  data: T[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}
