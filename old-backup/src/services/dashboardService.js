import { apiClient, unwrapResponse } from "./api";

export const dashboardService = {
  async getDashboard() {
    const response = await apiClient.get("/dashboard.php");
    return unwrapResponse(response).data;
  },
};
