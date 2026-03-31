import { apiClient, unwrapResponse } from "./api";

export const courseService = {
  async list() {
    const response = await apiClient.get("/courses/index.php");
    return unwrapResponse(response).data;
  },

  async create(payload) {
    const response = await apiClient.post("/courses/store.php", payload);
    return unwrapResponse(response).data;
  },
};
