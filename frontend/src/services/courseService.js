import api from "./api";

const unwrap = (response) => response?.data?.data;

const courseService = {
  async getCourses(params = {}) {
    const response = await api.get("/courses", { params });
    return unwrap(response);
  },

  async getMeta() {
    const response = await api.get("/courses", { params: { action: "meta" } });
    return unwrap(response);
  },

  async getCourse(id) {
    const response = await api.get("/courses", { params: { action: "view", id } });
    return unwrap(response);
  },

  async createCourse(payload) {
    const response = await api.post("/courses?action=add", payload);
    return unwrap(response);
  },

  async updateCourse(id, payload) {
    const response = await api.post(`/courses?action=update&id=${id}`, payload);
    return unwrap(response);
  },

  async deleteCourse(id) {
    const response = await api.post(`/courses?action=delete&id=${id}`);
    return unwrap(response);
  },
};

export default courseService;
