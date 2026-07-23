import api from "./api";

export const machineService = {
  getAll: (params) => api.get("/machines", { params }).then((r) => r.data),
  getById: (id) => api.get(`/machines/${id}`).then((r) => r.data),
  create: (payload) => api.post("/machines", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/machines/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/machines/${id}`).then((r) => r.data),
  getStats: () => api.get("/machines/stats/summary").then((r) => r.data),
};
