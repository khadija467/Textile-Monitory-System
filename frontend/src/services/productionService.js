import api from "./api";

export const productionService = {
  getAll: (params) => api.get("/production", { params }).then((r) => r.data),
  create: (payload) => api.post("/production", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/production/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/production/${id}`).then((r) => r.data),
  getAnalytics: (range) => api.get("/production/analytics", { params: { range } }).then((r) => r.data),
  getDepartmentPerformance: () => api.get("/production/department-performance").then((r) => r.data),
};
