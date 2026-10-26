// In local dev: VITE_API_URL is empty, Vite proxy forwards /api → localhost:5000
// In production: VITE_API_URL = https://your-backend.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL || "";

export function apiFetch(path, options = {}) {
  const headers = { ...options.headers };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}
