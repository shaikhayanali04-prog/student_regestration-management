import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost/coaching-project/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export function getCsrfToken() {
  return localStorage.getItem("erp_csrf_token") || "";
}

apiClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();

  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error?.response?.data;
    const message =
      payload?.message ||
      error?.message ||
      "Something went wrong while contacting the server.";

    const normalizedError = new Error(message);
    normalizedError.status = error?.response?.status || 500;
    normalizedError.errors = payload?.errors || {};
    normalizedError.data = payload?.data || null;

    return Promise.reject(normalizedError);
  }
);

export function unwrapResponse(response) {
  const payload = response?.data ?? response;

  if (!payload?.success) {
    throw new Error(payload?.message || "API request failed.");
  }

  return {
    data: payload.data,
    message: payload.message,
  };
}

export function toFormData(payload = {}) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value) || typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

export function setStoredCsrfToken(token) {
  if (token) {
    localStorage.setItem("erp_csrf_token", token);
  }
}
