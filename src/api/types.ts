import BigNumber from "bignumber.js";

// ---------- AUTH ----------
export interface LoginRequest {
  email: string;
  password: string;
}
export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
export interface MessageResponse {
  message: string;
}
export interface SignupResponse {
  message: string;
  email: string;
}

export interface UserDto {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string; // ← used by Sidebar
  fullName: string;
}

// ---------- ITEM ----------
export interface ItemCreateRequest {
  name: string;
  imageUrl?: string | null; // ← optional, though typically set via file upload
  packs?: ItemPackCreateRequest[];
}

export interface ItemPackCreateRequest {
  type: string;
  itemQuantityInPack: number;
  costPrice: BigNumber.Value;
  sellingPrice: BigNumber.Value;
}

export interface UpdateItemRequest {
  name: string;
  imageUrl?: string | null; // ← allow updating image URL directly (optional)
  active?: boolean;
  packs: UpdateItemPackRequest[];
}

export interface UpdateItemPackRequest {
  id: number; // 0 = new pack; >0 = existing pack
  type: string;
  itemQuantityInPack: number;
  costPrice: BigNumber.Value;
  sellingPrice: BigNumber.Value;
  deleted?: boolean; // optional; defaults to false
}

export interface AddQuantityRequest {
  packType: string;
  quantityToAdd: number;
}

// ---------- RESPONSE ----------
export interface ItemPackResponse {
  id: number;
  type: string;
  itemQuantityInPack: number;
  costPrice: string;
  sellingPrice: string;
}

export interface ItemResponse {
  id: number;
  name: string;
  totalQuantity: number;
  active: boolean;
  imageUrl: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  packs: ItemPackResponse[];
}

// ---------- STOCK ----------
export interface AddStockRequest {
  packType: string;
  packsToAdd: number;
  supplySource?: string;
  notes?: string;
}
export interface UpdateStockRequest {
  packType: string;
  packsToAdd: number;
  supplySource?: string;
  notes?: string;
}
export interface StockResponse {
  id: number;
  itemId: number;
  itemName: string;
  packId: number;
  packType: string;
  packsAdded: number;
  totalItemsAdded: number;
  costPriceAtTime: string;
  sellingPriceAtTime: string;
  supplySource?: string;
  createdBy: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn?: string;
  notes?: string;
  isActive: boolean;
}
export interface StockHistoryResponse {
  stockRecords: StockResponse[];
  totalStockAdded: number;
  lastUpdated?: string;
}
export interface ItemSalesDto {
  itemId: number;
  itemName: string;
  totalQuantitySold: number;
  totalRevenue: string; // BigDecimal as string
}
