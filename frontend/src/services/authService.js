import api from "./api";

const unwrap = (response) => response?.data?.data;
const normalizeLoginPayload = (payload = {}) => ({
  identifier: typeof payload.identifier === "string" ? payload.identifier.trim() : "",
  password: typeof payload.password === "string" ? payload.password : "",
});

const authService = {
  async login(payload) {
    const response = await api.post("/auth?action=login", normalizeLoginPayload(payload));
    return unwrap(response);
  },

  async loginWithGoogle(credential) {
    const response = await api.post("/auth?action=google-login", {
      credential: typeof credential === "string" ? credential.trim() : "",
    });
    return unwrap(response);
  },

  async me() {
    const response = await api.get("/auth?action=me");
    return unwrap(response);
  },

  async logout() {
    const response = await api.post("/auth?action=logout");
    return unwrap(response);
  },
};

export default authService;
