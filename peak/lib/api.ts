/**
 * Base URL for the peak-backend API (e.g. http://localhost:3001).
 * Set NEXT_PUBLIC_PEAK_BACKEND_URL in .env.local or leave default for local dev.
 * Must include protocol (http:// or https://) or it will be treated as a relative URL and fail.
 */
function getApiBase(): string {
  const raw =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_PEAK_BACKEND_URL) ||
    "http://localhost:3001";
  const trimmed = (raw || "").trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }
  return `http://${trimmed}`.replace(/\/+$/, "");
}
export const API_BASE = getApiBase();

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const j = JSON.parse(body);
      if (j?.error) message = j.error;
    } catch {
      // use body as message
    }
    throw new Error(message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // For non-JSON responses, return text (caller can type as unknown/string)
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}

/** Same as apiFetch but adds Authorization: Bearer <token>. Use for /api/users/me etc. */
export async function apiFetchWithAuth<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    let message = body;
    try {
      const j = JSON.parse(body);
      if (j?.error) message = j.error;
    } catch {
      // use body as message
    }
    throw new Error(message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}
