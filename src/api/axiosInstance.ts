// src/api/axiosInstance.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
console.log("API_BASE", API_BASE);

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 10000,
});

/* ----------  CSRF TOKEN (stored in memory, NOT cookie)  ---------- */
let csrfToken: string | null = null;

// Initialize CSRF token by calling /api/csrf and reading from response header
export const initCsrf = async (): Promise<void> => {
  try {
    const res = await axios.get(`${API_BASE}/csrf`, { withCredentials: true });
    // Spring sends token in header named "X-XSRF-TOKEN"
    csrfToken = (res.headers["x-xsrf-token"] as string) || null;
    console.log("🔒 CSRF token initialized:", csrfToken ? "✅" : "❌");
  } catch (err) {
    console.warn("⚠️ CSRF init failed – some actions may be blocked", err);
  }
};

// Attach X-XSRF-TOKEN header to every request if available
api.interceptors.request.use((config) => {
  if (csrfToken) {
    config.headers["X-XSRF-TOKEN"] = csrfToken;
    console.log(
      "📎 Attaching X-XSRF-TOKEN to",
      config.method?.toUpperCase(),
      config.url,
      ":",
      csrfToken,
    );
  }
  return config;
});

/* ----------  Redirect guard + retry logic  ---------- */
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

    // Retry once on 403/401 for non-GET (e.g., stale CSRF or session)
    if (
      (status === 403 || status === 401) &&
      !cfg._retry &&
      cfg.method !== "get"
    ) {
      cfg._retry = true;
      // Optional: re-initialize CSRF token on retry (recommended)
      await initCsrf();
      return api(cfg);
    }

    // Redirect after repeated auth failures
    if ((status === 403 || status === 401) && !redirectScheduled) {
      failCount++;
      if (failCount >= MAX_FAILS) {
        // Check if jwt cookie exists (simple heuristic)
        const jwtExists = document.cookie
          .split("; ")
          .some((r) => r.startsWith("jwt="));
        if (!jwtExists) {
          redirectScheduled = true;
          console.warn(`🔐 Redirecting to /login after ${MAX_FAILS} failures…`);
          // Clear auth cookies
          document.cookie = "jwt=; Max-Age=0; Path=/; Secure; SameSite=None";
          document.cookie =
            "XSRF-TOKEN=; Max-Age=0; Path=/; Secure; SameSite=None";
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(err);
  },
);
