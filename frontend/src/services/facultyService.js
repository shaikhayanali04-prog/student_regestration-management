import api from "./api";

const unwrap = (response) => response?.data?.data;

const facultyService = {
  async getFaculty(params = {}) {
    const response = await api.get("/faculty", { params });
    return unwrap(response);
  },

  async getMeta() {
    const response = await api.get("/faculty", { params: { action: "meta" } });
    return unwrap(response);
  },

  async getFacultyMember(id) {
    const response = await api.get("/faculty", { params: { action: "view", id } });
    return unwrap(response);
  },

  async createFaculty(payload) {
    const response = await api.post("/faculty?action=add", payload);
    return unwrap(response);
  },

  async updateFaculty(id, payload) {
    const response = await api.post(`/faculty?action=update&id=${id}`, payload);
    return unwrap(response);
  },

  async deleteFaculty(id) {
    const response = await api.post(`/faculty?action=delete&id=${id}`);
    return unwrap(response);
  },
};

export default facultyService;
