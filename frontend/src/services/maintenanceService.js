import api from "./api";

export const maintenanceService = {
  getAll: (params) => api.get("/maintenance", { params }).then((r) => r.data),
  getById: (id) => api.get(`/maintenance/${id}`).then((r) => r.data),
  create: (payload) => api.post("/maintenance", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/maintenance/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/maintenance/${id}`).then((r) => r.data),
};
