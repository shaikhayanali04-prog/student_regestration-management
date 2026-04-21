import axios from 'axios';

const fallbackApiBaseUrl = 'http://localhost/coaching-project/backend/api';
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl).replace(/\/+$/, "");

const getBrowserOrigin = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "http://localhost";
};

const getBackendOrigin = () => {
  try {
    return new URL(apiBaseUrl, getBrowserOrigin()).origin;
  } catch {
    return getBrowserOrigin();
  }
};

const backendOrigin = getBackendOrigin();
const backendBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

export const normalizeBackendAssetUrl = (value) => {
  if (!value || typeof value !== "string") {
    return value;
  }

  if (
    /^https?:\/\//i.test(value) ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("//")) {
    return `${new URL(backendOrigin).protocol}${value}`;
  }

  if (value.startsWith("/")) {
    return new URL(value, backendOrigin).toString();
  }

  return new URL(value, `${backendBaseUrl}/`).toString();
};

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default api;
