import { apiClient, unwrapResponse } from "./api";

export const reportService = {
  async getFeesReport() {
    const response = await apiClient.get("/reports/fees.php");
    return unwrapResponse(response).data;
  },

  async getAttendanceReport(params = {}) {
    const response = await apiClient.get("/reports/attendance.php", { params });
    return unwrapResponse(response).data;
  },

  async getStudentsReport(params = {}) {
    const response = await apiClient.get("/reports/students.php", { params });
    return unwrapResponse(response).data;
  },
};
