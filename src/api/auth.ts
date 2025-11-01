import { api } from "./axiosInstance";
import type * as dto from "./types";

export const authApi = {
  login: (body: dto.LoginRequest) =>
    api.post<dto.MessageResponse>("/auth/login", body).then((r) => r.data),

  /**
   * multipart signup – payload can contain a file
   */
  signup: (form: dto.SignupRequest & { profilePicture?: File }) => {
    const fd = new FormData();
    fd.append("email", form.email);
    fd.append("password", form.password);
    if (form.firstName) fd.append("firstName", form.firstName);
    if (form.lastName) fd.append("lastName", form.lastName);
    if (form.phoneNumber) fd.append("phoneNumber", form.phoneNumber);
    if (form.profilePicture) fd.append("profilePicture", form.profilePicture);

    return api
      .post<dto.SignupResponse>("/auth/signup", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  logout: () =>
    api.post<dto.MessageResponse>("/auth/logout").then((r) => r.data),
};
