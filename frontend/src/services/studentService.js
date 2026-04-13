import api from "./api";

const buildFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

const unwrap = (response) => response?.data?.data;

const studentService = {
  async getStudents(params = {}) {
    const response = await api.get("/students", { params });
    return unwrap(response);
  },

  async getMeta() {
    const response = await api.get("/students", {
      params: { action: "meta" },
    });
    return unwrap(response);
  },

  async getStudent(id) {
    const response = await api.get("/students", {
      params: { action: "view", id },
    });
    return unwrap(response);
  },

  async createStudent(payload) {
    const response = await api.post("/students?action=add", buildFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return unwrap(response);
  },

  async updateStudent(id, payload) {
    const response = await api.post(
      `/students?action=update&id=${id}`,
      buildFormData(payload),
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return unwrap(response);
  },

  async deleteStudent(id) {
    const response = await api.post(`/students?action=delete&id=${id}`);
    return unwrap(response);
  },
};

export default studentService;
