import { apiClient, unwrapResponse } from "./api";

export const batchService = {
  async list() {
    const response = await apiClient.get("/batches/index.php");
    return unwrapResponse(response).data;
  },

  async create(payload) {
    const response = await apiClient.post("/batches/store.php", payload);
    return unwrapResponse(response).data;
  },
};
