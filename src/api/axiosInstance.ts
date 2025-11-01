// src/api/axiosInstance.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api";

export const api = axios.create({ baseURL: API_BASE, withCredentials: true });

/* ----------  CSRF  ---------- */
function xsrfFromCookie(): string | null {
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("XSRF-TOKEN="))
      ?.split("=")[1] ?? null
  );
}

// Attach X-XSRF-TOKEN header to EVERY request if token exists
api.interceptors.request.use((config) => {
  const token = xsrfFromCookie();
  if (token) {
    config.headers["X-XSRF-TOKEN"] = token;
    console.log(
      "📎 Attaching X-XSRF-TOKEN to",
      config.method?.toUpperCase(),
      config.url,
      ":",
      token,
    );
  }
  return config;
});

/* ----------  redirect guard + counter  ---------- */
let failCount = 0;
const MAX_FAILS = 3;
let redirectScheduled = false;

api.interceptors.response.use(
  (res) => {
    failCount = 0;
    return res;
  },
  async (err) => {
    const status = err.response?.status;
    const cfg = err.config;

    // Retry once on 403/401 for non-GET (e.g., stale CSRF)
    if (
      (status === 403 || status === 401) &&
      !cfg._retry &&
      cfg.method !== "get"
    ) {
      cfg._retry = true;
      return api(cfg);
    }

    // Redirect after repeated auth failures
    if ((status === 403 || status === 401) && !redirectScheduled) {
      failCount++;
      if (failCount >= MAX_FAILS) {
        const jwtExists = document.cookie
          .split("; ")
          .some((r) => r.startsWith("jwt="));
        if (!jwtExists) {
          redirectScheduled = true;
          console.warn(`🔐 Redirecting to /login after ${MAX_FAILS} failures…`);
          document.cookie = "jwt=; Max-Age=0; Path=/";
          document.cookie = "XSRF-TOKEN=; Max-Age=0; Path=/";
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(err);
  },
);
