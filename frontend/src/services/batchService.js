import api from "./api";

const unwrap = (response) => response?.data?.data;

const batchService = {
  async getBatches(params = {}) {
    const response = await api.get("/batches", { params });
    return unwrap(response);
  },

  async getMeta() {
    const response = await api.get("/batches", { params: { action: "meta" } });
    return unwrap(response);
  },

  async getBatch(id) {
    const response = await api.get("/batches", { params: { action: "view", id } });
    return unwrap(response);
  },

  async createBatch(payload) {
    const response = await api.post("/batches?action=add", payload);
    return unwrap(response);
  },

  async updateBatch(id, payload) {
    const response = await api.post(`/batches?action=update&id=${id}`, payload);
    return unwrap(response);
  },

  async deleteBatch(id) {
    const response = await api.post(`/batches?action=delete&id=${id}`);
    return unwrap(response);
  },
};

export default batchService;
