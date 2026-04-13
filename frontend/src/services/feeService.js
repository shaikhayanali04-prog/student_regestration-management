import api from "./api";

const unwrap = (response) => response?.data?.data;

const feeService = {
  async getLedgers(params = {}) {
    const response = await api.get("/fees", { params });
    return unwrap(response);
  },

  async getMeta() {
    const response = await api.get("/fees", { params: { action: "meta" } });
    return unwrap(response);
  },

  async getLedger(id) {
    const response = await api.get("/fees", { params: { action: "view", id } });
    return unwrap(response);
  },

  async configurePlan(payload) {
    const response = await api.post("/fees?action=configure", payload);
    return unwrap(response);
  },

  async recordPayment(payload) {
    const response = await api.post("/fees?action=pay", payload);
    return unwrap(response);
  },

  async getReceipt(paymentId) {
    const response = await api.get("/fees", {
      params: { action: "receipt", id: paymentId },
    });
    return unwrap(response);
  },
};

export default feeService;
