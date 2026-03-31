import { apiClient, unwrapResponse } from "./api";

export const feeService = {
  async list(params = {}) {
    const response = await apiClient.get("/fees/index.php", { params });
    return unwrapResponse(response).data;
  },

  async getById(id) {
    const response = await apiClient.get("/fees/show.php", {
      params: { id },
    });
    return unwrapResponse(response).data;
  },

  async create(payload) {
    const response = await apiClient.post("/fees/store.php", payload);
    return unwrapResponse(response).data;
  },

  async payInstallment(id, payload) {
    const response = await apiClient.post(`/fees/pay_installment.php?id=${id}`, payload);
    return unwrapResponse(response).data;
  },

  async getReceiptMeta(id) {
    const response = await apiClient.get("/fees/receipt.php", {
      params: { id },
    });
    return unwrapResponse(response).data;
  },

  getReceiptDownloadUrl(id) {
    return `${apiClient.defaults.baseURL}/fees/receipt.php?id=${id}&download=1`;
  },
};
