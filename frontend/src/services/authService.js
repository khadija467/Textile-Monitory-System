import api from "./api";

export const authService = {
  login: (email, password, rememberMe) =>
    api.post("/auth/login", { email, password, rememberMe }).then((r) => r.data),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }).then((r) => r.data),
  getMe: () => api.get("/auth/me").then((r) => r.data),
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
};
