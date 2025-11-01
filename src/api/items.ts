// src/api/itemsApi.ts
import { api } from "./axiosInstance";
import type * as dto from "./types";

export const itemsApi = {
  // ------ CRUD ------
  list: () => api.get<dto.ItemResponse[]>("/items").then((r) => r.data),
  get: (id: number) =>
    api.get<dto.ItemResponse>(`/items/${id}`).then((r) => r.data),
  create: (itemData: dto.ItemCreateRequest, imageFile?: File) => {
    const formData = new FormData();
    formData.append("itemData", JSON.stringify(itemData));
    if (imageFile) {
      formData.append("image", imageFile);
    }
    return api
      .post<dto.ItemResponse>("/items", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // axios sets boundary automatically
        },
      })
      .then((r) => r.data);
  },
  update: (id: number, body: dto.UpdateItemRequest) =>
    api.put<dto.ItemResponse>(`/items/${id}`, body).then((r) => r.data),
  delete: (id: number) => api.delete<void>(`/items/${id}`).then((r) => r.data),

  // ------ IMAGE ------
  uploadImage: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api
      .post<{ imageUrl: string }>(`/items/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.imageUrl);
  },

  // ------ STOCK ------
  addStock: (id: number, body: dto.AddQuantityRequest) =>
    api
      .post<dto.MessageResponse>(`/stock/items/${id}`, body)
      .then((r) => r.data),
};
