const pendingControllers: Set<AbortController> = new Set();

export function abortPendingRequests() {
  pendingControllers.forEach((c) => {
    try {
      c.abort();
    } catch {
      // ignore
    }
  });
  pendingControllers.clear();
}

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const controller = new AbortController();
  pendingControllers.add(controller);

  try {
    // Merge headers and ensure we always use the latest token from localStorage
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("faan_token")
        : null;
    const mergedHeaders = {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as Record<string, string>;

    const res = await fetch(input, {
      ...init,
      headers: mergedHeaders,
      signal: controller.signal,
    });
    return res;
  } finally {
    pendingControllers.delete(controller);
  }
}
