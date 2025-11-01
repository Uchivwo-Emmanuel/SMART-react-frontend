import { api } from "./axiosInstance.ts";
import type { UserDto } from "./types.ts";

export const meApi = {
  me: () => api.get<UserDto>("/auth/me").then((r) => r.data),
};
