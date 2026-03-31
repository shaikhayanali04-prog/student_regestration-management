import { apiClient, setStoredCsrfToken, unwrapResponse } from "./api";

export const authService = {
  async login(credentials) {
    const response = await apiClient.post("/login.php", credentials);
    const { data, message } = unwrapResponse(response);

    if (data?.csrf_token) {
      setStoredCsrfToken(data.csrf_token);
    }

    return {
      user: data.user,
      message,
    };
  },

  async logout() {
    const response = await apiClient.post("/logout.php");
    const { message } = unwrapResponse(response);
    localStorage.removeItem("erp_csrf_token");
    return { message };
  },

  async me() {
    const response = await apiClient.get("/me.php");
    const { data, message } = unwrapResponse(response);

    if (data?.csrf_token) {
      setStoredCsrfToken(data.csrf_token);
    }

    return {
      user: data.user,
      message,
    };
  },
};
