import api, { normalizeBackendAssetUrl } from "./api";

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

const normalizeStudent = (student) => {
  if (!student || typeof student !== "object") {
    return student;
  }

  return {
    ...student,
    student_photo: normalizeBackendAssetUrl(student.student_photo),
  };
};

const normalizeStudentCollection = (payload) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (!Array.isArray(payload.items)) {
    return payload;
  }

  return {
    ...payload,
    items: payload.items.map(normalizeStudent),
  };
};

const normalizeStudentRecord = (payload) => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if (!payload.student) {
    return normalizeStudent(payload);
  }

  return {
    ...payload,
    student: normalizeStudent(payload.student),
  };
};

const studentService = {
  async getStudents(params = {}) {
    const response = await api.get("/students", { params });
    return normalizeStudentCollection(unwrap(response));
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
    return normalizeStudentRecord(unwrap(response));
  },

  async createStudent(payload) {
    const response = await api.post("/students?action=add", buildFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return normalizeStudentRecord(unwrap(response));
  },

  async updateStudent(id, payload) {
    const response = await api.post(
      `/students?action=update&id=${id}`,
      buildFormData(payload),
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return normalizeStudentRecord(unwrap(response));
  },

  async deleteStudent(id) {
    const response = await api.post(`/students?action=delete&id=${id}`);
    return unwrap(response);
  },
};

export default studentService;
