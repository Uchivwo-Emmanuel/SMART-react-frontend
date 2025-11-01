import { api } from "./axiosInstance.ts";

export async function getCsrfToken(): Promise<{
  token: string;
  headerName: string;
}> {
  const { data } = await api.get("/csrf");
  return data; // { token, headerName }
}
