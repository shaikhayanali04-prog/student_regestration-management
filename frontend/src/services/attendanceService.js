import api from "./api";

const unwrap = (response) => response?.data?.data;

const attendanceService = {
  async getMeta() {
    const response = await api.get("/attendance", { params: { action: "meta" } });
    return unwrap(response);
  },

  async getAttendance(params = {}) {
    const response = await api.get("/attendance", { params });
    return unwrap(response);
  },

  async getSheet(batchId, date) {
    const response = await api.get("/attendance", {
      params: { action: "sheet", batch_id: batchId, date },
    });
    return unwrap(response);
  },

  async saveSheet(payload) {
    const response = await api.post("/attendance?action=mark", payload);
    return unwrap(response);
  },

  async getReport(params = {}) {
    const response = await api.get("/attendance", {
      params: { action: "report", ...params },
    });
    return unwrap(response);
  },
};

export default attendanceService;
