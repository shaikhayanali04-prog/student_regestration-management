import { apiClient, unwrapResponse } from "./api";

export const attendanceService = {
  async getIndex(date) {
    const response = await apiClient.get("/attendance/index.php", {
      params: date ? { date } : {},
    });
    return unwrapResponse(response).data;
  },

  async save(payload) {
    const response = await apiClient.post("/attendance/store.php", payload);
    return unwrapResponse(response).data;
  },

  async getReport(params = {}) {
    const response = await apiClient.get("/attendance/report.php", { params });
    return unwrapResponse(response).data;
  },
};
