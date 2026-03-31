import { apiClient, toFormData, unwrapResponse } from "./api";

export const studentService = {
  async list(params = {}) {
    const response = await apiClient.get("/students/index.php", { params });
    return unwrapResponse(response).data;
  },

  async getById(id) {
    const response = await apiClient.get("/students/show.php", {
      params: { id },
    });
    return unwrapResponse(response).data;
  },

  async create(payload) {
    const response = await apiClient.post("/students/store.php", toFormData(payload), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return unwrapResponse(response).data;
  },

  async update(id, payload) {
    const response = await apiClient.post(
      `/students/update.php?id=${id}`,
      toFormData(payload),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return unwrapResponse(response).data;
  },

  async remove(id) {
    const response = await apiClient.post(`/students/delete.php?id=${id}`);
    return unwrapResponse(response);
  },
};
