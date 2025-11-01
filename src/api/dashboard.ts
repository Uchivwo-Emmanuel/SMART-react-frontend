// src/api/dashboard.ts
import { api } from "./axiosInstance";
import type { ItemSalesDto } from "./types";

export const dashboardApi = {
  getTopItems: (start: string, end: string) =>
    api
      .get<ItemSalesDto[]>(`/dashboard/top-items`, {
        params: { start, end },
      })
      .then((r) => r.data),

  getBottomItems: (start: string, end: string) =>
    api
      .get<ItemSalesDto[]>(`/dashboard/bottom-items`, {
        params: { start, end },
      })
      .then((r) => r.data),
};
