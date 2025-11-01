// src/api/transactions.ts
import { api } from "./axiosInstance";

// -- PaymentMethod --
export const PaymentMethodDto = {
  CASH: "CASH",
  POS: "POS",
  BANK_TRANSFER: "BANK_TRANSFER",
  MOBILE_MONEY: "MOBILE_MONEY",
  CREDIT_ACCOUNT: "CREDIT_ACCOUNT",
} as const;
export type PaymentMethodDto =
  (typeof PaymentMethodDto)[keyof typeof PaymentMethodDto];

// -- TransactionType --
export const TransactionTypeDto = {
  SALE: "SALE",
  PURCHASE: "PURCHASE",
} as const;
export type TransactionTypeDto =
  (typeof TransactionTypeDto)[keyof typeof TransactionTypeDto];

// -- TransactionStatus --
export const TransactionStatusDto = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type TransactionStatusDto =
  (typeof TransactionStatusDto)[keyof typeof TransactionStatusDto];

// -- Request/Response Models --

export interface TransactionItemRequest {
  itemId: number;
  packType: string;
  quantity: number;
}

export interface PlaceOrderRequest {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod: PaymentMethodDto;
  items: TransactionItemRequest[];
  discountPercentage?: number; // 0–100
  notes?: string;
}

export interface TransactionItemResponse {
  id: number;
  itemName: string;
  packType: string;
  quantity: number; // individual items sold
  packQuantity: number; // number of packs sold
  unitPrice: number; // price per individual item
  lineTotal: number; // quantity * unitPrice
}

/**
 * Full transaction response from backend.
 * Includes `transactionReference` for receipts and tracking.
 */
export interface TransactionResponse {
  id: number;
  transactionReference: string; // ✅ e.g., "TXN-20251101-001"
  transactionType: TransactionTypeDto;
  paymentMethod: PaymentMethodDto;
  status: TransactionStatusDto;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  salesPersonEmail: string;
  items: TransactionItemResponse[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentReference?: string; // e.g., POS auth code, bank ref
  notes?: string;
  createdOn: string; // ISO 8601
  completedOn?: string;
  isActive: boolean;
}

export interface PaginatedTransactionResponse {
  content: TransactionResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ItemPack {
  id: number;
  type: string;
  sellingPrice: number;
  costPrice: number;
  itemQuantityInPack: number;
}

export interface ItemOption {
  id: number;
  name: string;
  packTypes: string[]; // derived from packs (for UI)
  packs: ItemPack[];
  unitPrice: number; // lowest selling price per item
  totalQuantity: number; // total individual items in stock
}

// -- API Endpoints --

export const placeOrder = (payload: PlaceOrderRequest) =>
  api.post<TransactionResponse>("/transactions/place-order", payload);

export const fetchTransactions = (params: {
  page?: number;
  size?: number;
  salesPersonEmail?: string;
  customerEmail?: string;
  paymentMethod?: PaymentMethodDto;
  startDate?: string;
  endDate?: string;
}) => api.get<PaginatedTransactionResponse>("/transactions", { params });

export const fetchItems = () => api.get<ItemOption[]>("/items");
export const fetchItem = (id: number) => api.get<ItemOption>(`/items/${id}`);

// -- Analytics --

export interface PaymentMethodIncome {
  paymentMethod: PaymentMethodDto;
  income: number; // in NGN
}

export interface IncomeByPaymentMethodResponse {
  data: PaymentMethodIncome[];
  grandTotal: number; // in NGN
  currency: string; // e.g., "NGN"
}

export const fetchIncomeByPaymentMethod = (start: string, end: string) =>
  api.get<IncomeByPaymentMethodResponse>(
    "/transactions/income-by-payment-method",
    {
      params: { start, end },
    },
  );
