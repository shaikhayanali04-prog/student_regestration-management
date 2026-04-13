import api from "./api";

const unwrap = (response) => response?.data?.data;

const dashboardService = {
  async getOverview() {
    const response = await api.get("/dashboard", { params: { action: "overview" } });
    return unwrap(response);
  },
};

export default dashboardService;
