import { getStoredSessionToken } from "../lib/authSession.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const sessionToken = getStoredSessionToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken && !options.headers?.Authorization ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error?.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const apiClient = {
  get(path) {
    return request(path);
  },
  post(path, body) {
    return request(path, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },
  put(path, body) {
    return request(path, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },
  patch(path, body) {
    return request(path, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },
  delete(path) {
    return request(path, {
      method: "DELETE"
    });
  }
};
