import { apiClient, unwrapResponse } from "./api";

export const expenseService = {
  async list() {
    const response = await apiClient.get("/expenses/index.php");
    return unwrapResponse(response).data;
  },

  async create(payload) {
    const response = await apiClient.post("/expenses/store.php", payload);
    return unwrapResponse(response).data;
  },
};
