import { api } from "./axiosInstance";
import type * as dto from "./types";

export const stockApi = {
  // -------- single record --------
  add: (itemId: number, body: dto.AddStockRequest) =>
    api
      .post<dto.MessageResponse>(`/stock/items/${itemId}`, body)
      .then((r) => r.data),

  update: (stockId: number, body: dto.UpdateStockRequest) =>
    api.put<dto.MessageResponse>(`/stock/${stockId}`, body).then((r) => r.data),

  // -------- list / history --------
  list: () => api.get<dto.StockResponse[]>("/stock").then((r) => r.data),

  history: (itemId: number) =>
    api
      .get<dto.StockHistoryResponse>(`/stock/items/${itemId}/history`)
      .then((r) => r.data),
};
